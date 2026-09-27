"""ChangeReviewService — orchestrates the What Changed? pipeline for both
manual comparisons and AI-driven reviews."""
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.domain import Document, Claim, Issue
from app.models.investigation import ChangeReview
from app.schemas.investigation import (
    ChangeReviewSchema, DetectedChange, AIReviewOutput,
)
from app.services.comparison import ComparisonService
from app.services.investigation_memory import InvestigationMemoryService
from app.schemas.domain import IssueSchema


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ChangeReviewService:

    def __init__(self, memory_service: InvestigationMemoryService, agent_service=None):
        self.memory_service = memory_service
        self.agent_service = agent_service

    # ── Manual Comparison ──

    def create_manual_review(
        self, db: Session, run_id: str,
        document_ids: List[str],
        period_from: Optional[str], period_to: Optional[str],
        note: Optional[str],
    ) -> ChangeReviewSchema:
        """Creates a manual comparison review. Runs deterministic diff, persists result."""
        comparison = ComparisonService.compare_documents(
            db, document_ids[0], document_ids[1] if len(document_ids) > 1 else document_ids[0]
        )

        detected_changes = []
        for mc in comparison.metric_changes:
            detected_changes.append({
                "type": "metric_change",
                "statement": f"{mc['metric']}: {mc['previous_value']} → {mc['current_value']}",
                "source_ids": [mc.get("previous_source", ""), mc.get("current_source", "")],
                "previous_value": mc["previous_value"],
                "current_value": mc["current_value"],
            })
        for ne in comparison.new_evidence:
            detected_changes.append({
                "type": "new_evidence",
                "statement": f"New {ne['metric']}: {ne['value']}",
                "source_ids": [ne.get("source", "")],
            })

        review_id = f"cr_{uuid.uuid4().hex[:10]}"
        summary = note or f"Manual comparison of {len(document_ids)} documents."

        review = ChangeReview(
            id=review_id, run_id=run_id, mode="manual",
            trigger_type="manual_compare",
            comparison_document_ids=document_ids,
            period_from=period_from, period_to=period_to,
            summary=summary, author_type="human",
            finding_status="fact",
            detected_changes=detected_changes,
            affected_claim_ids=[],
            affected_issue_ids=[],
            unaffected_issue_ids=[],
            created_issue_ids=[],
            memory_ids_used=[],
            source_refs=[],
            created_at=_now(), updated_at=_now(),
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return ChangeReviewSchema.model_validate(review)

    # ── AI Review ──

    async def create_ai_review(
        self, db: Session, run_id: str, bank_id: str,
        trigger_document_id: str, memory_enabled: bool = True,
        persist: bool = True,
    ) -> Dict[str, Any]:
        """Implements the full AI review pipeline from step 1-10 of the plan."""
        # Step 1-2: Receive trigger, extract deterministic changes
        comparison = ComparisonService.compare_metrics_for_document(db, trigger_document_id)
        candidate_issues = ComparisonService.identify_candidate_issues(db, trigger_document_id)

        # Step 3: Gather context
        trigger_doc = db.query(Document).filter(Document.id == trigger_document_id).first()
        all_issues = db.query(Issue).all()
        all_claims = db.query(Claim).all()

        # Step 4-5: Recall Hindsight memories
        memory = []
        memory_texts = []
        if memory_enabled:
            metrics = list({mc["metric"] for mc in comparison.metric_changes})
            issue_types = [ci["metric"] for ci in candidate_issues]
            memory = await self.memory_service.recall_for_change_review(
                bank_id, entity="Northstar Ops", metrics=metrics,
                issue_types=issue_types, period=trigger_doc.document_date if trigger_doc else None,
            )
            for m in memory:
                t = getattr(m, "text", "") or ""
                if t:
                    memory_texts.append(t)

        # Step 6-7: Build context and run LLM reasoning
        ai_output = await self._run_ai_reasoning(
            db, trigger_doc, comparison, candidate_issues,
            all_issues, all_claims, memory_texts,
        )

        # Step 8: Validate references
        valid_doc_ids = {d.id for d in db.query(Document).all()}
        valid_claim_ids = {c.id for c in all_claims}
        valid_issue_ids = {i.id for i in all_issues}

        validated_affected_claims = [
            ac for ac in ai_output.get("affected_claims", [])
            if ac.get("claim_id") in valid_claim_ids
        ]
        validated_affected_issues = [
            ai for ai in ai_output.get("affected_issues", [])
            if ai.get("issue_id") in valid_issue_ids
        ]
        validated_unaffected_issues = [
            ui for ui in ai_output.get("unaffected_issues", [])
            if ui.get("issue_id") in valid_issue_ids
        ]

        memory_ids_used = [
            getattr(m, "id", None) or "" for m in memory if getattr(m, "id", None)
        ]

        # Step 9: Persist ChangeReview
        review_id = f"cr_{uuid.uuid4().hex[:10]}"
        created_issue_ids = []

        if persist:
            # Step 10: Create new issues if needed
            for ni in ai_output.get("new_issues", []):
                new_issue_id = f"issue-ai-{uuid.uuid4().hex[:6]}"
                from app.db.seed import event
                db.add(Issue(
                    id=new_issue_id, deal_id="demo",
                    claim_id=ai_output.get("affected_claims", [{}])[0].get("claim_id", ""),
                    status="open", question=ni.get("title", ""),
                    evidence_for=[], evidence_against=[],
                    history=[event("opened", f"Auto-opened by AI review {review_id}", [trigger_document_id])],
                    suggested_request=None,
                ))
                created_issue_ids.append(new_issue_id)

            review = ChangeReview(
                id=review_id, run_id=run_id, mode="agent",
                trigger_type="new_document",
                trigger_document_id=trigger_document_id,
                comparison_document_ids=[],
                summary=ai_output.get("summary", ""),
                author_type="agent",
                finding_status=ai_output.get("finding_status", "inference"),
                detected_changes=ai_output.get("changes", []),
                affected_claim_ids=[ac["claim_id"] for ac in validated_affected_claims],
                affected_issue_ids=[ai["issue_id"] for ai in validated_affected_issues],
                unaffected_issue_ids=[ui["issue_id"] for ui in validated_unaffected_issues],
                created_issue_ids=created_issue_ids,
                memory_ids_used=memory_ids_used,
                memory_context_summary="\n".join(memory_texts[:3]) if memory_texts else None,
                source_refs=[],
                created_at=_now(), updated_at=_now(),
            )
            db.add(review)
            db.commit()

        return {
            "review_id": review_id if persist else None,
            "summary": ai_output.get("summary", ""),
            "changes": ai_output.get("changes", []),
            "affected_claims": validated_affected_claims,
            "affected_issues": validated_affected_issues,
            "unaffected_issues": validated_unaffected_issues,
            "new_issues": ai_output.get("new_issues", []),
            "created_issue_ids": created_issue_ids,
            "memory_used": [{"memory_id": mid, "reason": "Recalled from Hindsight"} for mid in memory_ids_used],
            "memory_texts": memory_texts,
            "finding_status": ai_output.get("finding_status", "inference"),
            "deterministic_diff": comparison.to_dict(),
        }

    async def _run_ai_reasoning(
        self, db: Session, trigger_doc, comparison, candidate_issues,
        all_issues, all_claims, memory_texts,
    ) -> Dict[str, Any]:
        """Constructs the LLM prompt and parses structured output."""
        import json as json_mod
        from openai import OpenAI
        import os

        issues_data = [IssueSchema.model_validate(i).model_dump(mode="json") for i in all_issues]
        claims_data = [{"id": c.id, "metric": c.metric, "original_text": c.original_text,
                        "stated_amount_paise": c.stated_amount_paise, "as_of_date": c.as_of_date,
                        "definition": c.definition, "status": c.status} for c in all_claims]

        system_prompt = (
            "You are a financial due diligence AI. Analyze new evidence against existing claims and issues.\n\n"
            f"New document: {trigger_doc.title if trigger_doc else 'unknown'} (ID: {trigger_doc.id if trigger_doc else 'unknown'})\n"
            f"Content: {trigger_doc.content[:2000] if trigger_doc else ''}\n\n"
            f"Deterministic changes detected: {json_mod.dumps(comparison.to_dict())}\n"
            f"Candidate affected issues: {json_mod.dumps(candidate_issues)}\n"
            f"All current issues: {json_mod.dumps(issues_data)}\n"
            f"All current claims: {json_mod.dumps(claims_data)}\n"
            f"Retained memory from prior investigations: {json_mod.dumps(memory_texts)}\n\n"
            "Rules:\n"
            "1. Do NOT reopen resolved issues unless new evidence directly contradicts the resolution.\n"
            "2. Treat prior analyst decisions as authoritative unless explicitly overridden.\n"
            "3. Label inferences clearly. Never present an inference as fact.\n"
            "4. Only reference document/claim/issue IDs that actually exist in the data above.\n"
            "5. Do NOT perform arithmetic. Use only values already in the evidence.\n\n"
            "Respond in JSON:\n"
            '{"summary":"...","changes":[{"type":"...","statement":"...","source_ids":[]}],'
            '"affected_claims":[{"claim_id":"...","effect":"..."}],'
            '"affected_issues":[{"issue_id":"...","effect":"...","reason":"..."}],'
            '"unaffected_issues":[{"issue_id":"...","reason":"..."}],'
            '"new_issues":[{"title":"...","status":"open"}],'
            '"memory_used":[{"memory_id":"...","reason":"..."}],'
            '"finding_status":"inference"}'
        )

        api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        base_url = "https://api.x.ai/v1" if os.getenv("XAI_API_KEY") else None
        model = os.getenv("XAI_MODEL", "grok-3") if os.getenv("XAI_API_KEY") else "gpt-4o-mini"

        if not api_key:
            return {"summary": "LLM not configured", "changes": [], "finding_status": "inference"}

        try:
            client = OpenAI(api_key=api_key, base_url=base_url) if base_url else OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Analyze the new evidence. What changed? What prior conclusions are affected?"}
                ],
                response_format={"type": "json_object"},
            )
            return json_mod.loads(response.choices[0].message.content)
        except Exception as e:
            return {"summary": f"AI review error: {e}", "changes": [], "finding_status": "inference"}
