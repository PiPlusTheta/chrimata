from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
from dotenv import load_dotenv

load_dotenv()

from app.api.router import api_router
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed import reset_db
from app.models.domain import Document
from app.models.investigation import ChangeReview, EvidenceRequest, DecisionReceipt  # noqa: F401 — creates tables

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chrimata API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        body = {"error": detail}
    else:
        body = {"error": {"code": "http_error", "message": str(detail)}}
    return JSONResponse(status_code=exc.status_code, content=body)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"error": {"code": "validation_error", "message": str(exc.errors())}})


@app.on_event("startup")
def startup_event():
    # Seed only if empty, so restarts / --reload don't wipe analyst review history.
    # Use POST /api/demo/reset for an explicit, repeatable reseed.
    db = SessionLocal()
    try:
        if db.query(Document).count() == 0:
            reset_db(db)
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to Chrimata API"}
