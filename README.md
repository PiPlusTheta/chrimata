# Chrimata

A Hindsight-powered financial due diligence tool. The backend preserves dated source
evidence, runs auditable financial calculations, and tracks the state of each
diligence question as new evidence arrives. The agent (separate module) uses that
evidence plus Hindsight memory to answer questions about how the investigation has
evolved.

## Ownership

- **Niloy**: `backend/app/` (except `app/agent/` and `app/api/endpoints/agent.py`),
  `contracts/`, `data/`, this README.
- **Nitesh**: `backend/app/agent/` (or `backend/app/api/endpoints/agent.py`, mounted
  under `/api/agent` in `backend/app/api/router.py`), `frontend/`, Hindsight
  integration.

See [`contracts/README.md`](contracts/README.md) for the API payload shapes both
sides build against.

## Backend setup

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (already gitignored):

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
CORS_ORIGINS=http://localhost:3000
XAI_API_KEY=...   # for Nitesh's agent module, if it calls an LLM
```

A live Postgres instance is already provisioned — ask Niloy for the RDS URL, or run
`docker compose up -d` from the repo root for a local one (`DATABASE_URL` in that case
is `postgresql://postgres:postgres@localhost:5432/chrimata`).

Run the server:

```bash
uvicorn app.main:app --reload
```

On first startup (when the `documents` table is empty), the app automatically seeds
the demo dataset. This will **not** wipe existing data on every restart/reload — use
the endpoint below for an explicit, repeatable reseed.

Run the tests (these use an isolated on-disk SQLite file, never the real
`DATABASE_URL`, so they're safe to run against a shared RDS instance):

```bash
pytest
```

## API surface

All endpoints are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/deals/demo/summary` | Dashboard counters |
| GET | `/deals/demo/documents` | All source documents |
| POST | `/deals/demo/documents` | Ingest a new document (live-demo new-evidence flow) |
| GET | `/deals/demo/claims` | All extracted claims |
| GET | `/claims/{id}` | Fetch a single claim |
| GET | `/deals/demo/calculations` | The 4 deterministic calculations (ARR, both runway variants, inferred post-churn MRR), recomputed live from claim values |
| GET | `/deals/demo/issues` | All issues, each with full review `history` |
| GET | `/issues/{id}/reviews` | Review history for one issue |
| POST | `/issues/{id}/reviews` | Analyst records a decision (`open`/`explained`/`resolved`/`reopened`) |
| POST | `/demo/reset` | Wipe and reseed the demo dataset |
| GET | `/internal/knowledge` | Agent-facing bundle: all claims, issues (with history), and calculations in one call |
| GET | `/internal/documents/{id}` | Agent-facing single-document fetch |
| GET | `/internal/reviews/{id}` | Agent-facing single-review fetch |
| POST | `/internal/reviews/{id}/memory-status` | Agent calls this once Hindsight has retained (or failed to retain) a review |

`/internal/*` is the read surface built for Nitesh's agent so it never has to scrape
dashboard text — it is **not** the agent itself. `/agent/*` is reserved and unused
here; that's where Nitesh's own router mounts.

## Dataset

15 synthetic source documents in `data/demo/` (decks, ledgers, contracts, pipeline,
churn notice, cash record, term sheet, board minutes, Slack thread, plus payroll/bank
CSV distractors) tell a two-part story about a fictional Indian B2B SaaS company:

1. March pitch deck claims ₹2.4cr ARR; the April ledger shows only ₹12L is active MRR
   (₹1.44cr annualised) — the rest is contracted-future (₹5L) and unsigned pipeline
   (₹3L). The founder's April email explains the deck combined all three loosely.
2. July update claims ₹17L MRR; a July 5 churn notice shows a ₹4L/month customer left.
   ₹13L is an *inference*, flagged unconfirmed pending the (not-yet-ingested) July
   billing ledger — a separate August Slack thread corroborates the inference without
   resolving it.
3. Cash (₹72L) and burn (₹18L) give a 4-month base runway; a draft, unsigned term
   sheet (₹1.08cr) gives a 10-month scenario, explicitly labelled as an assumption.

The expected answers are in `data/answer_key/truth_sheet.md` — never fed to the agent
or into Hindsight memory.

## What's out of scope for Phase 1

No auth, no general PDF parsing, no deployment polish, no LLM performing arithmetic
(all financial calculations are plain `Decimal` code in `app/services/evidence.py`).
