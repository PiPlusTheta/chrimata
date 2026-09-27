from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.models.domain import Review, Issue, Document
from app.schemas.agent import (
    AnalyzeRequest, AnalyzeResponse,
    AskRequest, AgentAnswer,
    RetainReviewRequest, RetainReviewResponse,
    NewSessionRequest, NewSessionResponse,
    ReflectRequest, ReflectResponse,
)
from app.agent.service import AgentService
from app.agent.adapter import HindsightAdapter

from app.schemas.domain import IssueSchema

router = APIRouter()
agent_service = AgentService()
hindsight_adapter = HindsightAdapter()

def _get_bank_id(run_id: str, deal_id: str) -> str:
    return f"demo_{run_id}_{deal_id}"

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
