"""API routes for Feature 2: Evidence Requests"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.investigation import EvidenceRequest
from app.schemas.investigation import (
    EvidenceRequestSchema, EvidenceRequestCreate, EvidenceRequestPatch,
)
from app.agent.adapter import HindsightAdapter
from app.services.investigation_memory import InvestigationMemoryService
from app.services.evidence_request import EvidenceRequestService

router = APIRouter()
_adapter = HindsightAdapter()
_memory = InvestigationMemoryService(_adapter)
_service = EvidenceRequestService(_memory)


def _run_id(db: Session, deal_id: str) -> str:
    from app.api.endpoints.evidence import _run_id as _rid
    return _rid(db, deal_id)


def _bank_id(run_id: str, deal_id: str) -> str:
    return f"demo_{run_id}_{deal_id}"


@router.post("/issues/{issue_id}/evidence-request", response_model=EvidenceRequestSchema)
async def create_evidence_request(
    issue_id: str, req: EvidenceRequestCreate = None, db: Session = Depends(get_db),
):
    from app.models.domain import Issue
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    run_id = _run_id(db, issue.deal_id)
    bid = _bank_id(run_id, issue.deal_id)
    body = req or EvidenceRequestCreate(issue_id=issue_id)
    return await _service.generate_evidence_request(
        db, run_id, bid, issue_id, body.change_review_id, body.generated_by,
    )


@router.get("/issues/{issue_id}/evidence-requests", response_model=List[EvidenceRequestSchema])
def list_evidence_requests(issue_id: str, db: Session = Depends(get_db)):
    reqs = db.query(EvidenceRequest).filter(
        EvidenceRequest.issue_id == issue_id,
    ).order_by(EvidenceRequest.created_at.desc()).all()
    return [EvidenceRequestSchema.model_validate(r) for r in reqs]


@router.patch("/evidence-requests/{request_id}", response_model=EvidenceRequestSchema)
async def patch_evidence_request(
    request_id: str, patch: EvidenceRequestPatch, db: Session = Depends(get_db),
):
    req = db.query(EvidenceRequest).filter(EvidenceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    from app.models.domain import Issue
    issue = db.query(Issue).filter(Issue.id == req.issue_id).first()
    
    run_id = _run_id(db, issue.deal_id)
    bid = _bank_id(run_id, issue.deal_id)
    if patch.status and patch.status not in ("requested", "received", "insufficient", "resolved", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    return await _service.update_request_status(
        db, bid, request_id, patch.status, patch.outcome_note,
    )
