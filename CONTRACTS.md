# Chrimata — Phase 1 collaboration contract

**Status:** Shared implementation contract for Niloy and Nitesh. Commit this file at the repository root before the two Antigravity agents begin. If the product is renamed Nomisma, change the brand string only; retain IDs and API shapes. The submission is due before 29 September 2026, India time.

## 1. Product and proof

Chrimata is an investigation workspace for an investor reviewing a startup's dated financial claims. It compares claims with source records, calculates auditable metrics, records analyst decisions, and uses Hindsight to carry explanations and corrections into later sessions. It does not score founder character or decide whether to invest.

The live proof must show: **evidence discrepancy → analyst clarification → Hindsight retain → fresh session recall → later distinct issue**. A judge must be able to inspect sources and formulas. The demo uses a clearly labelled fictional company, **Northstar Ops**.

### Demo stages

| Stage | Available evidence | Expected result |
| --- | --- | --- |
| `initial` | March deck: ₹2.4 crore ARR. April active MRR: ₹12 lakh. Signed but inactive: ₹5 lakh/month. Unsigned pipeline: ₹3 lakh/month. | Open April definition issue; calculated live annualised ARR is ₹1.44 crore. |
| `reviewed` | Founder explanation plus revised deck separating the categories; analyst accepts the terminology explanation. | April issue is resolved. Review is persisted and successfully retained in Hindsight. |
| `new_session` | Same deal data and memory, empty conversation. | Agent recalls the resolved explanation without relying on chat history. |
| `july` | June activation brings active MRR to ₹17 lakh; July churn notice removes ₹4 lakh/month; July update still reports ₹17 lakh current MRR. No July billing ledger. | April issue remains resolved. A separate July issue requests the billing ledger. ₹13 lakh/month and ₹1.56 crore annualised are explicitly unconfirmed inferences. |
| `runway` | July cash ₹72 lakh and net burn ₹18 lakh/month; a 10-month deck scenario assumes ₹1.2 crore proposed financing. | Four-month simple constant-burn runway from current cash; 10-month figure presented only as a financing-dependent scenario, pending its full forecast assumptions. |

**Chronology rule:** The future founder explanation and July documents must not be present in the initial agent-visible corpus or Hindsight bank. Demo transitions actually insert/reveal records. An answer key is kept separately and is never passed to the agent.

## 2. Ownership and non-overlap

| Area | Niloy owns | Nitesh owns |
| --- | --- | --- |
| Data | `/data/demo/**`, private evaluation/answer key | Fixture copies inside `/frontend/src/fixtures/**` only until live integration |
| Contracts | This root `CONTRACTS.md`, `/contracts/**`; announce additive changes | Consume contract; propose changes to Niloy before modifying it |
| Backend | `/backend/app/core/**`, `/backend/app/routes/evidence.py`, database schema, seed/reset | `/backend/app/agent/**`, `/backend/app/routes/agent.py`, Hindsight adapter |
| Frontend | No changes | `/frontend/**`, API client, investigation dashboard |
| Joint integration | Mount both routers once in a shared app entrypoint at agreed merge time | Validate the real UI against live evidence and Hindsight calls |

Do not edit the other person's owned paths. Branches: `niloy/evidence` and `nitesh/agent-dashboard`. Merge the initial contract/examples first. Both can use the same deal and fixture IDs. Do not merge untested competing versions of the shared app entrypoint.

## 3. Sources of truth

1. **Application database:** original document content, rows, versions, numerical inputs, deterministic calculations, issue status, and append-only analyst reviews.
2. **Hindsight:** retained explanations, decisions, attempted interpretations, and verified outcomes with provenance; used for cross-session recall and reflect.
3. **Agent:** composes an answer from current database evidence plus relevant memory. It cannot modify financial inputs or declare an issue resolved by itself.
4. **Frontend:** displays the API's status and citations. Fixtures are for concurrent development and must be disabled in the submitted live demo.

Every meaningful statement must distinguish `claimed`, `calculated`, `inferred`, or `conditional`. The LLM must not do final money arithmetic. Use integer INR **paise** in API fields (`amount_paise`) and format rupees/lakh/crore only at presentation boundaries; a ratio such as runway can be a decimal string with explicit assumptions.

## 4. Stable schema v1

All IDs are stable strings. Dates are ISO 8601 and have separate roles: `document_date`, `period_start`, `period_end`, `ingested_at`, and `reviewed_at`. No field renames during Phase 1; new optional fields are allowed after both owners agree.

