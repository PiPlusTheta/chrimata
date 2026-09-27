from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.domain import Document, Claim, Issue, Review
from app.schemas.domain import DocumentSchema, ClaimSchema, IssueSchema, ReviewSchema, ReviewCreate
from app.db.seed import reset_db

router = APIRouter()

@router.get("/deals/demo/summary")
def get_summary(db: Session = Depends(get_db)):
    docs = db.query(Document).count()
    claims = db.query(Claim).count()
    issues = db.query(Issue).count()
    return {"documents": docs, "claims": claims, "issues": issues}

@router.get("/deals/demo/documents", response_model=List[DocumentSchema])
def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@router.post("/deals/demo/documents", response_model=DocumentSchema)
def add_document(doc: DocumentSchema, db: Session = Depends(get_db)):
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
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.get("/deals/demo/issues", response_model=List[IssueSchema])
def get_issues(db: Session = Depends(get_db)):
    return db.query(Issue).all()

@router.get("/issues/{issue_id}/reviews", response_model=List[ReviewSchema])
def get_reviews(issue_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.issue_id == issue_id).all()

@router.post("/issues/{issue_id}/reviews", response_model=ReviewSchema)
def add_review(issue_id: str, review: ReviewCreate, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    review_id = f"rev_{str(uuid.uuid4())[:8]}"
    db_review = Review(
        id=review_id,
        issue_id=issue_id,
        decision=review.decision,
        explanation=review.explanation,
        reviewed_at=datetime.utcnow().isoformat() + "Z",
        reviewer=review.reviewer,
        memory_status="pending"
    )
    db.add(db_review)
    issue.status = review.decision
    db.commit()
    db.refresh(db_review)
    return db_review

@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    reset_db(db)
    return {"message": "Demo reset successfully"}
