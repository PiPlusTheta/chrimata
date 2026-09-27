# Answer Key (Northstar Ops demo)

Never fed to the agent or into Hindsight memory.

| # | Question | Expected finding |
|---|---|---|
| 1 | Is March's ₹2.4cr ARR (`claim-arr-mar`) consistent with April's ledger? | No — only ₹12L/mo is active (`claim-active-mrr-apr`), annualising to ₹1.44cr (`calc-live-arr-apr`). ₹5L/mo is signed-not-active (`claim-contracted-mrr-apr`) and ₹3L/mo is unsigned pipeline (`claim-pipeline-mrr-apr`) — neither counts as live ARR. Founder's April email explains the deck combined all three loosely. Once an analyst records `accept_explanation` then `resolve` on `issue-arr-apr`, it is legitimately closed — this is a terminology issue, not fraud. |
| 2 | Is July's ₹17L MRR (`claim-mrr-jul`) still accurate? | Unconfirmed. A dated churn notice (`claim-churn-jul`, ₹4L/mo, July 5) postdates the reported figure. `calc-mrr-post-churn-jul` computes ₹13L/mo but is explicitly `status: inferred` pending the July billing ledger — no such ledger has been ingested in the base seed. `issue-mrr-jul` must stay `open`, independent of `issue-arr-apr`. |
| 3 | What is the cash runway? | Base case (`calc-runway-base`): ₹72L / ₹18L = **4 months**, constant-burn assumption. A 10-month figure (`calc-runway-scenario`) only holds if the ₹1.08cr Series A extension (`claim-financing-proposed-jun`, term sheet not yet signed) closes — it is `status: conditional`, not an arithmetic error once its inputs are examined. The board's own qualitative claim (`claim-runway-jul`, "3-4 months without the extension") corroborates the base case. |

## Distractors seeded (never referenced above, present to prevent shortcut-matching)

Feb contract register, March activation log, May bank statement, July sales pipeline,
April payroll register, March Stripe export — all internally consistent with the main
story but not load-bearing for any answer.

## Canonical IDs

Documents: `doc-deck-mar`, `doc-ledger-apr`, `doc-founder-email-apr`, `doc-update-jul`,
`doc-churn-notice-jul`, `doc-cash-q1`, `doc-term-sheet-jun`, `doc-board-minutes-jun`,
plus 7 distractor documents. Claims/issues use the IDs in the table above.
