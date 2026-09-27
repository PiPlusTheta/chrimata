export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchSummary() {
  const res = await fetch(`${API_BASE_URL}/deals/demo/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchIssues() {
  const res = await fetch(`${API_BASE_URL}/deals/demo/issues`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function fetchClaims() {
  const res = await fetch(`${API_BASE_URL}/deals/demo/claims`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE_URL}/deals/demo/documents`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch documents");
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

export async function agentAnalyze(dealId: string, sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/agent/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal_id: dealId, session_id: sessionId })
  });
  if (!res.ok) throw new Error("Failed to analyze");
  return res.json();
}

export async function agentAsk(dealId: string, sessionId: string, question: string) {
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

export async function injectJulyEvidence() {
  // Calls Niloy's staged-reveal endpoint, which ingests the canonical July documents
  // (doc-update-jul, doc-churn-notice-jul, etc. — the same IDs already cited by
  // claims/issues) and opens issue-mrr-jul. Idempotent: safe to click twice.
  const res = await fetch(`${API_BASE_URL}/deals/demo/introduce-july-evidence`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to introduce July evidence");
  return res.json();
}
