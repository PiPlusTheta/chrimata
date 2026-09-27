from sqlalchemy import Column, BigInteger, String, Text, JSON, ForeignKey, Boolean
from app.db.base import Base


class Deal(Base):
    """One row per seeded company/mandate. Replaces the old single-row DemoRun —
    the app now supports many concurrent deals, each with its own run_id (for
    Hindsight memory scoping) so resetting the whole demo gives every deal a fresh,
    non-leaking memory scope in one step."""
    __tablename__ = "deals"
    id = Column(String, primary_key=True)  # slug, e.g. "northstar", "kinetix-bio"
    name = Column(String)
    industry = Column(String, nullable=True)
    stage = Column(String, nullable=True)  # e.g. "Series A", "Seed Extension"
    synthetic = Column(Boolean, default=True)
    run_id = Column(String)
    created_at = Column(String)


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    deal_id = Column(String, index=True)
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
    deal_id = Column(String, index=True)
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
    deal_id = Column(String, index=True)
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


class ChatSession(Base):
    """A real, persisted Ask Chrimata conversation — not client-side state. Scoped to
    a run_id so a demo reset naturally orphans old sessions the same way it clears
    Hindsight memory (both are keyed off run_id)."""
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, index=True)
    deal_id = Column(String, index=True)
    title = Column(String)
    created_at = Column(String)
    updated_at = Column(String)


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), index=True)
    role = Column(String)  # user | agent | system
    text = Column(Text)
    context = Column(JSON, nullable=True)  # List[RecalledContext] for agent messages
    uncertainties = Column(JSON, nullable=True)
    suggested_next_question = Column(Text, nullable=True)
    created_at = Column(String)
