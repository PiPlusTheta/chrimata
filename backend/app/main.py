from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.router import api_router
from app.db.base import Base
from app.db.session import engine
from app.db.seed import reset_db
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

# Create DB tables
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

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    reset_db(db)
    db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Chrimata API"}
