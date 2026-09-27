# Handoff for Nitesh

The Phase 1 evidence engine is implemented and verified against the real RDS Postgres
instance (see `backend/.env`). Full contract: [`/CONTRACTS.md`](CONTRACTS.md). Setup:
[`/README.md`](README.md).

## What changed since Antigravity's last pass

Antigravity's schema direction (paise amounts, `SourceRef`, `IssueEvent` history
separate from `Review`, canonical kebab-case IDs) is what's implemented — I completed
it rather than reverting to my earlier draft, since that's the schema `CONTRACTS.md`
at the repo root specifies. Bugs fixed along the way:

- `stated_amount_paise` was `Integer` (32-bit) — overflows past ~₹21.5L. Fixed to `BigInteger`.
- `seed.py` referenced columns (`stated_value`, `unit`, `source_ids`) that no longer
  exist on the models — it would have crashed on startup. Rewritten to match the
  current schema, and now reads each document's `content` from the real files in
  `data/demo/` instead of duplicating text inline (so seed data can't drift from the
  actual source files).
- The internal agent-facing router was previously named `app/api/endpoints/agent.py`
  and mounted at `/api/agent` — both reserved for you per the ownership table. Folded
  into `evidence.py`; your agent reads evidence via the public `/api/deals/demo/*`,
  `/api/claims/*`, `/api/issues/*`, `/api/reviews/*` endpoints directly (no `/internal`
  namespace needed — they're already structured JSON with real citations).
- All calculations are computed from claim values pulled from the database at request
  time (`Decimal`, never float) — nothing is hardcoded.

## One simplification vs. CONTRACTS.md §1

`CONTRACTS.md` describes resolving `issue-arr-apr` as requiring "accept_explanation
plus evidence of a revised deck." No revised-deck artifact exists in the seeded
dataset (the original brief only specifies a founder clarification **email**, which is
seeded as `doc-founder-email-apr`). I implemented the gate as: `resolve` on
`issue-arr-apr` is rejected (409, `resolution_not_ready`) unless a prior
`accept_explanation` review exists on that issue. If you want the literal
revised-deck requirement, tell me and I'll add that artifact + check.

I did **not** build the `run_id`/`session_id` staged-reveal demo machine (§6 of
CONTRACTS.md) — that's session/memory-isolation orchestration on your side. What I do
provide: `POST /api/demo/reset` returns a fresh `run_id` each time (stored in a
one-row `demo_runs` table), and `POST /api/deals/demo/documents` lets you (or the UI)
ingest a held-back document live for the demo.

## Endpoints (all under `/api`, all verified live against RDS)

See the table in `README.md`. Notable: `PATCH /reviews/{id}/memory-status` (not POST —
matches CONTRACTS.md), decisions are `accept_explanation | request_evidence | dispute |
resolve`, issue statuses are `open | explained | resolved | reopened`.

## Verified (commands + results)

```
cd backend && source venv/bin/activate && pytest -q
# 15 passed (isolated SQLite file, never touches the shared RDS data)
```

Also ran the live server against the real `DATABASE_URL` in `.env` and exercised by
hand: summary/claims/issues/documents GETs, the accept→resolve review flow (with the
409 gate confirmed), the memory-status PATCH handshake, and reset — all correct,
math matches `data/answer_key/truth_sheet.md` exactly. `contracts/examples/*.json`
are captured from those real responses, not hand-written.

## Known gaps / out of scope for this pass

- No migrations — `Base.metadata.create_all` only adds missing tables; if you change
  a column, the RDS table needs a manual drop/recreate (see README).
- `POST /api/deals/demo/documents` accepts a document but does not auto-open new
  issues from it — issue creation from newly ingested evidence is manual for now
  (create via a direct DB/seed change, or ask me to add a small trigger-doc rule).
- Your `/api/agent/*` routes and `app/agent/` package don't exist yet — nothing here
  depends on them; mount them in `backend/app/api/router.py` whenever ready.
