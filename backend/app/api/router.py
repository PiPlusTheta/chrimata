from fastapi import APIRouter
from app.api.endpoints import evidence, agent, change_reviews, evidence_requests, decision_receipts

api_router = APIRouter()
api_router.include_router(evidence.router, prefix="", tags=["Evidence"])
api_router.include_router(agent.router, prefix="/agent", tags=["Agent"])
api_router.include_router(change_reviews.router, prefix="", tags=["Change Reviews"])
api_router.include_router(evidence_requests.router, prefix="", tags=["Evidence Requests"])
api_router.include_router(decision_receipts.router, prefix="", tags=["Decision Receipts"])
