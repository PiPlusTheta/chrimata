from sqlalchemy import Column, BigInteger, String, Text, JSON, ForeignKey, Boolean
from app.db.base import Base


class DemoRun(Base):
    """Single-row table holding the current run_id, so a reset can hand Nitesh's
    Hindsight integration a fresh scope without leaking memory across demo runs."""
    __tablename__ = "demo_runs"
    id = Column(String, primary_key=True)  # always "demo"
    run_id = Column(String)


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, default="demo")
    title = Column(String)
    type = Column(String)
    version = Column(String)
    document_date = Column(String)
    period_start = Column(String, nullable=True)
    period_end = Column(String, nullable=True)
    ingested_at = Column(String)
    content = Column(Text)
    source_url = Column(String, nullable=True)
    synthetic = Column(Boolean, default=True)


class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, default="demo")
    metric = Column(String)
    original_text = Column(Text)
    stated_amount_paise = Column(BigInteger, nullable=True)  # Integer overflows past ~₹21.5L; use BigInteger
    stated_months = Column(String, nullable=True)
    as_of_date = Column(String)
    definition = Column(Text, nullable=True)
    status = Column(String)  # claimed | calculated | inferred | conditional
    sources = Column(JSON)  # List[SourceRef]
    created_at = Column(String, nullable=True)  # insertion-order tiebreak when as_of_date ties (see evidence.py)


class Issue(Base):
    __tablename__ = "issues"
    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, default="demo")
    claim_id = Column(String, ForeignKey("claims.id"))
    status = Column(String)  # open | explained | resolved | reopened
    question = Column(Text)
    evidence_for = Column(JSON)  # List[SourceRef]
    evidence_against = Column(JSON)  # List[SourceRef]
    history = Column(JSON, default=list)  # List[IssueEvent] — append-only
    suggested_request = Column(Text, nullable=True)


class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True, index=True)
    issue_id = Column(String, ForeignKey("issues.id"))
    decision = Column(String)  # accept_explanation | request_evidence | dispute | resolve
    explanation = Column(Text)
    reviewed_at = Column(String)
    reviewer = Column(String)
    memory_status = Column(String)  # pending | retained | failed
