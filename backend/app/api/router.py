from fastapi import APIRouter
from app.api.endpoints import evidence, agent

api_router = APIRouter()
api_router.include_router(evidence.router, prefix="", tags=["Evidence"])
api_router.include_router(agent.router, prefix="/agent", tags=["Agent"])
