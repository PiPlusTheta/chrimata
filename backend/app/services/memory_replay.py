"""MemoryReplayService — runs the same evidence through the AI review pipeline
twice: once without memory, once with. The results are compared server-side
to show exactly how Hindsight changes the investigation."""
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.services.change_review import ChangeReviewService
from app.schemas.investigation import (
    MemoryReplayResponse, ReplayResult, ReplayDifference, MemoryUsed,
)


class MemoryReplayService:

    def __init__(self, change_review_service: ChangeReviewService):
        self.change_review_service = change_review_service

    async def replay(
        self, db: Session, run_id: str, bank_id: str,
        trigger_document_id: str,
    ) -> MemoryReplayResponse:
        """Runs the AI review pipeline twice — without and with memory.
        Neither run persists results or retains new memory (sandbox mode)."""

        # Run A: Memory OFF — no Hindsight recall
        without = await self.change_review_service.create_ai_review(
            db, run_id, bank_id,
            trigger_document_id=trigger_document_id,
            memory_enabled=False,
            persist=False,
        )

        # Run B: Memory ON — full Hindsight recall
        with_mem = await self.change_review_service.create_ai_review(
            db, run_id, bank_id,
            trigger_document_id=trigger_document_id,
            memory_enabled=True,
            persist=False,
        )

        # Compute differences server-side (NOT by LLM)
        differences = self._compute_differences(without, with_mem)

        memory_used = [
            MemoryUsed(memory_id=mu.get("memory_id", ""), reason=mu.get("reason", ""))
            for mu in with_mem.get("memory_used", [])
        ]

        return MemoryReplayResponse(
            without_memory=self._to_replay_result(without),
            with_memory=self._to_replay_result(with_mem),
            memory_used=memory_used,
            differences=differences,
        )

    def _to_replay_result(self, review_data: Dict[str, Any]) -> ReplayResult:
        """Converts raw AI review output to a ReplayResult."""
        return ReplayResult(
            summary=review_data.get("summary", ""),
            issues_opened=[ni.get("title", "") for ni in review_data.get("new_issues", [])],
            issues_left_resolved=[
                ui.get("issue_id", "") for ui in review_data.get("unaffected_issues", [])
            ],
            issues_reopened=[
                ai.get("issue_id", "") for ai in review_data.get("affected_issues", [])
                if ai.get("effect") == "reopened"
            ],
            evidence_requested=[],  # filled by evidence request service separately
            memory_references=[
                mu.get("memory_id", "") for mu in review_data.get("memory_used", [])
            ],
            finding_status=review_data.get("finding_status", "inference"),
        )

    def _compute_differences(
        self, without: Dict[str, Any], with_mem: Dict[str, Any],
    ) -> List[ReplayDifference]:
        """Deterministic server-side diff — NOT LLM-generated."""
        diffs = []

        # Compare unaffected issues
        unaffected_without = {ui.get("issue_id") for ui in without.get("unaffected_issues", [])}
        unaffected_with = {ui.get("issue_id") for ui in with_mem.get("unaffected_issues", [])}
        reopened_without = {
            ai.get("issue_id") for ai in without.get("affected_issues", [])
            if ai.get("effect") == "reopened"
        }
        reopened_with = {
            ai.get("issue_id") for ai in with_mem.get("affected_issues", [])
            if ai.get("effect") == "reopened"
        }

        # Issues that memory keeps resolved but no-memory might reopen
        for issue_id in unaffected_with - unaffected_without:
            diffs.append(ReplayDifference(
                field=f"issue_{issue_id}",
                without_memory="possibly related / reopened",
                with_memory="remains resolved (memory recalls prior resolution)",
            ))

        for issue_id in reopened_without - reopened_with:
            diffs.append(ReplayDifference(
                field=f"issue_{issue_id}",
                without_memory="reopened",
                with_memory="remains resolved (prior decision recalled)",
            ))

        # Compare new issues created
        new_without = [ni.get("title", "") for ni in without.get("new_issues", [])]
        new_with = [ni.get("title", "") for ni in with_mem.get("new_issues", [])]
        if new_without != new_with:
            diffs.append(ReplayDifference(
                field="new_issues",
                without_memory="; ".join(new_without) or "none",
                with_memory="; ".join(new_with) or "none",
            ))

        # Compare summaries
        if without.get("summary", "") != with_mem.get("summary", ""):
            diffs.append(ReplayDifference(
                field="summary",
                without_memory=without.get("summary", "")[:200],
                with_memory=with_mem.get("summary", "")[:200],
            ))

        # Memory references (only in with_memory)
        mem_refs = with_mem.get("memory_texts", [])
        if mem_refs:
            diffs.append(ReplayDifference(
                field="memory_context",
                without_memory="(no prior memory available)",
                with_memory=f"{len(mem_refs)} prior memories recalled",
            ))

        return diffs
