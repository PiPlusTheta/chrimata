"""API routes for Feature 3: Decision Receipts + Memory Replay"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.investigation import DecisionReceipt
from app.schemas.investigation import (
    DecisionReceiptSchema, MemoryReplayRequest, MemoryReplayResponse,
)
from app.agent.adapter import HindsightAdapter
from app.services.investigation_memory import InvestigationMemoryService
from app.services.decision_receipt import DecisionReceiptService
from app.services.change_review import ChangeReviewService
from app.services.memory_replay import MemoryReplayService

router = APIRouter()
_adapter = HindsightAdapter()
_memory = InvestigationMemoryService(_adapter)
_receipt_service = DecisionReceiptService(_memory)
_change_service = ChangeReviewService(_memory)
_replay_service = MemoryReplayService(_change_service)


def _run_id(db: Session, deal_id: str) -> str:
    from app.api.endpoints.evidence import _run_id as _rid
    return _rid(db, deal_id)


def _bank_id(run_id: str, deal_id: str) -> str:
    return f"demo_{run_id}_{deal_id}"


@router.get("/issues/{issue_id}/decision-receipt", response_model=DecisionReceiptSchema)
def get_decision_receipt(issue_id: str, db: Session = Depends(get_db)):
    receipt = db.query(DecisionReceipt).filter(
        DecisionReceipt.issue_id == issue_id,
    ).order_by(DecisionReceipt.created_at.desc()).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="No decision receipt found for this issue")
    return DecisionReceiptSchema.model_validate(receipt)


@router.post("/issues/{issue_id}/decision-receipt/retry-retention", response_model=DecisionReceiptSchema)
async def retry_retention(issue_id: str, db: Session = Depends(get_db)):
    receipt = db.query(DecisionReceipt).filter(
        DecisionReceipt.issue_id == issue_id,
    ).order_by(DecisionReceipt.created_at.desc()).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="No decision receipt found")
        
    from app.models.domain import Issue
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    run_id = _run_id(db, issue.deal_id)
    bid = _bank_id(run_id, issue.deal_id)
    return await _receipt_service.retain_decision(db, bid, receipt.id)


@router.post("/issues/{issue_id}/memory-replay", response_model=MemoryReplayResponse)
async def memory_replay(
    issue_id: str, req: MemoryReplayRequest, db: Session = Depends(get_db),
):
    from app.models.domain import Issue
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    run_id = _run_id(db, issue.deal_id)
    bid = _bank_id(run_id, issue.deal_id)

    # Determine the trigger document
    trigger_doc_id = req.trigger_document_id
    if not trigger_doc_id:
        # Default: use the most recent document related to this issue's claim
        from app.models.domain import Issue, Claim, Document
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        # Use the evidence_against document as trigger (it's the new evidence)
        if issue.evidence_against:
            trigger_doc_id = issue.evidence_against[0].get("document_id")
        elif issue.evidence_for:
            trigger_doc_id = issue.evidence_for[0].get("document_id")
        else:
            raise HTTPException(status_code=400, detail="No trigger document available for replay")

    return await _replay_service.replay(db, run_id, bid, trigger_doc_id)
