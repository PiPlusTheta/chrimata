from app.services.evidence import EvidenceService
from app.schemas.domain import SourceRef

SRC = SourceRef(document_id="doc-x", locator="test")


def test_annualised_arr():
    calc = EvidenceService.calculate_annualised_arr(12_00_000_00, SRC, "2026-04-01")
    assert calc.amount_paise == 144_00_000_00  # ₹1.44 crore
    assert "Excludes signed-but-not-yet-active contracts and unsigned pipeline." in calc.assumptions


def test_simple_cash_runway():
    calc = EvidenceService.calculate_simple_runway(72_00_000_00, SRC, 18_00_000_00, SRC, "2026-04-01")
    assert calc.months == "4"


def test_proposed_cash_runway_is_labelled_as_a_scenario():
    calc = EvidenceService.calculate_proposed_runway(72_00_000_00, SRC, 108_00_000_00, SRC, 18_00_000_00, SRC, "2026-06-30")
    assert calc.months == "10"
    assert calc.status == "conditional"
    assert any("not yet signed" in a for a in calc.assumptions)


def test_inferred_post_churn_mrr_is_flagged_unconfirmed():
    calc = EvidenceService.calculate_inferred_post_churn_mrr(17_00_000_00, SRC, 4_00_000_00, SRC, "2026-07-05")
    assert calc.amount_paise == 13_00_000_00
    assert calc.status == "inferred"
    assert any("Not a confirmed figure" in a for a in calc.assumptions)
