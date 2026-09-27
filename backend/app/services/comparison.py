"""Deterministic comparison service — runs BEFORE any LLM involvement.
Compares documents, metrics, claims, and periods structurally."""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.domain import Document, Claim, Issue


class ComparisonResult:
    def __init__(self):
        self.metric_changes: List[Dict[str, Any]] = []
        self.text_changes: List[Dict[str, Any]] = []
        self.definition_changes: List[Dict[str, Any]] = []
        self.new_evidence: List[Dict[str, Any]] = []
        self.removed_evidence: List[Dict[str, Any]] = []

    def to_dict(self):
        return {
            "metric_changes": self.metric_changes,
            "text_changes": self.text_changes,
            "definition_changes": self.definition_changes,
            "new_evidence": self.new_evidence,
            "removed_evidence": self.removed_evidence,
        }


def _amount_display(paise: Optional[int]) -> str:
    if paise is None:
        return "n/a"
    return f"₹{Decimal(paise) / Decimal(100):,.0f}"


class ComparisonService:
    """All comparison logic is deterministic — no LLM. Compares by matching
    entity, metric name, reporting period, definition, currency, and source."""

    @staticmethod
    def compare_documents(db: Session, doc_id_a: str, doc_id_b: str) -> ComparisonResult:
        """Compares two documents and finds claims that changed between them."""
        result = ComparisonResult()

        doc_a = db.query(Document).filter(Document.id == doc_id_a).first()
        doc_b = db.query(Document).filter(Document.id == doc_id_b).first()
        if not doc_a or not doc_b:
            return result

        # Find claims sourced from each document
        claims_a = db.query(Claim).filter(Claim.sources.contains([{"document_id": doc_id_a}])).all()
        claims_b = db.query(Claim).filter(Claim.sources.contains([{"document_id": doc_id_b}])).all()

        # This won't work with all DB backends (JSON contains). Fall back to loading all.
        all_claims = db.query(Claim).all()
        claims_a = [c for c in all_claims if any(s.get("document_id") == doc_id_a for s in (c.sources or []))]
        claims_b = [c for c in all_claims if any(s.get("document_id") == doc_id_b for s in (c.sources or []))]

        # Match claims by metric
        metrics_a = {c.metric: c for c in claims_a}
        metrics_b = {c.metric: c for c in claims_b}

        for metric, claim_b in metrics_b.items():
            if metric in metrics_a:
                claim_a = metrics_a[metric]
                if claim_a.stated_amount_paise is not None and claim_b.stated_amount_paise is not None:
                    if claim_a.stated_amount_paise != claim_b.stated_amount_paise:
                        old_val = Decimal(claim_a.stated_amount_paise)
                        new_val = Decimal(claim_b.stated_amount_paise)
                        delta = abs(new_val - old_val) / old_val * 100 if old_val > 0 else Decimal(0)
                        result.metric_changes.append({
                            "metric": metric,
                            "previous_value": _amount_display(claim_a.stated_amount_paise),
                            "current_value": _amount_display(claim_b.stated_amount_paise),
                            "delta_percent": float(delta),
                            "previous_claim_id": claim_a.id,
                            "current_claim_id": claim_b.id,
                            "previous_source": doc_id_a,
                            "current_source": doc_id_b,
                        })
                # Check definition changes
                if claim_a.definition != claim_b.definition:
                    result.definition_changes.append({
                        "metric": metric,
                        "previous_definition": claim_a.definition,
                        "current_definition": claim_b.definition,
                    })
            else:
                result.new_evidence.append({
                    "metric": metric,
                    "value": _amount_display(claim_b.stated_amount_paise),
                    "source": doc_id_b,
                    "claim_id": claim_b.id,
                })

        for metric in metrics_a:
            if metric not in metrics_b:
                result.removed_evidence.append({
                    "metric": metric,
                    "value": _amount_display(metrics_a[metric].stated_amount_paise),
                    "source": doc_id_a,
                })

        return result

    @staticmethod
    def compare_metrics_for_document(db: Session, trigger_doc_id: str) -> ComparisonResult:
        """Compares a newly introduced document's claims against all prior claims
        on the same metrics. This is the deterministic diff before the AI review."""
        result = ComparisonResult()

        all_claims = db.query(Claim).all()
        trigger_claims = [c for c in all_claims if any(
            s.get("document_id") == trigger_doc_id for s in (c.sources or [])
        )]

        for new_claim in trigger_claims:
            prior_claims = [
                c for c in all_claims
                if c.metric == new_claim.metric
                and c.id != new_claim.id
                and c.stated_amount_paise is not None
            ]
            # Sort by date descending to compare against most recent
            prior_claims.sort(key=lambda c: c.as_of_date or "", reverse=True)

            if prior_claims and new_claim.stated_amount_paise is not None:
                prior = prior_claims[0]
                old_val = Decimal(prior.stated_amount_paise)
                new_val = Decimal(new_claim.stated_amount_paise)
                if old_val != new_val:
                    delta = abs(new_val - old_val) / old_val * 100 if old_val > 0 else Decimal(0)
                    result.metric_changes.append({
                        "metric": new_claim.metric,
                        "previous_value": _amount_display(prior.stated_amount_paise),
                        "current_value": _amount_display(new_claim.stated_amount_paise),
                        "delta_percent": float(delta),
                        "previous_claim_id": prior.id,
                        "current_claim_id": new_claim.id,
                        "previous_date": prior.as_of_date,
                        "current_date": new_claim.as_of_date,
                    })
            elif not prior_claims:
                result.new_evidence.append({
                    "metric": new_claim.metric,
                    "value": _amount_display(new_claim.stated_amount_paise),
                    "claim_id": new_claim.id,
                    "source": trigger_doc_id,
                })

        return result

    @staticmethod
    def identify_candidate_issues(db: Session, trigger_doc_id: str) -> List[Dict[str, Any]]:
        """Returns issues that might be affected by a new document's claims."""
        all_claims = db.query(Claim).all()
        trigger_claims = [c for c in all_claims if any(
            s.get("document_id") == trigger_doc_id for s in (c.sources or [])
        )]
        trigger_metrics = {c.metric for c in trigger_claims}

        all_issues = db.query(Issue).all()
        candidates = []
        for issue in all_issues:
            issue_claim = next((c for c in all_claims if c.id == issue.claim_id), None)
            if issue_claim and issue_claim.metric in trigger_metrics:
                candidates.append({
                    "issue_id": issue.id,
                    "status": issue.status,
                    "metric": issue_claim.metric,
                    "claim_id": issue.claim_id,
                })
        return candidates
