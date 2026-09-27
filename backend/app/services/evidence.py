from decimal import Decimal
from typing import List
from app.schemas.domain import CalculationSchema, CalculationInput, SourceRef


def _months(value: Decimal) -> str:
    q = value.quantize(Decimal("0.1"))
    return format(q, "f").rstrip("0").rstrip(".") if "." in format(q, "f") else format(q, "f")


class EvidenceService:
    """Deterministic, auditable financial calculations. No LLM ever performs this arithmetic."""

    @staticmethod
    def calculate_annualised_arr(active_mrr_paise: int, active_mrr_source: SourceRef, date: str) -> CalculationSchema:
        arr = active_mrr_paise * 12
        return CalculationSchema(
            id="calc-live-arr-apr",
            metric="live_annualised_arr",
            amount_paise=arr,
            as_of_date=date,
            status="calculated",
            formula="active_mrr × 12",
            inputs=[CalculationInput(label="active_mrr", amount_paise=active_mrr_paise, source=active_mrr_source)],
            assumptions=["Active subscriptions remain constant for 12 months.", "Excludes signed-but-not-yet-active contracts and unsigned pipeline."],
            sources=[active_mrr_source],
        )

    @staticmethod
    def calculate_simple_runway(cash_paise: int, cash_source: SourceRef, burn_paise: int, burn_source: SourceRef, date: str) -> CalculationSchema:
        months = (Decimal(cash_paise) / Decimal(burn_paise)) if burn_paise > 0 else Decimal(0)
        return CalculationSchema(
            id="calc-runway-base",
            metric="simple_cash_runway",
            months=_months(months),
            as_of_date=date,
            status="calculated",
            formula="cash / monthly_net_burn",
            inputs=[
                CalculationInput(label="cash", amount_paise=cash_paise, source=cash_source),
                CalculationInput(label="monthly_net_burn", amount_paise=burn_paise, source=burn_source),
            ],
            assumptions=["Constant monthly burn rate", "No new financing"],
            sources=[cash_source, burn_source],
        )

    @staticmethod
    def calculate_proposed_runway(
        cash_paise: int, cash_source: SourceRef,
        proposed_financing_paise: int, financing_source: SourceRef,
        burn_paise: int, burn_source: SourceRef,
        date: str,
    ) -> CalculationSchema:
        months = ((Decimal(cash_paise) + Decimal(proposed_financing_paise)) / Decimal(burn_paise)) if burn_paise > 0 else Decimal(0)
        return CalculationSchema(
            id="calc-runway-scenario",
            metric="simple_cash_runway",
            months=_months(months),
            as_of_date=date,
            status="conditional",
            formula="(cash + proposed_financing) / monthly_net_burn",
            inputs=[
                CalculationInput(label="cash", amount_paise=cash_paise, source=cash_source),
                CalculationInput(label="proposed_financing", amount_paise=proposed_financing_paise, source=financing_source),
                CalculationInput(label="monthly_net_burn", amount_paise=burn_paise, source=burn_source),
            ],
            assumptions=["Constant monthly burn rate", "Assumes the proposed financing closes on the draft term sheet's terms — not yet signed"],
            sources=[cash_source, financing_source, burn_source],
        )

    @staticmethod
    def calculate_inferred_post_churn_mrr(
        reported_mrr_paise: int, reported_source: SourceRef,
        churned_mrr_paise: int, churned_source: SourceRef,
        date: str,
    ) -> CalculationSchema:
        inferred = reported_mrr_paise - churned_mrr_paise
        return CalculationSchema(
            id="calc-mrr-post-churn-jul",
            metric="mrr_after_reported_churn",
            amount_paise=inferred,
            as_of_date=date,
            status="inferred",
            formula="reported_mrr - churned_mrr",
            inputs=[
                CalculationInput(label="reported_mrr", amount_paise=reported_mrr_paise, source=reported_source),
                CalculationInput(label="churned_mrr", amount_paise=churned_mrr_paise, source=churned_source),
            ],
            assumptions=[
                "Reported MRR predates the churn notice",
                "Not a confirmed figure — requires the July billing ledger to verify no offsetting new revenue landed in the same period",
            ],
            sources=[reported_source, churned_source],
        )
