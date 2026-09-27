"""API routes for Feature 1: Change Reviews (What Changed?)"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.investigation import ChangeReview
from app.schemas.investigation import (
    ChangeReviewSchema, ManualCompareRequest, AIReviewRequest,
)
from app.agent.adapter import HindsightAdapter
from app.services.investigation_memory import InvestigationMemoryService
from app.services.change_review import ChangeReviewService

router = APIRouter()
_adapter = HindsightAdapter()
_memory = InvestigationMemoryService(_adapter)
_service = ChangeReviewService(_memory)


def _run_id(db: Session, deal_id: str) -> str:
    from app.api.endpoints.evidence import _run_id as _rid
    return _rid(db, deal_id)


def _bank_id(run_id: str, deal_id: str) -> str:
    return f"demo_{run_id}_{deal_id}"


@router.post("/change-reviews/manual", response_model=ChangeReviewSchema)
def create_manual_review(req: ManualCompareRequest, db: Session = Depends(get_db)):
    from app.models.domain import Document
    doc = db.query(Document).filter(Document.id == req.document_ids[0]).first()
    run_id = _run_id(db, doc.deal_id)
    return _service.create_manual_review(
        db, run_id, req.document_ids, req.period_from, req.period_to, req.note,
    )


@router.post("/change-reviews/ai")
async def create_ai_review(req: AIReviewRequest, db: Session = Depends(get_db)):
    from app.models.domain import Document
    doc = db.query(Document).filter(Document.id == req.trigger_document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    run_id = _run_id(db, doc.deal_id)
    bid = _bank_id(run_id, doc.deal_id)
    result = await _service.create_ai_review(
        db, run_id, bid, req.trigger_document_id, req.memory_enabled,
    )
    return result


@router.get("/deals/{deal_id}/change-reviews", response_model=List[ChangeReviewSchema])
def list_change_reviews(deal_id: str, db: Session = Depends(get_db)):
    run_id = _run_id(db, deal_id)
    reviews = db.query(ChangeReview).filter(ChangeReview.run_id == run_id).order_by(ChangeReview.created_at.desc()).all()
    return [ChangeReviewSchema.model_validate(r) for r in reviews]


@router.get("/change-reviews/{review_id}", response_model=ChangeReviewSchema)
def get_change_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(ChangeReview).filter(ChangeReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="ChangeReview not found")
    return ChangeReviewSchema.model_validate(review)
