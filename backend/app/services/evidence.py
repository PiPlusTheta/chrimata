from typing import List
from app.schemas.domain import CalculationSchema

class EvidenceService:
    @staticmethod
    def calculate_annualised_arr(active_mrr: int, date: str, sources: List[str]) -> CalculationSchema:
        arr = active_mrr * 12
        return CalculationSchema(
            metric="ARR",
            value=str(arr),
            unit="INR",
            formula="active_mrr * 12",
            inputs={"active_mrr": active_mrr},
            source_ids=sources,
            as_of_date=date,
            assumptions=["Excludes future signed contracts and unsigned pipeline"]
        )

    @staticmethod
    def calculate_simple_runway(cash: int, burn: int, date: str, sources: List[str]) -> CalculationSchema:
        runway_months = cash / burn if burn > 0 else 0
        return CalculationSchema(
            metric="Cash Runway (Months)",
            value=str(round(runway_months, 1)),
            unit="Months",
            formula="cash / monthly_net_burn",
            inputs={"cash": cash, "monthly_net_burn": burn},
            source_ids=sources,
            as_of_date=date,
            assumptions=["Constant monthly burn rate"]
        )

    @staticmethod
    def calculate_proposed_runway(cash: int, proposed_financing: int, burn: int, date: str, sources: List[str]) -> CalculationSchema:
        runway_months = (cash + proposed_financing) / burn if burn > 0 else 0
        return CalculationSchema(
            metric="Cash Runway Scenario (Months)",
            value=str(round(runway_months, 1)),
            unit="Months",
            formula="(cash + proposed_financing) / monthly_net_burn",
            inputs={"cash": cash, "proposed_financing": proposed_financing, "monthly_net_burn": burn},
            source_ids=sources,
            as_of_date=date,
            assumptions=["Constant monthly burn rate", "Proposed financing of ₹1.08Cr closes"]
        )
