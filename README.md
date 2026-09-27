# Chrimata

A Hindsight-powered financial due diligence tool. The backend preserves dated source
evidence, runs auditable financial calculations, and tracks the state of each
diligence question as new evidence arrives.

**Full contract (source of truth):** [`CONTRACTS.md`](CONTRACTS.md). This README is
just setup + a quick endpoint reference.

## Ownership

Per `CONTRACTS.md` §2: Niloy owns `backend/app/core|routes/evidence.py` (currently
`backend/app/{models,schemas,services,api/endpoints/evidence.py,db}`), `data/`,
`contracts/`. Nitesh owns `backend/app/agent/` (or `backend/app/api/endpoints/agent.py`,
mounted at `/api/agent` in `backend/app/api/router.py`), `frontend/`, Hindsight
integration.

## Backend setup

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

`backend/.env` (gitignored) needs:

```
DATABASE_URL=postgresql://...   # RDS instance already provisioned — ask Niloy
CORS_ORIGINS=http://localhost:3000
XAI_API_KEY=...                 # for Nitesh's agent module, if it calls an LLM
```

Run:

```bash
uvicorn app.main:app --reload
```

First startup (empty `documents` table) seeds automatically; it won't wipe data on
every reload — use `POST /api/demo/reset` for an explicit, repeatable reseed.

**If you change a model column**, `create_all` won't alter existing tables — drop and
recreate manually:

```bash
python -c "
from app.db.base import Base
from app.db.session import engine
from app.models.domain import Document, Claim, Issue, Review, DemoRun
Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)
"
```

Tests (isolated on-disk SQLite, never touches the real `DATABASE_URL`):

```bash
pytest -q
```

## API surface (all under `/api`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/deals/demo/summary` | Company, run_id, counts, all 4 calculations |
| GET | `/deals/demo/documents` | All source documents |
| GET | `/deals/demo/documents/{id}` | One document, full content |
| POST | `/deals/demo/documents` | Ingest a new document (live-demo flow) |
| GET | `/deals/demo/claims` | All claims |
| GET | `/claims/{id}` | One claim |
| GET | `/deals/demo/calculations` | The 4 deterministic calculations, recomputed live |
| GET | `/deals/demo/issues` | All issues, each with full `history` |
| GET | `/issues/{id}/reviews` | Reviews for one issue |
| POST | `/issues/{id}/reviews` | Record a decision (`accept_explanation`\|`request_evidence`\|`dispute`\|`resolve`) |
| GET | `/reviews/{id}` | One review |
| PATCH | `/reviews/{id}/memory-status` | Agent reports `retained`/`failed` after a Hindsight write |
| POST | `/demo/reset` | Wipe and reseed; returns a fresh `run_id` |

Errors are always `{"error": {"code": "...", "message": "..."}}`. `/api/agent/*` is
reserved and unused here — nothing in this backend mounts that prefix.

## Dataset

15 synthetic documents in `data/demo/` about **Northstar Ops**, a fictional Indian B2B
SaaS company:

1. March deck claims ₹2.4cr ARR; April ledger shows only ₹12L is active MRR (₹1.44cr
   annualised) — the rest is signed-not-active (₹5L) and unsigned pipeline (₹3L). A
   founder email explains the deck combined all three loosely.
2. July update claims ₹17L MRR; a July 5 churn notice removes ₹4L/mo. ₹13L/mo is an
   *inference*, flagged unconfirmed pending the (never-ingested) July billing ledger.
3. ₹72L cash / ₹18L burn gives a 4-month base runway; a ₹1.08cr unsigned term sheet
   gives a 10-month scenario, explicitly labelled conditional.

Expected answers: `data/answer_key/truth_sheet.md` — never fed to the agent or Hindsight.

## Out of scope for Phase 1

Auth, general PDF parsing, deployment polish, the `run_id`/session staged-reveal
machine (that's Nitesh's memory-isolation layer), and any LLM performing arithmetic —
all financial calculations are plain `Decimal` code in `app/services/evidence.py`.
