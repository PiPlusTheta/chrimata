"""Models for the three new features: What Changed, Evidence Requests, Decision Receipts."""
from sqlalchemy import Column, BigInteger, String, Text, JSON, Integer, Boolean
from app.db.base import Base


class ChangeReview(Base):
    """Central record for Feature 1: Memory-Aware "What Changed?"
    Tracks both manual comparisons and AI-driven reviews of new evidence."""
    __tablename__ = "change_reviews"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, index=True)
    session_id = Column(String, nullable=True)

    mode = Column(String)  # manual | agent
    trigger_type = Column(String)  # manual_compare | new_document | manual_ai_review

    trigger_document_id = Column(String, nullable=True)
    comparison_document_ids = Column(JSON, default=list)  # list[str]

    period_from = Column(String, nullable=True)
    period_to = Column(String, nullable=True)

    entity_id = Column(String, nullable=True)

    summary = Column(Text)

    author_type = Column(String)  # human | agent

    finding_status = Column(String)  # fact | calculated | inference | conditional

    detected_changes = Column(JSON, default=list)  # list of change objects

    affected_claim_ids = Column(JSON, default=list)
    affected_issue_ids = Column(JSON, default=list)
    unaffected_issue_ids = Column(JSON, default=list)
    created_issue_ids = Column(JSON, default=list)

    memory_ids_used = Column(JSON, default=list)  # list[str]
    memory_context_summary = Column(Text, nullable=True)

    source_refs = Column(JSON, default=list)

    created_at = Column(String)
    updated_at = Column(String)

    supersedes_review_id = Column(String, nullable=True)


class EvidenceRequest(Base):
    """Feature 2: Learned Evidence Requests — tracks what evidence is needed,
    what was received, and whether it was sufficient."""
    __tablename__ = "evidence_requests"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, index=True)

    issue_id = Column(String, index=True)
    change_review_id = Column(String, nullable=True)

    request_text = Column(Text)
    reason = Column(Text)

    requested_fields = Column(JSON, default=list)  # list of field names
    requested_period = Column(String, nullable=True)
    requested_entity = Column(String, nullable=True)
    requested_document_type = Column(String, nullable=True)

    status = Column(String, default="requested")  # requested | received | insufficient | resolved | cancelled

    generated_by = Column(String)  # human | agent

    memory_ids_used = Column(JSON, default=list)
    source_refs = Column(JSON, default=list)

    created_at = Column(String)
    received_at = Column(String, nullable=True)
    resolved_at = Column(String, nullable=True)

    outcome_note = Column(Text, nullable=True)


class DecisionReceipt(Base):
    """Feature 3: Decision Receipt + Memory Replay — an auditable record of
    what the analyst decided, whether it was retained in Hindsight, and
    whether it was later recalled by a subsequent investigation."""
    __tablename__ = "decision_receipts"

    id = Column(String, primary_key=True, index=True)
    run_id = Column(String, index=True)

    issue_id = Column(String, index=True)
    review_id = Column(String, unique=True, index=True)

    decision_text = Column(Text)
    decision_type = Column(String)  # resolved | rejected | conditional | needs_more_evidence

    analyst_note = Column(Text, nullable=True)
    source_refs = Column(JSON, default=list)

    retention_status = Column(String, default="pending")  # pending | retained | failed
    hindsight_memory_id = Column(String, nullable=True)

    retained_at = Column(String, nullable=True)
    last_recalled_at = Column(String, nullable=True)
    recall_count = Column(Integer, default=0)

    created_at = Column(String)
