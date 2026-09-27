from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from app.db.session import get_db
from app.models.domain import Document, Claim, Issue, Review, DemoRun
from app.schemas.domain import (
    DocumentSchema, ClaimSchema, IssueSchema, ReviewSchema, ReviewCreate,
    CalculationSchema, SummarySchema, MemoryStatusUpdate, SourceRef,
)
from app.db.seed import reset_db, event
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


def _calculations(db: Session) -> List[CalculationSchema]:
    active_mrr = _claim_paise(db, "claim-active-mrr-apr")
    cash = _claim_paise(db, "claim-cash-q1")
    burn = _claim_paise(db, "claim-burn-q1")
    financing = _claim_paise(db, "claim-financing-proposed-jun")
    reported_mrr = _claim_paise(db, "claim-mrr-jul")
    churned = _claim_paise(db, "claim-churn-jul")

    return [
        EvidenceService.calculate_annualised_arr(active_mrr, _claim_source(db, "claim-active-mrr-apr"), "2026-04-01"),
        EvidenceService.calculate_simple_runway(cash, _claim_source(db, "claim-cash-q1"), burn, _claim_source(db, "claim-burn-q1"), "2026-04-01"),
        EvidenceService.calculate_proposed_runway(
            cash, _claim_source(db, "claim-cash-q1"),
            financing, _claim_source(db, "claim-financing-proposed-jun"),
            burn, _claim_source(db, "claim-burn-q1"),
            "2026-06-30",
        ),
        EvidenceService.calculate_inferred_post_churn_mrr(
            reported_mrr, _claim_source(db, "claim-mrr-jul"),
            churned, _claim_source(db, "claim-churn-jul"),
            "2026-07-05",
        ),
    ]


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


@router.post("/deals/demo/documents", response_model=DocumentSchema)
def add_document(doc: DocumentSchema, db: Session = Depends(get_db)):
    """Controlled new-document ingestion for the live demo (e.g. a July billing ledger)."""
    if db.query(Document).filter(Document.id == doc.id).first():
        _err(409, "already_exists", f"Document {doc.id} already exists")
    db_doc = Document(**doc.model_dump())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


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


@router.patch("/reviews/{review_id}/memory-status", response_model=ReviewSchema)
def update_memory_status(review_id: str, status_update: MemoryStatusUpdate, db: Session = Depends(get_db)):
    """Idempotent handshake: Nitesh's agent calls this once Hindsight has (or has
    failed to) retain a review. The review row was already committed by
    POST /issues/{id}/reviews, so a failed Hindsight call never loses the decision."""
    if status_update.memory_status not in ("retained", "failed"):
        _err(400, "invalid_memory_status", "memory_status must be 'retained' or 'failed'")

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        _err(404, "not_found", "Review not found")

    review.memory_status = status_update.memory_status
    db.commit()
    db.refresh(review)
    return review


@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    run_id = reset_db(db)
    return {"message": "Demo reset successfully", "run_id": run_id}
