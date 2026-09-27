from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from decimal import Decimal

from app.db.session import get_db
from app.models.domain import Document, Claim, Issue, Review, DemoRun
from app.schemas.domain import (
    DocumentSchema, ClaimSchema, IssueSchema, ReviewSchema, ReviewCreate,
    CalculationSchema, SummarySchema, MemoryStatusUpdate, SourceRef,
    DocumentIngestRequest, DocumentIngestResponse,
)
from app.db.seed import reset_db, event, introduce_july_evidence
from app.services.evidence import EvidenceService

router = APIRouter()

DECISIONS = {"accept_explanation", "request_evidence", "dispute", "resolve"}
DECISION_TO_STATUS = {
    "accept_explanation": "explained",
    "request_evidence": "open",
    "dispute": "reopened",
    "resolve": "resolved",
}


def _err(status_code: int, code: str, message: str):
    raise HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _run_id(db: Session) -> str:
    row = db.query(DemoRun).filter(DemoRun.id == "demo").first()
    return row.run_id if row else "unknown"


def _claim_paise(db: Session, claim_id: str) -> int:
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim or claim.stated_amount_paise is None:
        _err(500, "seed_data_missing", f"Expected numeric claim {claim_id} not found")
    return claim.stated_amount_paise


def _claim_source(db: Session, claim_id: str) -> SourceRef:
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    return SourceRef(**claim.sources[0])


def _optional_claim_paise(db: Session, claim_id: str):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    return claim.stated_amount_paise if claim else None


def _calculations(db: Session) -> List[CalculationSchema]:
    active_mrr = _claim_paise(db, "claim-active-mrr-apr")
    cash = _claim_paise(db, "claim-cash-q1")
    burn = _claim_paise(db, "claim-burn-q1")
    financing = _claim_paise(db, "claim-financing-proposed-jun")

    calcs = [
        EvidenceService.calculate_annualised_arr(active_mrr, _claim_source(db, "claim-active-mrr-apr"), "2026-04-01"),
        EvidenceService.calculate_simple_runway(cash, _claim_source(db, "claim-cash-q1"), burn, _claim_source(db, "claim-burn-q1"), "2026-04-01"),
        EvidenceService.calculate_proposed_runway(
            cash, _claim_source(db, "claim-cash-q1"),
            financing, _claim_source(db, "claim-financing-proposed-jun"),
            burn, _claim_source(db, "claim-burn-q1"),
            "2026-06-30",
        ),
    ]

    # July MRR / churn claims only exist once introduce_july_evidence() has run —
    # before that, this calculation simply isn't available yet (not an error).
    reported_mrr = _optional_claim_paise(db, "claim-mrr-jul")
    churned = _optional_claim_paise(db, "claim-churn-jul")
    if reported_mrr is not None and churned is not None:
        calcs.append(EvidenceService.calculate_inferred_post_churn_mrr(
            reported_mrr, _claim_source(db, "claim-mrr-jul"),
            churned, _claim_source(db, "claim-churn-jul"),
            "2026-07-05",
        ))
    return calcs


@router.get("/deals/demo/summary", response_model=SummarySchema)
def get_summary(db: Session = Depends(get_db)):
    doc_count = db.query(Document).count()
    open_issues = db.query(Issue).filter(Issue.status.in_(["open", "reopened"])).count()
    return SummarySchema(
        company_name="Northstar Ops",
        run_id=_run_id(db),
        document_count=doc_count,
        open_issue_count=open_issues,
        metrics=_calculations(db),
    )


@router.get("/deals/demo/documents", response_model=List[DocumentSchema])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()


@router.get("/deals/demo/documents/{document_id}", response_model=DocumentSchema)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        _err(404, "not_found", "Document not found")
    return doc


DISCREPANCY_THRESHOLD = Decimal("0.05")  # >5% difference on the same metric triggers an issue


def _amount_display(amount_paise) -> str:
    if amount_paise is None:
        return "n/a"
    return f"₹{(Decimal(amount_paise) / Decimal(100)):,.0f}"


