export interface SourceRef {
  document_id: string;
  locator: string;
  quote?: string | null;
}

export interface Calculation {
  id: string;
  metric: string;
  amount_paise?: number | null;
  months?: string | null;
  status: string;
  formula: string;
  assumptions: string[];
  sources: SourceRef[];
}

export interface DealSummary {
  id: string;
  name: string;
  industry: string | null;
  stage: string | null;
  synthetic: boolean;
  open_issue_count: number;
  document_count: number;
}

export interface Summary {
  deal_id: string;
  company_name: string;
  run_id: string;
  document_count: number;
  open_issue_count: number;
  metrics: Calculation[];
}

export interface Claim {
  id: string;
  original_text: string;
  stated_amount_paise?: number | null;
  as_of_date: string;
}

export interface Issue {
  id: string;
  claim_id: string;
  status: string;
  question: string;
  evidence_for: SourceRef[];
  evidence_against: SourceRef[];
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  version: string;
  document_date: string;
  ingested_at: string;
  content: string;
}

export interface DocumentInput {
  id: string;
  deal_id: string;
  title: string;
  type: string;
  version: string;
  document_date: string;
  ingested_at: string;
  content: string;
  synthetic: boolean;
  claims: Array<{
    id: string;
    metric: string;
    original_text: string;
    stated_amount_paise: number | null;
    as_of_date: string;
    locator: string;
  }>;
}

export interface RecalledContext {
  summary: string;
  source_ids: string[];
}

export interface AgentAnswer {
  answer: string;
  recalled_context: RecalledContext[];
  uncertainties: string[];
  suggested_next_question?: string | null;
}

export interface ChatSession {
  id: string;
  run_id: string;
  deal_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "agent" | "system";
  text: string;
  context: RecalledContext[];
  uncertainties: string[];
  suggested_next_question?: string | null;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}
