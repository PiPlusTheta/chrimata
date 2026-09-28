from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

class SourceRef(BaseModel):
    document_id: str
    locator: str
    quote: Optional[str] = None

class DocumentSchema(BaseModel):
    id: str
    deal_id: Optional[str] = None
    title: str
    type: str
    version: str
    document_date: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    ingested_at: str
    content: str
    source_url: Optional[str] = None
    synthetic: bool = True

    model_config = ConfigDict(from_attributes=True)

class ClaimSchema(BaseModel):
    id: str
    deal_id: str
    metric: str
    original_text: str
    stated_amount_paise: Optional[int] = None
    currency_code: Optional[str] = "INR"
    original_amount_minor: Optional[int] = None
    fx_rate_to_inr: Optional[str] = None
    stated_months: Optional[str] = None
    as_of_date: str
    definition: Optional[str] = None
    status: str
    sources: List[SourceRef]

    model_config = ConfigDict(from_attributes=True)

class ReviewSchema(BaseModel):
    id: str
    issue_id: str
    decision: str
    explanation: str
    reviewed_at: str
    reviewer: str
    memory_status: str

    model_config = ConfigDict(from_attributes=True)

class IssueEvent(BaseModel):
    id: str
    at: str
    kind: str  # opened | evidence_added | reviewed | resolved | reopened
    description: str
    source_ids: List[str] = []

class IssueSchema(BaseModel):
    id: str
    deal_id: str
    claim_id: str
    status: str
    question: str
    evidence_for: List[SourceRef]
    evidence_against: List[SourceRef]
    history: List[IssueEvent] = []
    suggested_request: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CalculationInput(BaseModel):
    label: str
    amount_paise: int
    source: SourceRef

class CalculationSchema(BaseModel):
    id: str
    metric: str
    amount_paise: Optional[int] = None
    months: Optional[str] = None
    as_of_date: str
    status: str  # calculated | inferred | conditional
    formula: str
    inputs: List[CalculationInput]
    assumptions: List[str]
    sources: List[SourceRef]

class SummarySchema(BaseModel):
    deal_id: str
    company_name: str
    synthetic: bool = True
    run_id: str
    document_count: int
    open_issue_count: int
    metrics: List[CalculationSchema]

class ReviewCreate(BaseModel):
    decision: str  # accept_explanation | request_evidence | dispute | resolve
    explanation: str
    reviewer: str

class MemoryStatusUpdate(BaseModel):
    memory_status: str  # retained | failed
    reason: Optional[str] = None

class ClaimInput(BaseModel):
    """A claim to create alongside a newly-ingested document. Lets a document POST
    trigger the evidence engine's own conflict-detection, generalizing what used to
    be a July-only hardcoded flow to any new evidence introduced live."""
    id: str
    metric: str
    original_text: str
    stated_amount_paise: Optional[int] = None
    currency_code: Optional[str] = "INR"
    original_amount_minor: Optional[int] = None
    fx_rate_to_inr: Optional[str] = None
    stated_months: Optional[str] = None
    as_of_date: str
    definition: Optional[str] = None
    status: str = "claimed"
    locator: str
    quote: Optional[str] = None

class DocumentIngestRequest(DocumentSchema):
    claims: List[ClaimInput] = []

class DocumentIngestResponse(BaseModel):
    document: DocumentSchema
    claims_created: List[str] = []
    issues_opened: List[str] = []
