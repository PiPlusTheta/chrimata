from fastapi import APIRouter
from app.api.endpoints import evidence

api_router = APIRouter()
api_router.include_router(evidence.router, prefix="", tags=["Evidence"])

# Nitesh: mount your own agent router here, e.g.
#   from app.api.endpoints import agent
#   api_router.include_router(agent.router, prefix="/agent", tags=["Agent"])
# /api/agent/* is entirely yours per CONTRACTS.md — nothing here uses that prefix.
# Your agent reads evidence directly via the public /api/deals/demo/*, /api/claims/*,
# /api/issues/*, /api/reviews/* endpoints above (all read-only, real source citations).
