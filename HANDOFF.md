# Handoff Note for Nitesh

Hey Nitesh, the Phase 1 backend for the Chrimata financial due diligence engine is ready.

## Status & Setup
- The FastApi backend is fully structured (`/backend/app`).
- The frontend boilerplate is initialized using Next.js (`/frontend`).
- I have migrated the database engine to **PostgreSQL**. Since Docker is not available in my current environment to run it, you'll need to spin up the database using the provided `docker-compose.yml` before starting the server.

### Running the Backend
1. Start Postgres: `docker compose up -d`
2. Install dependencies: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
3. Run the server: `uvicorn app.main:app --reload`
*On startup, the app automatically drops and reseeds the demo dataset into the Postgres DB.*

## Contracts
- Source of truth for JSON payloads is in `/contracts/README.md`. Your agent must respect these shapes.

## Endpoints for your Agent & UI
**Evidence / UI APIs:**
- `GET /api/deals/demo/summary`: Dashboard counters.
- `GET /api/deals/demo/documents`: Get all source documents.
- `GET /api/deals/demo/claims`: Get all extracted claims.
- `GET /api/claims/{id}`: Fetch single claim.
- `GET /api/deals/demo/issues`: Get all issues/discrepancies.
- `GET /api/issues/{id}/reviews`: Get review history for an issue.
- `POST /api/issues/{id}/reviews`: Analyst adds a review/decision. Sets `memory_status` to `"pending"`.
- `POST /api/deals/demo/documents`: Upload new document.
- `POST /api/demo/reset`: Reset database to original seed state.

**Agent Internal Integration (`/api/agent/*`):**
- `GET /api/agent/knowledge`: Fetches all claims, issues, and real-time backend calculations (ARR, Runway) without you having to scrape the UI.
- `POST /api/agent/reviews/{review_id}/memory-status`: Handshake endpoint. Once your Hindsight integration successfully retains a review decision (or fails), call this endpoint with `{"memory_status": "retained"}` or `{"memory_status": "failed"}` to update the DB.

## Data & Scenarios
The truth sheet with expected math and reasoning is at `/data/answer_key/truth_sheet.md`. The synthetic company data is available in `/data/demo/`.

Let me know if you need any adjustments to the API!
