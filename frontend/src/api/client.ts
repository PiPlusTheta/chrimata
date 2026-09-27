import type { AgentAnswer, ChatSession, ChatSessionDetail, Claim, DealSummary, DocumentInput, DocumentRecord, Issue, Summary } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchDeals(): Promise<DealSummary[]> {
  const res = await fetch(`${API_BASE_URL}/deals`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch deals");
  return res.json();
}

export async function fetchSummary(dealId: string): Promise<Summary> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchIssues(dealId: string): Promise<Issue[]> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/issues`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function fetchClaims(dealId: string): Promise<Claim[]> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/claims`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function fetchDocuments(dealId: string): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/documents`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function registerDocument(dealId: string, payload: DocumentInput): Promise<{ document: DocumentRecord; claims_created: string[]; issues_opened: string[] }> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/documents`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || "Failed to register evidence");
  }
  return res.json();
}

export async function submitReview(issueId: string, decision: string, explanation: string, reviewer: string) {
  const res = await fetch(`${API_BASE_URL}/issues/${issueId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, explanation, reviewer })
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

export async function retainReview(reviewId: string) {
  const res = await fetch(`${API_BASE_URL}/agent/retain-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review_id: reviewId })
  });
  if (!res.ok) throw new Error("Failed to retain review");
  return res.json();
}

export async function agentAnalyze(dealId: string, sessionId: string): Promise<{ answer: AgentAnswer }> {
  const res = await fetch(`${API_BASE_URL}/agent/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id: dealId, session_id: sessionId })
  });
  if (!res.ok) throw new Error("Failed to analyze");
  return res.json();
}

export async function agentAsk(dealId: string, sessionId: string, question: string): Promise<AgentAnswer> {
  const res = await fetch(`${API_BASE_URL}/agent/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id: dealId, session_id: sessionId, question })
  });
  if (!res.ok) throw new Error("Failed to ask agent");
  return res.json();
}

export async function newSession(runId: string) {
  const res = await fetch(`${API_BASE_URL}/agent/new-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ run_id: runId })
  });
  if (!res.ok) throw new Error("Failed to start new session");
  return res.json();
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE_URL}/demo/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo");
  return res.json();
}

export async function fetchDocument(dealId: string, documentId: string): Promise<DocumentRecord> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/documents/${documentId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function fetchCalculations(dealId: string) {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/calculations`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch calculations");
  return res.json();
}

export async function fetchReport(dealId: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/report`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.text();
}

export async function agentReflect(dealId: string, query?: string) {
  const res = await fetch(`${API_BASE_URL}/agent/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id: dealId, query })
  });
  if (!res.ok) throw new Error("Failed to reflect");
  return res.json();
}

// --- Ask Chrimata: real, DB-persisted chat sessions (backend: chat_sessions /
// chat_messages tables). Nothing here is mocked client-side. ---

export async function createChatSession(dealId: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE_URL}/agent/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id: dealId }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function listChatSessions(dealId: string): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE_URL}/agent/sessions?deal_id=${encodeURIComponent(dealId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to list sessions");
  return res.json();
}

export async function getChatSession(sessionId: string): Promise<ChatSessionDetail> {
  const res = await fetch(`${API_BASE_URL}/agent/sessions/${sessionId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load session");
  return res.json();
}

export async function renameChatSession(sessionId: string, title: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE_URL}/agent/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename session");
  return res.json();
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/agent/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

export type ChatStreamState = "searching" | "solving" | "composing";

/**
 * Streams a chat turn via SSE (real backend streaming, not a simulated typewriter).
 * `onState` fires on real lifecycle events (Hindsight recall -> LLM generation),
 * `onToken` fires per text chunk as the model actually produces it, `onDone` fires
 * once with the final persisted message. Pass `signal` from an AbortController to
 * support a real Stop button — the fetch (and the server's generator) are cancelled,
 * not just hidden client-side.
 */
export async function streamChatMessage(
  sessionId: string,
  question: string,
  handlers: {
    onState?: (state: ChatStreamState) => void;
    onToken?: (text: string) => void;
    onDone?: (message: import("./types").ChatMessage) => void;
    onError?: (message: string) => void;
  },
  signal?: AbortSignal,
  regenerate = false
): Promise<void> {
  const url = `${API_BASE_URL}/agent/sessions/${encodeURIComponent(sessionId)}/stream`;
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, regenerate }), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") return; // real stop, not an error
    handlers.onError?.("Failed to reach the agent");
    return;
  }
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    handlers.onError?.(detail || "Failed to reach the agent");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  while (true) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // real stop, not an error
      handlers.onError?.("Connection to the agent was interrupted.");
      return;
    }
    const { done, value } = chunk;
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line; each event has "event: x\ndata: y".
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const eventLine = raw.split("\n").find((l) => l.startsWith("event: "));
      const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
      if (!eventLine || !dataLine) continue;
      const event = eventLine.slice("event: ".length);
      let data: unknown;
      try { data = JSON.parse(dataLine.slice("data: ".length)); }
      catch { handlers.onError?.("The agent returned an invalid stream event."); return; }

      if (event === "state" && (data === "searching" || data === "solving" || data === "composing")) handlers.onState?.(data);
      else if (event === "token" && typeof data === "string") handlers.onToken?.(data);
      else if (event === "done") { completed = true; handlers.onDone?.(data as import("./types").ChatMessage); }
      else if (event === "error") { handlers.onError?.(typeof data === "string" ? data : "The agent failed."); return; }
    }
  }
  if (!completed && !signal?.aborted) handlers.onError?.("The response ended before it was saved. Retry the turn.");
}

export async function injectJulyEvidence(dealId: string) {
  // Calls Niloy's staged-reveal endpoint, which ingests the canonical July documents
  // (doc-update-jul, doc-churn-notice-jul, etc. — the same IDs already cited by
  // claims/issues) and opens issue-mrr-jul. Idempotent: safe to click twice.
  const res = await fetch(`${API_BASE_URL}/deals/${dealId}/introduce-july-evidence`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to introduce July evidence");
  return res.json();
}