```ts
type EvidenceStatus = "claimed" | "calculated" | "inferred" | "conditional";
type IssueStatus = "open" | "explained" | "resolved" | "reopened";
type MemoryStatus = "pending" | "retained" | "failed";

type SourceRef = {
  document_id: string;
  locator: string;        // e.g. "slide 8", "row customer-03", "paragraph 2"
  quote?: string;         // exact source excerpt; never fabricated
};

type Document = {
  id: string;
  deal_id: "demo";
  title: string;
  type: "deck" | "update" | "ledger" | "contract" | "pipeline" | "notice" | "email" | "cash" | "analyst_note";
  version: string;
  document_date: string;
  period_start?: string | null;
  period_end?: string | null;
  ingested_at: string;
  content: string;
  source_url?: string | null;
  synthetic: true;
};

type Claim = {
  id: string;
  deal_id: "demo";
  metric: "arr" | "mrr" | "runway";
  original_text: string;
  stated_amount_paise?: number | null;
  stated_months?: string | null;
  as_of_date: string;
  definition?: string | null;
  status: EvidenceStatus;
  sources: SourceRef[];
};

type Calculation = {
  id: string;
  metric: "active_mrr" | "live_annualised_arr" | "simple_cash_runway";
  amount_paise?: number | null;
  months?: string | null;
  as_of_date: string;
  status: "calculated" | "inferred" | "conditional";
  formula: string;
  inputs: { label: string; amount_paise: number; source: SourceRef }[];
  assumptions: string[];
  sources: SourceRef[];
};

type IssueEvent = {
  id: string;
  at: string;
  kind: "opened" | "evidence_added" | "reviewed" | "resolved" | "reopened";
  description: string;
  source_ids: string[];
};

type Issue = {
  id: string;
  deal_id: "demo";
  claim_id: string;
  status: IssueStatus;
  question: string;
  evidence_for: SourceRef[];
  evidence_against: SourceRef[];
  history: IssueEvent[];
  suggested_request: string;
};

type Review = {
  id: string;
  issue_id: string;
  decision: "accept_explanation" | "request_evidence" | "dispute" | "resolve";
  explanation: string;
  reviewer: string;
  reviewed_at: string;
  memory_status: MemoryStatus;
};

type AgentAnswer = {
  answer: string;
  supporting_sources: SourceRef[];
  recalled_context: { review_id?: string; memory_id?: string; summary: string; source_ids: string[] }[];
  uncertainties: string[];
  suggested_next_question?: string | null;
};
```

Canonical IDs for the main story: `claim-arr-mar`, `issue-arr-apr`, `review-arr-definition`, `claim-mrr-jul`, `issue-mrr-jul`, `claim-runway-jul`. Niloy supplies document IDs in `/contracts/examples/`. Nitesh never infers those IDs from UI labels.

### Sample response: `GET /api/deals/demo/summary`

```json
{
  "deal_id": "demo",
  "company_name": "Northstar Ops",
  "synthetic": true,
  "stage": "initial",
  "document_count": 8,
  "open_issue_count": 1,
  "metrics": [
    {
      "id": "calc-live-arr-apr",
      "metric": "live_annualised_arr",
      "amount_paise": 1440000000,
      "as_of_date": "2026-04-30",
      "status": "calculated",
      "formula": "active_mrr × 12",
      "inputs": [{ "label": "active_mrr", "amount_paise": 120000000, "source": { "document_id": "doc-ledger-apr", "locator": "total active subscriptions" } }],
      "assumptions": ["Active subscriptions remain constant for 12 months."],
      "sources": [{ "document_id": "doc-ledger-apr", "locator": "total active subscriptions" }]
    }
  ]
}
```

`₹12 lakh = 120000000 paise`, `₹1.44 crore = 1440000000 paise`, and `₹2.4 crore = 2400000000 paise`. Review monetary examples and tests using these conversions.

## 5. HTTP API ownership

All response bodies follow the schema above. Return JSON errors as `{ "error": { "code": string, "message": string } }` with useful HTTP status. Read endpoints are side-effect free. Mutations must validate input and be idempotent where stated.

### Niloy: evidence routes

| Endpoint | Purpose |
| --- | --- |
| `GET /api/deals/demo/summary` | Current stage, metric calculations, counts. |
| `GET /api/deals/demo/documents` | List available source documents for current stage. |
| `GET /api/deals/demo/documents/{id}` | Full source and locators for evidence viewer. |
| `GET /api/deals/demo/claims` | Claims and claim source references. |
| `GET /api/claims/{id}` | Claim, relevant calculations, linked issue. |
| `GET /api/deals/demo/issues` | Current issue cards with history. |
| `GET /api/issues/{id}/reviews` | Append-only reviews and memory status. |
| `GET /api/reviews/{id}` | Persisted review for memory adapter. |
| `POST /api/issues/{id}/reviews` | Save analyst review and update issue state; return Review with `pending` memory status. |
| `PATCH /api/reviews/{id}/memory-status` | Agent reports `retained` or `failed`, including reason on failure; idempotent. |
| `POST /api/deals/demo/documents` | Controlled ingestion of prepared scenario records; accepts stable document ID, no arbitrary future corpus leakage. |
| `POST /api/demo/reset` | Reset core dataset to `initial`, issue history and review DB; return a new `run_id`. |

