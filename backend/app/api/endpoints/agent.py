import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.models.domain import Review, Issue, Document, Claim, ChatSession, ChatMessage
from app.schemas.agent import (
    AnalyzeRequest, AnalyzeResponse,
    AskRequest, AgentAnswer,
    RetainReviewRequest, RetainReviewResponse,
    NewSessionRequest, NewSessionResponse,
    ReflectRequest, ReflectResponse,
    ChatSessionCreate, ChatSessionSchema, ChatSessionDetail, ChatSessionRename,
    ChatMessageSchema, ChatMessageCreate,
)
from app.agent.service import AgentService
from app.agent.adapter import HindsightAdapter

from app.schemas.domain import IssueSchema

router = APIRouter()
agent_service = AgentService()
hindsight_adapter = HindsightAdapter()

def _get_bank_id(run_id: str, deal_id: str) -> str:
    return f"demo_{run_id}_{deal_id}"

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _session_out(s: ChatSession, db: Session) -> ChatSessionSchema:
    count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
    return ChatSessionSchema(
        id=s.id, run_id=s.run_id, deal_id=s.deal_id, title=s.title,
        created_at=s.created_at, updated_at=s.updated_at, message_count=count,
    )

def _message_out(m: ChatMessage) -> ChatMessageSchema:
    return ChatMessageSchema(
        id=m.id, session_id=m.session_id, role=m.role, text=m.text,
        context=m.context or [], uncertainties=m.uncertainties or [],
        suggested_next_question=m.suggested_next_question, created_at=m.created_at,
    )

def _gather_evidence(db: Session, deal_id: str, question: str):
    from app.api.endpoints.evidence import _calculations
    issues = db.query(Issue).filter(Issue.deal_id == deal_id).all()
    claims = db.query(Claim).filter(Claim.deal_id == deal_id).all()
    documents = db.query(Document).filter(Document.deal_id == deal_id).all()
    reviews = db.query(Review).join(Issue, Review.issue_id == Issue.id).filter(Issue.deal_id == deal_id).all()
    metrics = _calculations(db)
    terms = {word.lower() for word in question.split() if len(word) > 3}
    ranked_documents = sorted(documents, key=lambda d: sum(term in (d.title + " " + d.content).lower() for term in terms), reverse=True)
    return {
        "company_name": "Northstar Ops" if deal_id == "demo" else deal_id,
        "issues": [IssueSchema.model_validate(i).model_dump(mode="json") for i in issues],
        "metrics": [m.model_dump(mode="json") for m in metrics],
        "claims": [{"id": c.id, "metric": c.metric, "original_text": c.original_text, "stated_amount_paise": c.stated_amount_paise, "stated_months": c.stated_months, "as_of_date": c.as_of_date, "status": c.status, "sources": c.sources} for c in claims],
        "documents": [{"id": d.id, "title": d.title, "type": d.type, "document_date": d.document_date, "content": d.content[:3000]} for d in ranked_documents[:8]],
        "reviews": [{"id": r.id, "issue_id": r.issue_id, "decision": r.decision, "explanation": r.explanation, "reviewed_at": r.reviewed_at, "memory_status": r.memory_status} for r in reviews],
    }

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, db: Session = Depends(get_db)):
    from app.api.endpoints.evidence import _run_id, _calculations
    run_id = _run_id(db)

    # Gather evidence
    issues = db.query(Issue).all()
    metrics = _calculations(db)

    evidence = {
        "issues": [IssueSchema.model_validate(i).model_dump(mode="json") for i in issues],
        "metrics": [m.model_dump(mode="json") for m in metrics]
    }

    # Recall memory from Hindsight
    bank_id = _get_bank_id(run_id, req.deal_id)
    memory = await hindsight_adapter.recall(bank_id, "Analyze context")

    answer = agent_service.analyze(req.deal_id, req.session_id, evidence, memory)

    return AnalyzeResponse(
        answer=answer,
        suggested_issues=[]
    )

