from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from app.schemas.domain import SourceRef

class RecalledContext(BaseModel):
    review_id: Optional[str] = None
    memory_id: Optional[str] = None
    summary: str
    source_ids: List[str]

class AgentAnswer(BaseModel):
    answer: str
    supporting_sources: List[SourceRef]
    recalled_context: List[RecalledContext]
    uncertainties: List[str]
    suggested_next_question: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class AnalyzeRequest(BaseModel):
    deal_id: str
    session_id: str

class AnalyzeResponse(BaseModel):
    answer: AgentAnswer
    suggested_issues: List[dict] = []

class AskRequest(BaseModel):
    deal_id: str
    session_id: str
    question: str

class RetainReviewRequest(BaseModel):
    review_id: str

class RetainReviewResponse(BaseModel):
    status: str

class NewSessionRequest(BaseModel):
    run_id: str

class NewSessionResponse(BaseModel):
    session_id: str

class ReflectRequest(BaseModel):
    deal_id: str
    query: Optional[str] = None

class ReflectResponse(BaseModel):
    available: bool
    text: Optional[str] = None
    reason: Optional[str] = None

# --- Real, DB-persisted chat sessions for Ask Chrimata ---

class ChatSessionCreate(BaseModel):
    deal_id: str = "demo"

class ChatSessionSchema(BaseModel):
    id: str
    run_id: str
    deal_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class ChatMessageSchema(BaseModel):
    id: str
    session_id: str
    role: str
    text: str
    context: List[Dict[str, Any]] = []
    uncertainties: List[str] = []
    suggested_next_question: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class ChatSessionDetail(ChatSessionSchema):
    messages: List[ChatMessageSchema] = []

class ChatSessionRename(BaseModel):
    title: str

class ChatMessageCreate(BaseModel):
    question: str = ""
    regenerate: bool = False
