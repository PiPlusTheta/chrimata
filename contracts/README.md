# Chrimata Integration Contracts

**The canonical contract is [`/CONTRACTS.md`](../CONTRACTS.md) at the repo root.** It
has the full TypeScript schema, ownership boundaries, endpoint tables, and the
Hindsight provenance/handoff rules. This folder holds runnable example payloads for
that schema — read the root file first.

## Examples in this folder

- [`document.json`](examples/document.json), [`claim.json`](examples/claim.json),
  [`calculation.json`](examples/calculation.json), [`issue.json`](examples/issue.json),
  [`review.json`](examples/review.json) — one instance of each entity.
- [`summary.json`](examples/summary.json) — `GET /api/deals/demo/summary` response.
- [`error.json`](examples/error.json) — the error shape every endpoint returns on failure.

These are taken directly from a real run of the seeded demo dataset (`Northstar Ops`),
not hand-invented — the IDs, amounts, and sources match what
`GET /api/deals/demo/*` actually returns after `POST /api/demo/reset`.
