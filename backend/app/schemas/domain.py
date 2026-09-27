from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

class DocumentSchema(BaseModel):
    id: str
    title: str
    date: str
    version: str
    type: str
    content: str
    source_url: str

    model_config = ConfigDict(from_attributes=True)

class ClaimSchema(BaseModel):
    id: str
    metric: str
    stated_value: str
    unit: str
    as_of_date: str
    definition: Optional[str] = None
    source_ids: List[str]
    status: str

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

class IssueSchema(BaseModel):
    id: str
    claim_id: str
    status: str
    question: str
    evidence_for: List[str]
    evidence_against: List[str]
    suggested_request: Optional[str] = None
    history: List[ReviewSchema] = []

    model_config = ConfigDict(from_attributes=True)

class CalculationSchema(BaseModel):
    metric: str
    value: str
    unit: str
    formula: str
    inputs: Dict[str, Any]
    source_ids: List[str]
    as_of_date: str
    assumptions: List[str]

class ReviewCreate(BaseModel):
    decision: str
    explanation: str
    reviewer: str

class MemoryStatusUpdate(BaseModel):
    memory_status: str