def _maybe_open_issue_for_new_claim(db: Session, new_claim: Claim, doc_title: str) -> Issue | None:
    """Deterministic conflict detection: if a newly-ingested claim's amount differs
    materially from the most recent prior claim on the same metric, opens a new
    Issue automatically. This generalizes what used to be a hardcoded July-only
    flow to any document a judge/analyst introduces live — Niloy's evidence engine
    decides whether a new issue is opened, never the agent (per CONTRACTS.md §5)."""
    if new_claim.stated_amount_paise is None:
        return None  # only numeric claims are compared; qualitative (stated_months) claims are skipped

    prior = (
        db.query(Claim)
        .filter(Claim.metric == new_claim.metric, Claim.id != new_claim.id, Claim.stated_amount_paise.isnot(None))
        .order_by(Claim.as_of_date.desc(), Claim.created_at.desc())
        .first()
    )
    if not prior:
        return None

    old, new = Decimal(prior.stated_amount_paise), Decimal(new_claim.stated_amount_paise)
    if old == 0:
        return None
    delta_ratio = abs(new - old) / old
    if delta_ratio <= DISCREPANCY_THRESHOLD:
        return None

    if db.query(Issue).filter(Issue.claim_id == new_claim.id).first():
        return None  # already have an issue for this claim (re-ingestion guard)

    issue_id = f"issue-auto-{uuid.uuid4().hex[:8]}"
    new_source = SourceRef(**new_claim.sources[0]).model_dump()
    prior_source = SourceRef(**prior.sources[0]).model_dump()
    issue = Issue(
        id=issue_id, claim_id=new_claim.id, status="open",
        question=(
            f"'{doc_title}' states {new_claim.metric} of {_amount_display(new_claim.stated_amount_paise)} "
            f"as of {new_claim.as_of_date}, but an earlier claim on the same metric ({prior.original_text!r}, "
            f"as of {prior.as_of_date}) stated {_amount_display(prior.stated_amount_paise)} "
            f"({delta_ratio * 100:.0f}% difference). Is there a discrepancy?"
        ),
        evidence_for=[new_source], evidence_against=[prior_source],
        history=[event("opened", f"Auto-opened: {new_claim.metric} claim changed by {delta_ratio * 100:.0f}% on new evidence.", [new_claim.sources[0]["document_id"], prior.sources[0]["document_id"]])],
        suggested_request="Ask for clarification or an updated source document reconciling the two figures.",
    )
    db.add(issue)
    return issue


