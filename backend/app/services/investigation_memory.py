"""InvestigationMemoryService — the ONLY place application code touches Hindsight
for the new features. Raw HindsightAdapter calls are encapsulated here with
proper metadata, query construction, and recall-tracking."""
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from app.agent.adapter import HindsightAdapter


class InvestigationMemoryService:
    """High-level memory operations for the investigation loop.
    All Hindsight traffic for Features 1-3 goes through this service."""

    def __init__(self, adapter: HindsightAdapter):
        self.adapter = adapter

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    async def recall_for_change_review(
        self, bank_id: str, entity: str, metrics: List[str],
        issue_types: List[str], period: Optional[str] = None,
    ) -> List[Any]:
        """Builds a rich memory retrieval query from structured investigation context."""
        query_parts = [entity]
        query_parts.extend(metrics)
        query_parts.extend(issue_types)
        if period:
            query_parts.append(period)
        query_parts.extend([
            "analyst decisions", "prior resolution", "previous discrepancy",
            "subscription activation", "customer churn",
        ])
        query = " ".join(query_parts)
        return await self.adapter.recall(bank_id, query)

    async def retain_human_observation(
        self, bank_id: str, document_id: str, text: str,
        entity: str, metric: str, period: str,
        change_review_id: str, issue_id: Optional[str] = None,
        source_ids: Optional[List[str]] = None,
    ) -> bool:
        """Retains a manual analyst observation with full provenance metadata."""
        meta = {
            "memory_type": "human_observation",
            "entity": entity,
            "metric": metric,
            "period": period,
            "change_review_id": change_review_id,
            "issue_id": issue_id,
            "source_ids": source_ids or [],
            "retained_at": self._now(),
        }
        return await self.adapter.retain_review(bank_id, document_id=document_id, text=text, meta=meta)

    async def retain_agent_inference(
        self, bank_id: str, document_id: str, text: str,
        entity: str, metrics: List[str], period: str,
        change_review_id: str, finding_status: str,
        source_ids: Optional[List[str]] = None,
    ) -> bool:
        """Retains an AI-generated inference with its epistemic classification."""
        meta = {
            "memory_type": "agent_inference",
            "entity": entity,
            "metrics": metrics,
            "period": period,
            "change_review_id": change_review_id,
            "finding_status": finding_status,
            "source_ids": source_ids or [],
            "retained_at": self._now(),
        }
        return await self.adapter.retain_review(bank_id, document_id=document_id, text=text, meta=meta)

    async def retain_decision(
        self, bank_id: str, document_id: str, text: str,
        entity: str, issue_id: str, metrics: List[str],
        period: str, decision: str, review_id: str,
    ) -> bool:
        """Retains an analyst decision with enough context for future recall."""
        meta = {
            "memory_type": "analyst_decision",
            "entity": entity,
            "issue_id": issue_id,
            "review_id": review_id,
            "metrics": metrics,
            "period": period,
            "decision": decision,
            "retained_at": self._now(),
        }
        return await self.adapter.retain_review(bank_id, document_id=document_id, text=text, meta=meta)

    async def retain_evidence_request_outcome(
        self, bank_id: str, document_id: str, text: str,
        issue_type: str, request_summary: str,
        outcome: str, reason: str,
    ) -> bool:
        """Retains the outcome of an evidence request so future requests learn."""
        meta = {
            "memory_type": "evidence_request_outcome",
            "issue_type": issue_type,
            "request": request_summary,
            "outcome": outcome,
            "reason": reason,
            "retained_at": self._now(),
        }
        return await self.adapter.retain_review(bank_id, document_id=document_id, text=text, meta=meta)

    async def recall_for_evidence_request(
        self, bank_id: str, issue_type: str, metric: str,
        period: str, entity: Optional[str] = None,
    ) -> List[Any]:
        """Recalls past evidence request outcomes to improve future requests."""
        query_parts = [
            "evidence request outcome", issue_type, metric, period,
            "insufficient", "what was missing",
        ]
        if entity:
            query_parts.append(entity)
        return await self.adapter.recall(bank_id, " ".join(query_parts))
