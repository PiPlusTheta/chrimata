"""EvidenceRequestService — generates learned evidence requests that improve
over time based on Hindsight memory of past request outcomes."""
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.domain import Issue, Claim, Document
from app.models.investigation import EvidenceRequest
from app.schemas.investigation import EvidenceRequestSchema
from app.services.investigation_memory import InvestigationMemoryService


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class EvidenceRequestService:

    def __init__(self, memory_service: InvestigationMemoryService):
        self.memory_service = memory_service

    async def generate_evidence_request(
        self, db: Session, run_id: str, bank_id: str,
        issue_id: str, change_review_id: Optional[str] = None,
        generated_by: str = "agent",
    ) -> EvidenceRequestSchema:
        """Generates a precise, memory-aware evidence request for an open issue."""
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            raise ValueError(f"Issue {issue_id} not found")

        claim = db.query(Claim).filter(Claim.id == issue.claim_id).first()

        # Deterministic: what fields are missing?
        missing_fields = self._determine_missing_fields(db, issue, claim)

        # Recall prior request outcomes from Hindsight
        metric = claim.metric if claim else "unknown"
        period = claim.as_of_date if claim else ""
        prior_outcomes = await self.memory_service.recall_for_evidence_request(
            bank_id, issue_type=metric, metric=metric, period=period,
        )

        prior_outcome_texts = []
        memory_ids = []
        for m in prior_outcomes:
            t = getattr(m, "text", "") or ""
            if t:
                prior_outcome_texts.append(t)
            mid = getattr(m, "id", None)
            if mid:
                memory_ids.append(mid)

        # Generate the request text using LLM (if available) or deterministic fallback
        request_text, reason = await self._generate_request_text(
            issue, claim, missing_fields, prior_outcome_texts,
        )

        req_id = f"ereq_{uuid.uuid4().hex[:10]}"
        req = EvidenceRequest(
            id=req_id, run_id=run_id, issue_id=issue_id,
            change_review_id=change_review_id,
            request_text=request_text, reason=reason,
            requested_fields=missing_fields.get("fields", []),
            requested_period=missing_fields.get("period"),
            requested_entity=missing_fields.get("entity"),
            requested_document_type=missing_fields.get("document_type"),
            status="requested", generated_by=generated_by,
            memory_ids_used=memory_ids,
            source_refs=[],
            created_at=_now(),
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return EvidenceRequestSchema.model_validate(req)

    def _determine_missing_fields(
        self, db: Session, issue: Issue, claim: Optional[Claim],
    ) -> Dict[str, Any]:
        """Deterministic missing-field calculation before LLM involvement."""
        fields = []
        period = None
        entity = None
        doc_type = None

        if claim:
            period = claim.as_of_date
            if claim.metric in ("mrr", "active_mrr", "churned_mrr"):
                fields = [
                    "customer", "subscription_status", "monthly_value",
                    "churn_effective_date", "billing_period",
                ]
                doc_type = "billing ledger"
                # Check if there's a churn-related claim
                churn_claims = db.query(Claim).filter(Claim.metric == "churned_mrr").all()
                if churn_claims:
                    entity = "churned customer"
            elif claim.metric in ("arr",):
                fields = ["active_subscriptions", "contract_status", "activation_date"]
                doc_type = "subscription ledger"
            elif claim.metric in ("cash", "burn"):
                fields = ["account_balance", "monthly_outflows", "monthly_inflows"]
                doc_type = "bank statement"

        return {
            "fields": fields,
            "period": period,
            "entity": entity,
            "document_type": doc_type or "supporting document",
        }

    async def _generate_request_text(
        self, issue: Issue, claim: Optional[Claim],
        missing_fields: Dict[str, Any], prior_outcomes: List[str],
    ) -> tuple:
        """Uses LLM to generate human-readable request text, enriched by past outcomes."""
        import os
        from openai import OpenAI

        # Build the request deterministically first
        fields_str = ", ".join(missing_fields.get("fields", []))
        period = missing_fields.get("period", "")
        entity = missing_fields.get("entity", "")
        doc_type = missing_fields.get("document_type", "supporting document")

        base_request = (
            f"Please provide the {period} {doc_type}"
            + (f" showing {fields_str}" if fields_str else "")
            + (f", including {entity}" if entity else "")
            + "."
        )
        base_reason = f"This determines: {issue.question}"

        # Try LLM enrichment
        api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return base_request, base_reason

        base_url = "https://api.x.ai/v1" if os.getenv("XAI_API_KEY") else None
        model = os.getenv("XAI_MODEL", "grok-3") if os.getenv("XAI_API_KEY") else "gpt-4o-mini"
        if model == "grok-beta":
            model = "grok-3"

        prompt = (
            f"Issue: {issue.question}\n"
            f"Missing evidence type: {doc_type}\n"
            f"Missing fields: {fields_str}\n"
            f"Period: {period}\n"
        )
        if prior_outcomes:
            prompt += f"\nPrevious evidence request outcomes (learn from these):\n"
            for po in prior_outcomes[:3]:
                prompt += f"- {po}\n"
            prompt += "\nAvoid repeating mistakes from prior insufficient requests.\n"

        prompt += (
            "\nGenerate a precise evidence request. Return JSON:\n"
            '{"request_text": "...", "reason": "..."}'
        )

        try:
            client = OpenAI(api_key=api_key, base_url=base_url) if base_url else OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You generate precise evidence requests for financial due diligence. Be specific about what document, what fields, what period, and what entities are needed."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
            result = json.loads(response.choices[0].message.content)
            return result.get("request_text", base_request), result.get("reason", base_reason)
        except Exception:
            return base_request, base_reason

    async def update_request_status(
        self, db: Session, bank_id: str, request_id: str,
        status: str, outcome_note: Optional[str] = None,
    ) -> EvidenceRequestSchema:
        """Updates an evidence request's status and retains the outcome in Hindsight."""
        req = db.query(EvidenceRequest).filter(EvidenceRequest.id == request_id).first()
        if not req:
            raise ValueError(f"EvidenceRequest {request_id} not found")

        req.status = status
        if outcome_note:
            req.outcome_note = outcome_note
        if status in ("received", "resolved"):
            req.received_at = _now()
        if status == "resolved":
            req.resolved_at = _now()

        db.commit()
        db.refresh(req)

        # Retain outcome in Hindsight for future learning
        if status == "insufficient" and outcome_note:
            text = f"Evidence request for {req.issue_id} was insufficient. Reason: {outcome_note}. Original request: {req.request_text}"
            await self.memory_service.retain_evidence_request_outcome(
                bank_id, document_id=req.id, text=text,
                issue_type=req.requested_document_type or "unknown",
                request_summary=req.request_text,
                outcome=status, reason=outcome_note,
            )

        return EvidenceRequestSchema.model_validate(req)
