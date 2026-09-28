"""Lightweight regression tests for the expanded Chrimata seed registry.

After replacing app/core/seed.py with seed_expanded.py, change the import below
if your seed module lives somewhere else.
"""

from app.db.seed import (
    DEALS,
    DEAL_BY_ID,
    PAISE_PER_RUPEE,
    PAISE_PER_LAKH,
    PAISE_PER_CRORE,
    rupees,
    lakh,
    crore,
    fmt_inr,
)


def test_money_units_are_correct():
    assert PAISE_PER_RUPEE == 100
    assert PAISE_PER_LAKH == 10_000_000
    assert PAISE_PER_CRORE == 1_000_000_000
    assert rupees(1) == 100
    assert lakh(1) == 10_000_000
    assert crore(1) == 1_000_000_000


def test_money_formatting_boundaries():
    assert fmt_inr(1) == "₹0.01"
    assert fmt_inr(rupees(1)) == "₹1"
    assert fmt_inr(lakh(1)) == "₹1 lakh"
    assert fmt_inr(crore(1)) == "₹1 crore"
    assert fmt_inr(-lakh(4.5)) == "-₹4.5 lakh"


def test_company_ids_are_unique():
    ids = [d["id"] for d in DEALS]
    assert len(ids) == len(set(ids))
    assert len(DEAL_BY_ID) == len(DEALS)


def test_seed_has_broad_coverage():
    scenarios = {d["scenario"] for d in DEALS}
    required = {
        "baseline_issue",
        "clean_exact",
        "near_match",
        "brutal",
        "pre_revenue",
        "annual_prepay",
        "usage_based",
        "multi_currency",
        "restatement",
        "duplicate_ingestion",
        "negative_refund",
        "timed_churn",
        "expansion",
        "concentration",
        "restricted_cash",
        "signed_financing",
        "stale_data",
        "source_conflict",
        "runway_mismatch",
        "hostile_text",
        "huge_scale",
        "tiny_scale",
        "unicode",
        "non_recurring",
        "missing_metadata",
        "future_dated",
        "empty_deal",
        "document_only",
        "resolved_issue",
    }
    assert required <= scenarios
    assert len(DEALS) >= 30


def test_northstar_golden_path_values_are_preserved():
    northstar = DEAL_BY_ID["northstar"]
    assert northstar["arr_paise"] == crore(2.4)
    assert northstar["active_mrr_paise"] == lakh(12)
    assert northstar["contracted_mrr_paise"] == lakh(5)
    assert northstar["pipeline_mrr_paise"] == lakh(3)
    assert northstar["cash_paise"] == lakh(72)
    assert northstar["burn_paise"] == lakh(18)
    assert northstar["financing_paise"] == crore(1.08)
    assert northstar["runway_months"] == "3-4"


def test_exact_match_fixture_reconciles_arr_to_mrr():
    deal = DEAL_BY_ID["cybernetic"]
    assert deal["arr_paise"] == deal["active_mrr_paise"] * 12


def test_empty_and_document_only_fixtures_do_not_seed_baseline():
    assert DEAL_BY_ID["emptyco"]["seed_baseline"] is False
    assert DEAL_BY_ID["rawonly"]["seed_baseline"] is False


def test_big_integer_fixture_is_far_above_32_bit_range():
    # Guards against regressions back to SQL Integer for monetary amounts.
    assert DEAL_BY_ID["megainfra"]["arr_paise"] > 2_147_483_647


def test_tiny_fixture_reaches_rupee_scale():
    assert DEAL_BY_ID["nanosaas"]["active_mrr_paise"] == rupees(1)
