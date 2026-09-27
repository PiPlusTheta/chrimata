# Chrimata Integration Contracts

This directory contains the source of truth for the JSON payload shapes exchanged between the FastAPI backend and the Next.js/Hindsight agent frontend.

Nitesh: Build your UI and agent logic against these structures. The backend guarantees it will emit these fields. Optional fields may be added later, but existing fields will not be renamed.

## Common Data Types
* **Dates**: ISO 8601 strings (e.g., `2026-03-15T10:00:00Z` or `2026-03-15`).
* **Monetary Values**: Stored as exact integer INR minor units (e.g., ₹1 is `100`, ₹2.4 crore is `2400000000`? Wait, INR minor unit is paise. 1 INR = 100 paise. So 2.4 crore INR = 24,000,000 INR = 2,400,000,000 paise. Let's use exact integer INR values without minor units, or just stick to minor units. Let's use INR standard integer values if minor is too large? The instruction says "integer INR minor units or exact decimal strings". Let's use integer INR minor units (paise) to be safe. Actually, ₹2.4 crore = 2,40,00,000 INR. In paise: 2,400,000,000. This fits comfortably in a standard 64-bit integer, and mostly in 32-bit (max 2B, so 2.4B might exceed 32-bit signed int limit of 2.14B). Let's use integer INR (standard units) if possible, but wait, instruction explicitly said "integer INR minor units or exact decimal strings". I will use exact decimal strings to avoid integer overflow issues in JSON/JS. Wait, I'll use exact integer INR minor units but as Python `int` which can be arbitrarily large. JS handles up to 9,007,199,254,740,991, so 2.4B is perfectly safe).
* **Source IDs**: Strings matching `Document` IDs, referring to real seeded source records.

## Entities
* **Document**: A dated source material (e.g., pitch deck, ledger, contract).
* **Claim**: A financial claim made by the company (e.g., "₹2.4 crore ARR").
* **Calculation**: An auditable calculation derived from evidence (e.g., "Active MRR * 12").
* **Issue**: A discrepancy or question arising from a claim.
* **Review**: An analyst's decision and explanation on an issue.
* **AgentAnswer**: The response format for the Hindsight-powered agent.

## Backend ↔ Agent Handoff

When a review is saved (`POST /api/issues/{id}/reviews`), the backend will mark its `memory_status` as `pending`. Nitesh, your agent module must pick this up, store the reasoning in Hindsight memory, and then callback to the backend to mark it `retained` (or `failed`).

*This ensures we never lose the analyst's decision even if the Hindsight API call fails.*