@router.post("/deals/demo/documents", response_model=DocumentIngestResponse)
def add_document(payload: DocumentIngestRequest, db: Session = Depends(get_db)):
    """Controlled new-document ingestion for the live demo. Optionally accepts
    `claims` to create alongside the document — any claim whose amount differs
    materially from a prior claim on the same metric automatically opens a new
    Issue (see _maybe_open_issue_for_new_claim)."""
    if db.query(Document).filter(Document.id == payload.id).first():
        _err(409, "already_exists", f"Document {payload.id} already exists")

    doc_fields = payload.model_dump(exclude={"claims"})
    db_doc = Document(**doc_fields)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    claims_created, issues_opened = [], []
    for c in payload.claims:
        if db.query(Claim).filter(Claim.id == c.id).first():
            _err(409, "already_exists", f"Claim {c.id} already exists")
        db_claim = Claim(
            id=c.id, metric=c.metric, original_text=c.original_text,
            stated_amount_paise=c.stated_amount_paise, stated_months=c.stated_months,
            as_of_date=c.as_of_date, definition=c.definition, status=c.status,
            sources=[{"document_id": payload.id, "locator": c.locator, "quote": c.quote}],
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        claims_created.append(db_claim.id)

        issue = _maybe_open_issue_for_new_claim(db, db_claim, payload.title)
        if issue:
            db.commit()
            issues_opened.append(issue.id)

    return DocumentIngestResponse(document=db_doc, claims_created=claims_created, issues_opened=issues_opened)


@router.get("/deals/demo/claims", response_model=List[ClaimSchema])
def get_claims(db: Session = Depends(get_db)):
    return db.query(Claim).all()


@router.get("/claims/{claim_id}", response_model=ClaimSchema)
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        _err(404, "not_found", "Claim not found")
    return claim


@router.get("/deals/demo/calculations", response_model=List[CalculationSchema])
def get_calculations(db: Session = Depends(get_db)):
    return _calculations(db)


@router.get("/deals/demo/issues", response_model=List[IssueSchema])
def get_issues(db: Session = Depends(get_db)):
    return db.query(Issue).all()


@router.get("/issues/{issue_id}/reviews", response_model=List[ReviewSchema])
def get_reviews(issue_id: str, db: Session = Depends(get_db)):
    if not db.query(Issue).filter(Issue.id == issue_id).first():
        _err(404, "not_found", "Issue not found")
    return db.query(Review).filter(Review.issue_id == issue_id).order_by(Review.reviewed_at).all()


@router.get("/reviews/{review_id}", response_model=ReviewSchema)
def get_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        _err(404, "not_found", "Review not found")
    return review


@router.post("/issues/{issue_id}/reviews", response_model=ReviewSchema)
def add_review(issue_id: str, review: ReviewCreate, db: Session = Depends(get_db)):
    """Records an analyst's decision as an immutable event and advances the issue's
    status. Committed before Hindsight is ever contacted — see PATCH
    /reviews/{id}/memory-status for the follow-up handshake."""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        _err(404, "not_found", "Issue not found")

    if review.decision not in DECISIONS:
        _err(400, "invalid_decision", f"decision must be one of {sorted(DECISIONS)}")
    if not review.explanation.strip():
        _err(400, "empty_explanation", "explanation must not be empty")

    if issue_id == "issue-arr-apr" and review.decision == "resolve":
        prior_accept = db.query(Review).filter(
            Review.issue_id == issue_id, Review.decision == "accept_explanation"
        ).first()
        if not prior_accept:
            _err(409, "resolution_not_ready",
                 "issue-arr-apr can only be resolved after an accept_explanation review has been recorded")

    review_id = f"rev_{uuid.uuid4().hex[:8]}"
    reviewed_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    db_review = Review(
        id=review_id, issue_id=issue_id, decision=review.decision,
        explanation=review.explanation, reviewed_at=reviewed_at,
        reviewer=review.reviewer, memory_status="pending",
    )
    db.add(db_review)

    new_status = DECISION_TO_STATUS[review.decision]
    issue.status = new_status
    history = list(issue.history or [])
    kind = "resolved" if new_status == "resolved" else ("reopened" if new_status == "reopened" else "reviewed")
    history.append(event(kind, f"Review {review_id} recorded decision '{review.decision}'.", []))
    issue.history = history

    db.commit()
    db.refresh(db_review)
    return db_review


def set_review_memory_status(db: Session, review_id: str, memory_status: str) -> Review:
    """Single validated write path for memory_status. Used by the PATCH endpoint below
    AND importable directly by Nitesh's agent module, so the agent never has to run
    its own raw ORM write against Niloy's `reviews` table."""
    if memory_status not in ("retained", "failed"):
        _err(400, "invalid_memory_status", "memory_status must be 'retained' or 'failed'")
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        _err(404, "not_found", "Review not found")
    review.memory_status = memory_status
    db.commit()
    db.refresh(review)
    return review


@router.patch("/reviews/{review_id}/memory-status", response_model=ReviewSchema)
def update_memory_status(review_id: str, status_update: MemoryStatusUpdate, db: Session = Depends(get_db)):
    """Idempotent handshake: Nitesh's agent calls this once Hindsight has (or has
    failed to) retain a review. The review row was already committed by
    POST /issues/{id}/reviews, so a failed Hindsight call never loses the decision."""
    return set_review_memory_status(db, review_id, status_update.memory_status)


@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    run_id = reset_db(db)
    return {"message": "Demo reset successfully", "run_id": run_id}


@router.get("/deals/demo/report")
def get_report(db: Session = Depends(get_db)):
    """A deterministic (no LLM) markdown diligence report: every claim, every issue
    with its full review history, and the current calculations — the same DB facts
    the rest of the API exposes, just assembled into one downloadable document."""
    from fastapi.responses import PlainTextResponse

    claims = db.query(Claim).order_by(Claim.as_of_date).all()
    issues = db.query(Issue).all()
    calcs = _calculations(db)
    run_id = _run_id(db)

    lines = [f"# Chrimata Diligence Report — Northstar Ops", "", f"_Run: {run_id}_", ""]

    lines.append("## Calculations")
    for c in calcs:
        value = _amount_display(c.amount_paise) if c.amount_paise is not None else f"{c.months} months"
        lines.append(f"- **{c.metric}** ({c.status}): {value} — `{c.formula}` as of {c.as_of_date}")
        for a in c.assumptions:
            lines.append(f"  - assumption: {a}")
    lines.append("")

    lines.append("## Claims")
    for cl in claims:
        val = _amount_display(cl.stated_amount_paise) if cl.stated_amount_paise is not None else (cl.stated_months or "n/a")
        lines.append(f"- **{cl.metric}** = {val} as of {cl.as_of_date} ({cl.status}) — \"{cl.original_text}\"")
    lines.append("")

    lines.append("## Issues")
    for iss in issues:
        lines.append(f"### {iss.id} — {iss.status}")
        lines.append(iss.question)
        if iss.suggested_request:
            lines.append(f"> Suggested next step: {iss.suggested_request}")
        reviews = db.query(Review).filter(Review.issue_id == iss.id).order_by(Review.reviewed_at).all()
        if reviews:
            lines.append("")
            lines.append("| Reviewed at | Decision | Explanation | Memory status |")
            lines.append("|---|---|---|---|")
            for r in reviews:
                lines.append(f"| {r.reviewed_at} | {r.decision} | {r.explanation} | {r.memory_status} |")
        lines.append("")

    return PlainTextResponse("\n".join(lines), media_type="text/markdown")


@router.post("/deals/demo/introduce-july-evidence")
def introduce_july(db: Session = Depends(get_db)):
    """Live-demo trigger: reveals the July documents/claims and opens issue-mrr-jul.
    Idempotent — calling it again after it already ran is a harmless no-op, so the
    'Add July Evidence' button can't create duplicates."""
    return introduce_july_evidence(db)
