"""Pydantic schemas for the three new features."""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any


# ── Provenance: every significant statement must declare its epistemic status ──

class ProvenanceStatement(BaseModel):
    """A single statement with its epistemic classification and sources."""
    statement: str
    type: str  # fact | calculated | inference | conditional | memory_derived
    source_ids: List[str] = []
    memory_ids: List[str] = []


# ── Feature 1: ChangeReview ──

class DetectedChange(BaseModel):
    type: str  # metric_change | text_change | definition_change | new_evidence | customer_churn
    statement: str
    source_ids: List[str] = []
    previous_value: Optional[str] = None
    current_value: Optional[str] = None


class AffectedClaim(BaseModel):
    claim_id: str
    effect: str  # potentially_invalidated | confirmed | unchanged


class AffectedIssue(BaseModel):
    issue_id: str
    effect: str  # reopened | unchanged | resolved
    reason: str


class UnaffectedIssue(BaseModel):
    issue_id: str
    reason: str


class NewIssue(BaseModel):
    title: str
    status: str = "open"


class MemoryUsed(BaseModel):
    memory_id: str
    reason: str


class ChangeReviewSchema(BaseModel):
    id: str
    run_id: str
    session_id: Optional[str] = None
    mode: str  # manual | agent
    trigger_type: str  # manual_compare | new_document | manual_ai_review
    trigger_document_id: Optional[str] = None
    comparison_document_ids: List[str] = []
    period_from: Optional[str] = None
    period_to: Optional[str] = None
    entity_id: Optional[str] = None
    summary: str
    author_type: str  # human | agent
    finding_status: str  # fact | calculated | inference | conditional
    detected_changes: List[DetectedChange] = []
    affected_claim_ids: List[str] = []
    affected_issue_ids: List[str] = []
    unaffected_issue_ids: List[str] = []
    created_issue_ids: List[str] = []
    memory_ids_used: List[str] = []
    memory_context_summary: Optional[str] = None
    source_refs: List[Any] = []
    created_at: str
    updated_at: str
    supersedes_review_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Request / Response schemas

class ManualCompareRequest(BaseModel):
    document_ids: List[str]
    period_from: Optional[str] = None
    period_to: Optional[str] = None
    note: Optional[str] = None


class AIReviewRequest(BaseModel):
    trigger_document_id: str
    memory_enabled: bool = True


class AIReviewOutput(BaseModel):
    """Structured output contract from the AI change review."""
    summary: str
    changes: List[DetectedChange] = []
    affected_claims: List[AffectedClaim] = []
    affected_issues: List[AffectedIssue] = []
    unaffected_issues: List[UnaffectedIssue] = []
    new_issues: List[NewIssue] = []
    memory_used: List[MemoryUsed] = []
    finding_status: str = "inference"


# ── Feature 2: Evidence Requests ──

class EvidenceRequestSchema(BaseModel):
    id: str
    run_id: str
    issue_id: str
    change_review_id: Optional[str] = None
    request_text: str
    reason: str
    requested_fields: List[str] = []
    requested_period: Optional[str] = None
    requested_entity: Optional[str] = None
    requested_document_type: Optional[str] = None
    status: str  # requested | received | insufficient | resolved | cancelled
    generated_by: str  # human | agent
    memory_ids_used: List[str] = []
    source_refs: List[Any] = []
    created_at: str
    received_at: Optional[str] = None
    resolved_at: Optional[str] = None
    outcome_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EvidenceRequestCreate(BaseModel):
    issue_id: str
    change_review_id: Optional[str] = None
    generated_by: str = "agent"


class EvidenceRequestPatch(BaseModel):
    status: Optional[str] = None
    outcome_note: Optional[str] = None


# ── Feature 3: Decision Receipts ──

class DecisionReceiptSchema(BaseModel):
    id: str
    run_id: str
    issue_id: str
    review_id: str
    decision_text: str
    decision_type: str  # resolved | rejected | conditional | needs_more_evidence
    analyst_note: Optional[str] = None
    source_refs: List[Any] = []
    retention_status: str  # pending | retained | failed
    hindsight_memory_id: Optional[str] = None
    retained_at: Optional[str] = None
    last_recalled_at: Optional[str] = None
    recall_count: int = 0
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class DecisionReceiptRetryRequest(BaseModel):
    pass  # no body needed


# ── Feature 3: Memory Replay ──

class MemoryReplayRequest(BaseModel):
    trigger_document_id: Optional[str] = None
    comparison_period: Optional[str] = None


class ReplayResult(BaseModel):
    """One side of the replay (with or without memory)."""
    summary: str
    issues_opened: List[str] = []
    issues_left_resolved: List[str] = []
    issues_reopened: List[str] = []
    evidence_requested: List[str] = []
    memory_references: List[str] = []
    finding_status: str = "inference"


class ReplayDifference(BaseModel):
    field: str
    without_memory: str
    with_memory: str


class MemoryReplayResponse(BaseModel):
    without_memory: ReplayResult
    with_memory: ReplayResult
    memory_used: List[MemoryUsed] = []
    differences: List[ReplayDifference] = []
