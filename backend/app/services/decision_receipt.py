"""DecisionReceiptService — creates auditable receipts for analyst decisions,
tracks Hindsight retention status, and records recall usage."""
import uuid
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.domain import Issue, Review, Claim
from app.models.investigation import DecisionReceipt
from app.schemas.investigation import DecisionReceiptSchema
from app.services.investigation_memory import InvestigationMemoryService


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


DECISION_MAP = {
    "resolve": "resolved",
    "accept_explanation": "resolved",
    "dispute": "rejected",
    "request_evidence": "needs_more_evidence",
}


class DecisionReceiptService:

    def __init__(self, memory_service: InvestigationMemoryService):
        self.memory_service = memory_service

    def create_receipt(
        self, db: Session, run_id: str, issue_id: str, review_id: str,
    ) -> DecisionReceiptSchema:
        """Creates a DecisionReceipt when an analyst makes a decision."""
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise ValueError(f"Review {review_id} not found")

        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            raise ValueError(f"Issue {issue_id} not found")

        # Check for existing receipt (idempotent)
        existing = db.query(DecisionReceipt).filter(DecisionReceipt.review_id == review_id).first()
        if existing:
            return DecisionReceiptSchema.model_validate(existing)

        # Build decision text with full context
        claim = db.query(Claim).filter(Claim.id == issue.claim_id).first()
        decision_text = self._build_decision_text(issue, review, claim)

        source_refs = []
        for src in (issue.evidence_for or []):
            source_refs.append(src)
        for src in (issue.evidence_against or []):
            source_refs.append(src)

        receipt = DecisionReceipt(
            id=f"dr_{uuid.uuid4().hex[:10]}",
            run_id=run_id,
            issue_id=issue_id,
            review_id=review_id,
            decision_text=decision_text,
            decision_type=DECISION_MAP.get(review.decision, "resolved"),
            analyst_note=review.explanation,
            source_refs=source_refs,
            retention_status="pending",
            created_at=_now(),
        )
        db.add(receipt)
        db.commit()
        db.refresh(receipt)
        return DecisionReceiptSchema.model_validate(receipt)

    async def retain_decision(
        self, db: Session, bank_id: str, receipt_id: str,
    ) -> DecisionReceiptSchema:
        """Retains the decision in Hindsight and updates the receipt."""
        receipt = db.query(DecisionReceipt).filter(DecisionReceipt.id == receipt_id).first()
        if not receipt:
            raise ValueError(f"DecisionReceipt {receipt_id} not found")

        if receipt.retention_status == "retained":
            return DecisionReceiptSchema.model_validate(receipt)

        issue = db.query(Issue).filter(Issue.id == receipt.issue_id).first()
        claim = db.query(Claim).filter(Claim.id == issue.claim_id).first() if issue else None

        metrics = [claim.metric] if claim else []
        period = claim.as_of_date if claim else ""

        success = await self.memory_service.retain_decision(
            bank_id, document_id=receipt.review_id,
            text=receipt.decision_text,
            entity="Northstar Ops",
            issue_id=receipt.issue_id,
            metrics=metrics, period=period,
            decision=receipt.decision_type,
            review_id=receipt.review_id,
        )

        receipt.retention_status = "retained" if success else "failed"
        if success:
            receipt.retained_at = _now()
        db.commit()
        db.refresh(receipt)
        return DecisionReceiptSchema.model_validate(receipt)

    def record_recall(self, db: Session, receipt_id: str) -> None:
        """Records that this decision was recalled by a subsequent investigation."""
        receipt = db.query(DecisionReceipt).filter(DecisionReceipt.id == receipt_id).first()
        if receipt:
            receipt.last_recalled_at = _now()
            receipt.recall_count = (receipt.recall_count or 0) + 1
            db.commit()

    def _build_decision_text(self, issue: Issue, review: Review, claim: Optional[Claim]) -> str:
        """Builds a rich decision text with enough context for future recall."""
        parts = [f"Northstar Ops: {issue.question}"]
        if claim:
            parts.append(f"Claim: {claim.original_text} (as of {claim.as_of_date})")
            if claim.definition:
                parts.append(f"Definition: {claim.definition}")
        parts.append(f"Analyst decision: {review.decision}")
        parts.append(f"Explanation: {review.explanation}")

        if review.decision in ("resolve", "accept_explanation"):
            parts.append(
                "Future changes to current MRR should not automatically reopen this "
                "definition issue unless evidence contradicts the explanation."
            )
        return "\n".join(parts)
