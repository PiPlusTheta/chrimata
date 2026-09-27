from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.session import get_db
from app.models.domain import Claim, Issue, Review
from app.schemas.domain import MemoryStatusUpdate
from app.services.evidence import EvidenceService

router = APIRouter()

@router.get("/knowledge", response_model=Dict[str, Any])
def get_agent_knowledge(db: Session = Depends(get_db)):
    claims = db.query(Claim).all()
    issues = db.query(Issue).all()
    
    calc_arr = EvidenceService.calculate_annualised_arr(1200000, "2026-04-01", ["doc_2"])
    calc_runway = EvidenceService.calculate_simple_runway(7200000, 1800000, "2026-04-01", ["doc_3"])
    calc_proposed = EvidenceService.calculate_proposed_runway(7200000, 10800000, 1800000, "2026-04-01", ["doc_4"])
    
    return {
        "claims": [c.id for c in claims],
        "issues": [i.id for i in issues],
        "calculations": [
            calc_arr.model_dump(),
            calc_runway.model_dump(),
            calc_proposed.model_dump()
        ]
    }

@router.post("/reviews/{review_id}/memory-status")
def update_memory_status(review_id: str, status_update: MemoryStatusUpdate, db: Session = Depends(get_db)):
    if status_update.memory_status not in ["retained", "failed"]:
        raise HTTPException(status_code=400, detail="Invalid memory status")
        
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    review.memory_status = status_update.memory_status
    db.commit()
    return {"status": "success", "memory_status": review.memory_status}