`POST /api/issues/{id}/reviews` validates a nonempty explanation. Only `accept_explanation` plus evidence of a revised deck may resolve `issue-arr-apr`. New July evidence opens `issue-mrr-jul` without changing April's status.

### Nitesh: agent routes

| Endpoint | Purpose |
| --- | --- |
| `POST /api/agent/analyze` | Given `deal_id` and `session_id`, inspect current evidence/issues and relevant memory; return AgentAnswer and structured issue suggestions. No direct DB mutation. |
| `POST /api/agent/ask` | Given `deal_id`, `session_id`, and question, answer with sources, memory, and uncertainties. |
| `POST /api/agent/retain-review` | Given `review_id`, load persisted Review, retain in Hindsight using a stable document ID, then PATCH memory status. Retrying must not duplicate memory. |
| `POST /api/agent/new-session` | Return a new chat session ID for the same `run_id`, preserving deal documents, reviews, and memory bank. |

The frontend review flow is sequential: save the review in Niloy's API; call `retain-review`; display `retained` only after success. On failure display `failed` and a retry. Never claim Hindsight learned from a review still marked `pending`.

The agent can suggest an issue, but **Niloy's evidence engine decides whether a new issue record is opened** when new evidence enters. This prevents competing issue state machines.

## 6. Session and demo isolation

`run_id` identifies a complete repeatable demo; `session_id` identifies one conversation. A new session preserves the run and all Hindsight memory. A full reset creates a new run and uses a clean run-scoped Hindsight bank or equivalently isolated tag scope. Nitesh must ensure historical review memories from earlier demos cannot leak into the initial stage of a fresh run. Niloy's reset endpoint returns `run_id`; the UI must use that exact value in subsequent agent requests.

Do not preload founder clarification, analyst resolution, July evidence, or answer-key text into Hindsight before the relevant stage. Seed only documents the agent should know at that stage.

## 7. Hindsight provenance and conflict handling

Retain review content with: `deal_id`, `run_id`, `issue_id`, `review_id`, review timestamp, author role, decision, explanation, linked document IDs, and verification status. Use current official API/SDK fields rather than assuming a particular old API shape. `world`, `experience`, and consolidated `observation` are memory categories; this app should not fabricate an `opinion` endpoint.

For an answer: retrieve relevant memory; fetch the current authoritative issue, calculation, and source passages; compare dates and definitions; report conflicts and uncertainty; cite real source IDs. A founder statement is attributed to the founder. An analyst acceptance resolves the specified issue only. An earlier memory does not automatically override a later ledger. Do not claim causation, fraud, or an actual investment recommendation.

## 8. Work sequence and integration gates

1. **Contract first:** Niloy commits this file plus `/contracts/examples/` with a response for each endpoint. Nitesh begins UI and agent code against those exact fixtures.
2. **Independent build:** Niloy exercises evidence APIs without frontend or Hindsight. Nitesh exercises agent adapter with fixture evidence and Hindsight credentials, plus UI with fixtures.
3. **First merge:** mount both route modules, point frontend API client at real backend, verify no schema drift.
4. **Full story:** initial discrepancy; save correction; successful retain; fresh session recall; add July evidence; separate new issue; runway explanation.
5. **Repeat:** execute a full reset and repeat the story. Verify no memory leak from previous run.

Meaningful checks: exact ARR and runway arithmetic, category separation, review persistence, idempotent memory retry, cross-session recall, separate July issue, abstention without July ledger, no fabricated citations, and clean reset. Keep private expected answers inaccessible to the agent.

## 9. Phase 2 boundary and submission

Phase 1 ends when the full story works through the real UI and Hindsight. Phase 2 covers visual polish, deployment, recording, README, Hindsight architecture explanation, and required content. Every team member separately completes an article, social post, and video per the organisers' content guide. GitHub repository, demo video, and live demo must be available before the submission cutoff; plan to finish by 28 September evening IST.

Authentication, arbitrary PDF/OCR ingestion, multiple deals, predictive scoring, and broad forecasting are outside Phase 1. If time is tight, preserve the complete memory loop and auditable evidence.

## 10. Change control and done reports

Contract changes require both owners to agree in the repository issue/PR or a direct discussion, followed by updated fixture examples. Additive optional fields are preferable to renames. Each agent's completion report must list changed files, commands to run, tests actually executed, endpoints verified, integration dependencies, and known gaps. Do not claim an end-to-end demo passed until both modules have been exercised together against real Hindsight.