@router.post("/ask", response_model=AgentAnswer)
async def ask(req: AskRequest, db: Session = Depends(get_db)):
    from app.api.endpoints.evidence import _run_id, _calculations
    run_id = _run_id(db)

    issues = db.query(Issue).all()
    metrics = _calculations(db)

    evidence = {
        "issues": [IssueSchema.model_validate(i).model_dump(mode="json") for i in issues],
        "metrics": [m.model_dump(mode="json") for m in metrics]
    }

    bank_id = _get_bank_id(run_id, req.deal_id)
    memory = await hindsight_adapter.recall(bank_id, req.question)

    answer = agent_service.ask(req.deal_id, req.session_id, req.question, evidence, memory)
    return answer

@router.post("/retain-review", response_model=RetainReviewResponse)
async def retain_review(req: RetainReviewRequest, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == req.review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.memory_status == "retained":
        # Idempotent: don't re-call Hindsight for an already-retained review.
        return RetainReviewResponse(status="retained")

    from app.api.endpoints.evidence import _run_id
    run_id = _run_id(db)
    bank_id = _get_bank_id(run_id, "demo")

    meta = {
        "review_id": review.id,
        "issue_id": review.issue_id,
        "decision": review.decision,
        "deal_id": "demo",
        "run_id": run_id,
        "timestamp": str(review.reviewed_at),
        "author_role": review.reviewer
    }

    success = await hindsight_adapter.retain_review(bank_id, document_id=review.id, text=review.explanation, meta=meta)

    # Reuse Niloy's validated write path instead of setting review.memory_status
    # directly here — this is the one place that mutates that column, whether the
    # caller is the PATCH endpoint or this route.
    from app.api.endpoints.evidence import set_review_memory_status
    updated = set_review_memory_status(db, review.id, "retained" if success else "failed")

    return RetainReviewResponse(status=updated.memory_status)

@router.post("/new-session", response_model=NewSessionResponse)
def new_session(req: NewSessionRequest):
    new_session_id = f"sess_{uuid.uuid4().hex[:8]}"
    return NewSessionResponse(session_id=new_session_id)

@router.post("/reflect", response_model=ReflectResponse)
async def reflect(req: ReflectRequest, db: Session = Depends(get_db)):
    """Synthesizes a markdown summary of what this investigation has learned so
    far, from Hindsight's consolidated memory — distinct from /ask, which mixes
    live DB evidence with memory. This is purely "what does memory itself say",
    so an empty/unavailable Hindsight bank must say so, never fabricate a summary."""
    if not hindsight_adapter.is_available():
        return ReflectResponse(available=False, reason="Hindsight is not configured in this environment")

    from app.api.endpoints.evidence import _run_id
    run_id = _run_id(db)
    bank_id = _get_bank_id(run_id, req.deal_id)
    query = req.query or "Summarize everything learned across this investigation so far: resolved discrepancies, open questions, and how they were explained."

    text = await hindsight_adapter.reflect(bank_id, query)
    if text is None:
        return ReflectResponse(available=False, reason="Hindsight reflect call failed or returned nothing")
    return ReflectResponse(available=True, text=text)


# --- Real, DB-persisted chat sessions for Ask Chrimata ---
# These are genuinely stored (chat_sessions / chat_messages tables), not client-side
# state — a page refresh, a different tab, or a server restart all see the same
# sessions and history.

@router.post("/sessions", response_model=ChatSessionSchema)
def create_chat_session(req: ChatSessionCreate, db: Session = Depends(get_db)):
    from app.api.endpoints.evidence import _run_id
    run_id = _run_id(db)
    now = _now()
    session = ChatSession(
        id=f"chat_{uuid.uuid4().hex[:10]}", run_id=run_id, deal_id=req.deal_id,
        title="New conversation", created_at=now, updated_at=now,
    )
    db.add(session)
    db.commit()
    return _session_out(session, db)


@router.get("/sessions", response_model=list[ChatSessionSchema])
def list_chat_sessions(db: Session = Depends(get_db)):
    from app.api.endpoints.evidence import _run_id
    run_id = _run_id(db)
    sessions = db.query(ChatSession).filter(ChatSession.run_id == run_id).order_by(ChatSession.updated_at.desc()).all()
    return [_session_out(s, db) for s in sessions]


@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
def get_chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    from app.api.endpoints.evidence import _run_id
    if not session or session.run_id != _run_id(db):
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Session not found"})
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    base = _session_out(session, db)
    return ChatSessionDetail(**base.model_dump(), messages=[_message_out(m) for m in messages])


@router.patch("/sessions/{session_id}", response_model=ChatSessionSchema)
def rename_chat_session(session_id: str, req: ChatSessionRename, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    from app.api.endpoints.evidence import _run_id
    if not session or session.run_id != _run_id(db):
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Session not found"})
    session.title = req.title.strip()[:80] or session.title
    session.updated_at = _now()
    db.commit()
    return _session_out(session, db)


@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    from app.api.endpoints.evidence import _run_id
    if not session or session.run_id != _run_id(db):
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Session not found"})
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"deleted": True}


@router.post("/sessions/{session_id}/stream")
async def stream_chat_message(session_id: str, payload: ChatMessageCreate, db: Session = Depends(get_db)):
    """Server-Sent Events: `state` events reflect the real request lifecycle
    (searching evidence/memory -> solving), `token` events are literal streamed
    text from the model, and a final `done` event carries the persisted message
    (with recalled_context). The user message is persisted immediately, before any
    LLM call, so an interrupted stream never loses what was asked."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Session not found"})
    from app.api.endpoints.evidence import _run_id
    run_id = _run_id(db)
    question = payload.question
    regenerate = payload.regenerate
    if session.run_id != run_id:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Session not found in current run"})

    if regenerate:
        latest = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc()).first()
        if latest and latest.role == "agent":
            db.delete(latest)
            db.commit()
        latest_user = db.query(ChatMessage).filter(ChatMessage.session_id == session_id, ChatMessage.role == "user").order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc()).first()
        if not latest_user:
            raise HTTPException(status_code=400, detail={"code": "no_turn", "message": "No user turn to regenerate"})
        question = latest_user.text
    elif not question.strip():
        raise HTTPException(status_code=400, detail={"code": "empty_question", "message": "question must not be empty"})

    if not regenerate:
        user_msg = ChatMessage(
            id=f"msg_{uuid.uuid4().hex[:10]}", session_id=session_id, role="user",
            text=question, created_at=_now(),
        )
        db.add(user_msg)
        if session.title == "New conversation":
            session.title = question.strip()[:60]
        session.updated_at = _now()
        db.commit()

    prior = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    history = [{"role": m.role, "text": m.text} for m in prior if m.role in ("user", "agent") and m.id != (latest_user.id if regenerate else user_msg.id)]

    evidence = _gather_evidence(db, session.deal_id, question)
    bank_id = _get_bank_id(run_id, session.deal_id)

    async def event_stream():
        def sse(event: str, data) -> str:
            payload = json.dumps(data)
            return f"event: {event}\ndata: {payload}\n\n"

        yield sse("state", "searching")
        memory = await hindsight_adapter.recall(bank_id, question)
        context_payload = []
        for m in memory:
            meta = getattr(m, "metadata", None) or {}
            context_payload.append({
                "review_id": meta.get("review_id"),
                "memory_id": getattr(m, "id", None),
                "summary": getattr(m, "text", "") or "",
                "source_ids": [getattr(m, "document_id", None)] if getattr(m, "document_id", None) else [],
            })

        yield sse("state", "solving")
        full_text = ""
        try:
            for chunk in agent_service.ask_stream(question, evidence, memory, history):
                full_text += chunk
                yield sse("token", chunk)
        except Exception:
            yield sse("error", "xAI could not complete this response. Retry the turn.")
            return
        if not full_text.strip():
            yield sse("error", "xAI returned an empty response. Retry the turn.")
            return

        agent_msg = ChatMessage(
            id=f"msg_{uuid.uuid4().hex[:10]}", session_id=session_id, role="agent",
            text=full_text, context=context_payload, uncertainties=[], suggested_next_question=None,
            created_at=_now(),
        )
        db.add(agent_msg)
        session.updated_at = _now()
        db.commit()

        yield sse("done", _message_out(agent_msg).model_dump())

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })
