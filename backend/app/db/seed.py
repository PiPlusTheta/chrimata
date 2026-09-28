import uuid
import pathlib
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.domain import (
    Document,
    Claim,
    Issue,
    Review,
    Deal,
    ChatSession,
    ChatMessage,
)
from app.models.investigation import ChangeReview, EvidenceRequest, DecisionReceipt


DATA_DIR = pathlib.Path(__file__).resolve().parents[3] / "data" / "demo"

# ---------------------------------------------------------------------------
# Money helpers
# ---------------------------------------------------------------------------
# Store every monetary value in paise. Do not hand-write paise literals in the
# fixtures: that is how the old seed ended up with lakh/crore values off by 10x
# or 100x.
PAISE_PER_RUPEE = 100
PAISE_PER_LAKH = 10_000_000       # ₹1,00,000 * 100
PAISE_PER_CRORE = 1_000_000_000  # ₹1,00,00,000 * 100


def _to_paise(value: Any, multiplier: int) -> int:
    return int((Decimal(str(value)) * Decimal(multiplier)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def rupees(value: Any) -> int:
    return _to_paise(value, PAISE_PER_RUPEE)


def lakh(value: Any) -> int:
    return _to_paise(value, PAISE_PER_LAKH)


def crore(value: Any) -> int:
    return _to_paise(value, PAISE_PER_CRORE)


def _fmt_decimal(value: Decimal, places: int = 2) -> str:
    text = f"{value:.{places}f}"
    return text.rstrip("0").rstrip(".")


def fmt_inr(amount_paise: Optional[int]) -> str:
    if amount_paise is None:
        return "₹—"
    sign = "-" if amount_paise < 0 else ""
    value = abs(Decimal(amount_paise))
    if value >= PAISE_PER_CRORE:
        return f"{sign}₹{_fmt_decimal(value / PAISE_PER_CRORE)} crore"
    if value >= PAISE_PER_LAKH:
        return f"{sign}₹{_fmt_decimal(value / PAISE_PER_LAKH)} lakh"
    return f"{sign}₹{_fmt_decimal(value / PAISE_PER_RUPEE)}"


def _read(filename: str) -> str:
    path = DATA_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"Synthetic content for {filename}"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sref(document_id: str, locator: str, quote: str = None) -> dict:
    return {"document_id": document_id, "locator": locator, "quote": quote}


def event(kind: str, description: str, source_ids: list, at: str = "2026-04-01T00:00:00Z") -> dict:
    return {
        "id": f"evt_{uuid.uuid4().hex[:8]}",
        "at": at,
        "kind": kind,
        "description": description,
        "source_ids": source_ids,
    }


# ---------------------------------------------------------------------------
# Base document definitions
# ---------------------------------------------------------------------------
INITIAL_DOCS = [
    ("doc-deck-mar", "March Pitch Deck", "deck", "march_pitch_deck.md", "2026-03-15"),
    ("doc-ledger-apr", "April Billing Ledger", "ledger", "april_ledger.md", "2026-04-01"),
    ("doc-founder-email-apr", "Founder Email (April)", "email", "april_founder_email.md", "2026-04-15"),
    ("doc-cash-q1", "Q1 Cash Record", "cash", "q1_cash.md", "2026-04-01"),
    ("doc-contract-register-feb", "Feb Contract Register", "contract", "feb_contract_register.csv", "2026-02-28"),
    ("doc-activation-log-mar", "March Activation Log", "analyst_note", "march_activation_log.md", "2026-03-15"),
    ("doc-bank-statement-may", "May Bank Statement", "cash", "may_bank_statement.csv", "2026-05-31"),
    ("doc-term-sheet-jun", "June Financing Term Sheet", "contract", "june_financing_term_sheet.md", "2026-06-10"),
    ("doc-board-minutes-jun", "June Board Minutes", "analyst_note", "june_board_minutes.md", "2026-06-30"),
    ("doc-payroll-apr", "April Payroll Register", "ledger", "april_payroll_register.csv", "2026-04-30"),
    ("doc-stripe-export-mar", "March Stripe Export", "ledger", "march_stripe_export.csv", "2026-03-15"),
]

JULY_DOCS = [
    ("doc-update-jul", "July Investor Update", "update", "july_update.md", "2026-07-01"),
    ("doc-churn-notice-jul", "Customer Churn Notice", "notice", "july_churn.md", "2026-07-05"),
    ("doc-pipeline-jul", "July Sales Pipeline", "pipeline", "july_sales_pipeline.csv", "2026-07-01"),
    ("doc-founder-slack-aug", "August Founder Slack", "analyst_note", "august_founder_slack.md", "2026-08-10"),
]


# ---------------------------------------------------------------------------
# Company registry
# ---------------------------------------------------------------------------
# Every company intentionally exercises a distinct path. Values are declared in
# rupee units and converted to paise through helpers so fixtures remain legible.
#
# scenario legend:
#   baseline_issue           obvious ARR-vs-active-MRR mismatch
#   clean_exact              exact annualized-MRR match
#   near_match               rounding/tolerance case
#   brutal                   many malformed/adversarial/lifecycle cases
#   pre_revenue              zero-value metrics
#   annual_prepay            cash != revenue because of prepaid annual contracts
#   usage_based              MRR is not the right denominator for all revenue
#   multi_currency           USD source normalized to INR
#   restatement              superseding document versions
#   duplicate_ingestion      exact duplicate extraction candidate
#   negative_refund          legitimate negative amount / credit note
#   timed_churn              chronology matters
#   expansion                later upsell makes older ledger stale
#   concentration            mathematically correct but risky concentration
#   restricted_cash          gross cash != runway cash
#   signed_financing         proposed -> signed lifecycle
#   stale_data               old claim should not be compared as contemporaneous
#   source_conflict          founder narrative vs bank evidence
#   runway_mismatch          derived cash/burn math mismatch
#   hostile_text             rendering / sanitisation / long text
#   huge_scale               BigInteger upper-end coverage
#   tiny_scale               paise/rupee lower-end coverage
#   unicode                  Unicode / punctuation / Indian names
#   non_recurring            services/setup fees excluded from ARR
#   missing_metadata         null definition/quote/no-source paths
#   future_dated             future evidence must not rewrite past state
DEALS = [
    dict(id="northstar", name="Northstar Ops", industry="Enterprise B2B SaaS", stage="Series A",
         arr_paise=crore(2.40), active_mrr_paise=lakh(12), cash_paise=lakh(72), burn_paise=lakh(18),
         contracted_mrr_paise=lakh(5), pipeline_mrr_paise=lakh(3), financing_paise=crore(1.08), runway_months="3-4",
         has_issues=True, scenario="baseline_issue"),
    dict(id="cybernetic", name="Cybernetic Systems", industry="Industrial Robotics", stage="Series B",
         arr_paise=crore(1.44), active_mrr_paise=lakh(12), cash_paise=crore(3.2), burn_paise=lakh(24),
         has_issues=False, scenario="clean_exact"),
    dict(id="acme", name="Acme Corp", industry="Consumer Hardware", stage="Pre-Seed",
         arr_paise=lakh(50), active_mrr_paise=lakh(4.1), cash_paise=lakh(28), burn_paise=lakh(7),
         has_issues=False, scenario="near_match"),
    dict(id="globex", name="Globex Corporation", industry="Fintech", stage="Series C",
         arr_paise=crore(8), active_mrr_paise=lakh(50), cash_paise=crore(9.5), burn_paise=lakh(85),
         has_issues=True, scenario="brutal"),
    dict(id="initech", name="Initech", industry="Enterprise Software", stage="Series A",
         arr_paise=crore(1), active_mrr_paise=lakh(8), cash_paise=crore(1.1), burn_paise=lakh(11),
         has_issues=False, scenario="near_match"),
    dict(id="soyuz", name="Soyuz Aerospace", industry="Aerospace", stage="Series B",
         arr_paise=crore(3.2), active_mrr_paise=lakh(22), cash_paise=crore(4.8), burn_paise=lakh(42),
         has_issues=True, scenario="baseline_issue"),

    dict(id="zerobase", name="ZeroBase Labs", industry="Developer Tools", stage="Pre-Seed",
         arr_paise=0, active_mrr_paise=0, cash_paise=lakh(16), burn_paise=lakh(4),
         has_issues=False, scenario="pre_revenue"),
    dict(id="ledgerly", name="Ledgerly Cloud", industry="Accounting SaaS", stage="Seed",
         arr_paise=crore(2.16), active_mrr_paise=lakh(18), cash_paise=crore(1.6), burn_paise=lakh(14),
         has_issues=False, scenario="clean_exact"),
    dict(id="prepay", name="Prepay Labs", industry="Cybersecurity SaaS", stage="Series A",
         arr_paise=crore(3.6), active_mrr_paise=lakh(30), cash_paise=crore(6.3), burn_paise=lakh(28),
         has_issues=False, scenario="annual_prepay"),
    dict(id="metered", name="Metered Compute", industry="Cloud Infrastructure", stage="Series A",
         arr_paise=crore(2.7), active_mrr_paise=lakh(14), cash_paise=crore(2.1), burn_paise=lakh(22),
         has_issues=False, scenario="usage_based"),
    dict(id="atlas", name="Atlas Global", industry="Cross-border SaaS", stage="Series B",
         arr_paise=crore(5.25), active_mrr_paise=lakh(43.75), cash_paise=crore(4.2), burn_paise=lakh(31),
         has_issues=False, scenario="multi_currency"),
    dict(id="helios", name="Helios Health", industry="Healthtech", stage="Series B",
         arr_paise=crore(4.8), active_mrr_paise=lakh(36), cash_paise=crore(5.1), burn_paise=lakh(44),
         has_issues=True, scenario="restatement"),
    dict(id="mirrorpay", name="MirrorPay", industry="Payments", stage="Seed",
         arr_paise=crore(1.2), active_mrr_paise=lakh(10), cash_paise=lakh(92), burn_paise=lakh(10),
         has_issues=False, scenario="duplicate_ingestion"),
    dict(id="refundly", name="Refundly Commerce", industry="E-commerce Enablement", stage="Seed",
         arr_paise=crore(1.8), active_mrr_paise=lakh(15), cash_paise=crore(1.25), burn_paise=lakh(13),
         has_issues=False, scenario="negative_refund"),
    dict(id="orbitcrm", name="OrbitCRM", industry="Sales SaaS", stage="Series A",
         arr_paise=crore(2.04), active_mrr_paise=lakh(17), cash_paise=crore(1.8), burn_paise=lakh(17),
         has_issues=False, scenario="timed_churn"),
    dict(id="stackforge", name="StackForge", industry="DevOps", stage="Series A",
         arr_paise=crore(2.4), active_mrr_paise=lakh(20), cash_paise=crore(2.3), burn_paise=lakh(19),
         has_issues=False, scenario="expansion"),
    dict(id="whaleworks", name="WhaleWorks", industry="Enterprise Data", stage="Series B",
         arr_paise=crore(6), active_mrr_paise=lakh(50), cash_paise=crore(5.4), burn_paise=lakh(39),
         has_issues=False, scenario="concentration"),
    dict(id="finguard", name="FinGuard Treasury", industry="Fintech", stage="Series A",
         arr_paise=crore(2.88), active_mrr_paise=lakh(24), cash_paise=crore(4), burn_paise=lakh(30),
         has_issues=False, scenario="restricted_cash"),
    dict(id="bridgeai", name="BridgeAI", industry="AI Infrastructure", stage="Series A",
         arr_paise=crore(3), active_mrr_paise=lakh(25), cash_paise=lakh(54), burn_paise=lakh(18),
         has_issues=False, scenario="signed_financing"),
    dict(id="oldsignal", name="OldSignal Analytics", industry="Analytics", stage="Seed",
         arr_paise=crore(1.32), active_mrr_paise=lakh(11), cash_paise=lakh(83), burn_paise=lakh(9),
         has_issues=False, scenario="stale_data"),
    dict(id="audittrail", name="AuditTrail Systems", industry="RegTech", stage="Series A",
         arr_paise=crore(2.64), active_mrr_paise=lakh(22), cash_paise=crore(1.4), burn_paise=lakh(15),
         has_issues=True, scenario="source_conflict"),
    dict(id="runwaylabs", name="Runway Labs", industry="Productivity SaaS", stage="Seed",
         arr_paise=crore(1.08), active_mrr_paise=lakh(9), cash_paise=lakh(36), burn_paise=lakh(12),
         has_issues=True, scenario="runway_mismatch"),
    dict(id="sanitize", name="Sanitize Labs", industry="Security", stage="Seed",
         arr_paise=crore(0.84), active_mrr_paise=lakh(7), cash_paise=lakh(48), burn_paise=lakh(8),
         has_issues=False, scenario="hostile_text"),
    dict(id="megainfra", name="MegaInfra Grid", industry="Energy Infrastructure", stage="Growth",
         arr_paise=crore(99_990), active_mrr_paise=crore(8_332.5), cash_paise=crore(15_000), burn_paise=crore(850),
         has_issues=False, scenario="huge_scale"),
    dict(id="nanosaas", name="NanoSaaS", industry="Micro SaaS", stage="Bootstrapped",
         arr_paise=rupees(12), active_mrr_paise=rupees(1), cash_paise=rupees(499), burn_paise=rupees(37),
         has_issues=False, scenario="tiny_scale"),
    dict(id="bharatx", name="BharatX वित्त", industry="SMB Fintech", stage="Seed",
         arr_paise=crore(1.56), active_mrr_paise=lakh(13), cash_paise=lakh(96), burn_paise=lakh(12),
         has_issues=False, scenario="unicode"),
    dict(id="serviceplus", name="ServicePlus AI", industry="AI Services + SaaS", stage="Seed",
         arr_paise=crore(1.2), active_mrr_paise=lakh(10), cash_paise=crore(1.05), burn_paise=lakh(11),
         has_issues=False, scenario="non_recurring"),
    dict(id="sparseco", name="SparseCo", industry="Data Infrastructure", stage="Pre-Seed",
         arr_paise=lakh(24), active_mrr_paise=lakh(2), cash_paise=lakh(21), burn_paise=lakh(5),
         has_issues=False, scenario="missing_metadata"),
    dict(id="futureproof", name="FutureProof Systems", industry="InsurTech", stage="Series A",
         arr_paise=crore(2.4), active_mrr_paise=lakh(20), cash_paise=crore(2), burn_paise=lakh(18),
         has_issues=False, scenario="future_dated"),
    # True empty state: Deal exists, but no documents/claims/issues yet.
    dict(id="emptyco", name="EmptyCo", industry="Unknown", stage="Unspecified",
         arr_paise=0, active_mrr_paise=0, cash_paise=0, burn_paise=0,
         has_issues=False, scenario="empty_deal", seed_baseline=False),
    # Ingested document exists but extraction has not produced any claims yet.
    dict(id="rawonly", name="RawOnly Industries", industry="Manufacturing", stage="Seed",
         arr_paise=0, active_mrr_paise=0, cash_paise=0, burn_paise=0,
         has_issues=False, scenario="document_only", seed_baseline=False),
    # Completed investigation history with a resolved issue + persisted review.
    dict(id="historyco", name="HistoryCo", industry="B2B SaaS", stage="Seed",
         arr_paise=crore(1.2), active_mrr_paise=lakh(10), cash_paise=lakh(80), burn_paise=lakh(10),
         has_issues=False, scenario="resolved_issue"),
]

DEAL_BY_ID = {deal["id"]: deal for deal in DEALS}


# ---------------------------------------------------------------------------
# Generic seed helpers
# ---------------------------------------------------------------------------
def _add_document(
    db: Session,
    deal_id: str,
    doc_suffix: str,
    title: str,
    dtype: str,
    date: str,
    content: str,
    *,
    version: str = "1.0",
    source_url: Optional[str] = None,
    ingested_at: str = "2026-09-27T00:00:00Z",
) -> str:
    doc_id = f"{deal_id}-{doc_suffix}"
    db.add(Document(
        id=doc_id,
        deal_id=deal_id,
        title=title,
        type=dtype,
        version=version,
        document_date=date,
        ingested_at=ingested_at,
        content=content,
        source_url=source_url or f"seed://{deal_id}/{doc_suffix}",
        synthetic=True,
    ))
    return doc_id


def _add_claim(
    db: Session,
    *,
    deal_id: str,
    claim_suffix: str,
    metric: str,
    original_text: str,
    as_of_date: str,
    definition: Optional[str],
    sources: list,
    amount_paise: Optional[int] = None,
    stated_months: Optional[str] = None,
    status: str = "claimed",
    currency_code: Optional[str] = None,
    original_amount_minor: Optional[int] = None,
    fx_rate_to_inr: Optional[str] = None,
) -> str:
    claim_id = f"{deal_id}-{claim_suffix}"
    kwargs = dict(
        id=claim_id,
        deal_id=deal_id,
        metric=metric,
        original_text=original_text,
        as_of_date=as_of_date,
        definition=definition,
        status=status,
        sources=sources,
        created_at=_now(),
    )
    if amount_paise is not None:
        kwargs["stated_amount_paise"] = amount_paise
    if stated_months is not None:
        kwargs["stated_months"] = stated_months
    if currency_code is not None:
        kwargs["currency_code"] = currency_code
    if original_amount_minor is not None:
        kwargs["original_amount_minor"] = original_amount_minor
    if fx_rate_to_inr is not None:
        kwargs["fx_rate_to_inr"] = fx_rate_to_inr
    db.add(Claim(**kwargs))
    return claim_id


def _add_issue(
    db: Session,
    *,
    deal_id: str,
    issue_suffix: str,
    claim_id: str,
    question: str,
    evidence_for: list,
    evidence_against: list,
    suggested_request: str,
    status: str = "open",
    at: str = "2026-04-01T00:00:00Z",
    description: Optional[str] = None,
) -> str:
    issue_id = f"{deal_id}-{issue_suffix}"
    src_ids = sorted({r.get("document_id") for r in evidence_for + evidence_against if r.get("document_id")})
    db.add(Issue(
        id=issue_id,
        deal_id=deal_id,
        claim_id=claim_id,
        status=status,
        question=question,
        evidence_for=evidence_for,
        evidence_against=evidence_against,
        history=[event("opened", description or f"Issue opened: {question}", src_ids, at=at)],
        suggested_request=suggested_request,
    ))
    return issue_id


def _baseline_values(company: dict) -> tuple[int, int, int, int, str]:
    """Return contracted MRR, pipeline MRR, cash, burn and a coherent runway string."""
    mrr = company["active_mrr_paise"]
    cash = company.get("cash_paise", lakh(72))
    burn = company.get("burn_paise", lakh(18))
    contracted = company.get("contracted_mrr_paise", max(int(mrr * Decimal("0.20")), 0))
    pipeline = company.get("pipeline_mrr_paise", max(int(mrr * Decimal("0.30")), 0))
    if "runway_months" in company:
        runway = str(company["runway_months"])
    elif burn > 0:
        runway = _fmt_decimal(Decimal(cash) / Decimal(burn), 1)
    else:
        runway = "not burn-limited"
    return contracted, pipeline, cash, burn, runway


def _baseline_doc_content(company: dict, filename: str) -> str:
    name = company["name"]
    arr = company["arr_paise"]
    mrr = company["active_mrr_paise"]
    contracted, pipeline, cash, burn, runway = _baseline_values(company)
    financing = company.get("financing_paise", max(int(cash * Decimal("0.75")), lakh(5)))

    docs = {
        "march_pitch_deck.md": f"""# {name} — March Pitch Deck\n\nDate: 2026-03-15\n\nOur current ARR is {fmt_inr(arr)}.\nThe company describes ARR as recurring subscription revenue annualised at the reporting date.\n\nAppendix — commercial pipeline\nUnsigned opportunities are tracked separately from live recurring revenue.\n""",
        "april_ledger.md": f"""# {name} — April Billing Ledger\n\nDate: 2026-04-01\nActive Monthly Recurring Revenue: {fmt_inr(mrr)}.\nSigned contracts not yet active: {fmt_inr(contracted)} per month.\nUnsigned pipeline: {fmt_inr(pipeline)} per month.\n\nOnly active-billing customers are included in Active MRR.\n""",
        "april_founder_email.md": f"""Subject: April finance follow-up — {name}\n\nThe March deck and April ledger use different reporting dates. Signed-but-not-live and pipeline amounts must not be counted as active MRR unless explicitly stated.\n""",
        "q1_cash.md": f"""# {name} — Q1 Cash Record\n\nCurrent Cash: {fmt_inr(cash)}.\nMonthly Net Burn: {fmt_inr(burn)}.\n\nThese are management figures as of 2026-04-01.\n""",
        "feb_contract_register.csv": f"""customer,status,monthly_value\nAlpha,active,{fmt_inr(max(mrr - contracted, 0))}\nBeta,signed_not_active,{fmt_inr(contracted)}\n""",
        "march_activation_log.md": f"""# {name} — March Activation Log\n\nActivation log used to distinguish contracted customers from customers that are live and billable.\nActive-MRR control total: {fmt_inr(mrr)}.\n""",
        "may_bank_statement.csv": f"""date,description,amount\n2026-05-31,Closing balance,{fmt_inr(cash)}\n""",
        "june_financing_term_sheet.md": f"""# {name} — Draft Financing Term Sheet\n\nDate: 2026-06-10\nAmount: {fmt_inr(financing)}.\nStatus: Not yet signed.\nThe amount must not be included in cash until closing.\n""",
        "june_board_minutes.md": f"""# {name} — June Board Minutes\n\nAgenda item 1 — Liquidity\nSimple cash/burn runway estimate: approx {runway} months without the extension.\n\nPipeline recap\nManagement continues to track active, contracted-not-live, and unsigned pipeline separately.\n""",
        "april_payroll_register.csv": f"""month,category,amount\n2026-04,Payroll,{fmt_inr(max(int(burn * Decimal('0.55')), 0))}\n2026-04,Other operating burn,{fmt_inr(max(burn - int(burn * Decimal('0.55')), 0))}\n""",
        "march_stripe_export.csv": f"""row,kind,amount,note\n1,recurring,{fmt_inr(mrr)},active recurring control total\n47,other_income,{fmt_inr(lakh(2.1))},unclassified\n""",
    }
    return docs.get(filename, _read(filename))


def seed_deal(
    db: Session,
    deal_id: str,
    arr_paise: int,
    active_mrr_paise: int,
    has_issues: bool = True,
    *,
    company: Optional[dict] = None,
    run_id: Optional[str] = None,
) -> str:
    """Seed the common financial/evidence baseline for one deal.

    Existing public IDs are preserved for the six original companies.
    """
    run_id = run_id or f"run_{uuid.uuid4().hex[:12]}"
    company = company or {
        "id": deal_id,
        "name": deal_id,
        "arr_paise": arr_paise,
        "active_mrr_paise": active_mrr_paise,
        "cash_paise": lakh(72),
        "burn_paise": lakh(18),
    }

    contracted_mrr, pipeline_mrr, cash, burn, runway = _baseline_values(company)
    financing = company.get("financing_paise", max(int(cash * Decimal("0.75")), lakh(5)))

    for doc_base_id, title, dtype, filename, date in INITIAL_DOCS:
        db.add(Document(
            id=f"{deal_id}-{doc_base_id}",
            deal_id=deal_id,
            title=title,
            type=dtype,
            version="1.0",
            document_date=date,
            ingested_at="2026-09-27T00:00:00Z",
            content=_baseline_doc_content(company, filename),
            source_url=f"seed://{deal_id}/{filename}",
            synthetic=True,
        ))
    db.commit()

    claims = [
        Claim(
            id=f"{deal_id}-claim-arr-mar",
            deal_id=deal_id,
            metric="arr",
            original_text=f"Our current ARR is {fmt_inr(arr_paise)}.",
            stated_amount_paise=arr_paise,
            as_of_date="2026-03-15",
            definition="Annual Recurring Revenue as stated in the March pitch deck",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-deck-mar", "paragraph 1", f"Our current ARR is {fmt_inr(arr_paise)}.")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-active-mrr-apr",
            deal_id=deal_id,
            metric="active_mrr",
            original_text=f"Active Monthly Recurring Revenue: {fmt_inr(active_mrr_paise)}.",
            stated_amount_paise=active_mrr_paise,
            as_of_date="2026-04-01",
            definition="MRR from customers currently active and billing",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-contracted-mrr-apr",
            deal_id=deal_id,
            metric="contracted_mrr",
            original_text=f"Signed contracts not yet active: {fmt_inr(contracted_mrr)}.",
            stated_amount_paise=contracted_mrr,
            as_of_date="2026-04-01",
            definition="Signed but not-yet-active monthly revenue — excluded from live ARR",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-ledger-apr", "Signed contracts not yet active line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-pipeline-mrr-apr",
            deal_id=deal_id,
            metric="pipeline_mrr",
            original_text=f"Unsigned pipeline: {fmt_inr(pipeline_mrr)}.",
            stated_amount_paise=pipeline_mrr,
            as_of_date="2026-04-01",
            definition="Unsigned sales pipeline monthly value — excluded from live ARR",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-ledger-apr", "Unsigned pipeline line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-cash-q1",
            deal_id=deal_id,
            metric="cash",
            original_text=f"Current Cash: {fmt_inr(cash)}.",
            stated_amount_paise=cash,
            as_of_date="2026-04-01",
            definition="Cash on hand per the Q1 cash record",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-cash-q1", "Current Cash line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-burn-q1",
            deal_id=deal_id,
            metric="burn",
            original_text=f"Monthly Net Burn: {fmt_inr(burn)}.",
            stated_amount_paise=burn,
            as_of_date="2026-04-01",
            definition="Net cash burn per month per the Q1 cash record",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-cash-q1", "Monthly Net Burn line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-financing-proposed-jun",
            deal_id=deal_id,
            metric="proposed_financing",
            original_text=f"Amount: {fmt_inr(financing)}. Not yet signed.",
            stated_amount_paise=financing,
            as_of_date="2026-06-10",
            definition="Financing amount in the draft term sheet — not yet signed and not cash",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-term-sheet-jun", "Amount line")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-runway-jul",
            deal_id=deal_id,
            metric="runway",
            original_text=f"Simple cash/burn runway estimate: approx {runway} months without the extension.",
            stated_months=runway,
            as_of_date="2026-06-30",
            definition="Board's qualitative runway estimate, pending the financing extension",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-board-minutes-jun", "Agenda item 1")],
            created_at=_now(),
        ),
    ]
    db.add_all(claims)
    db.commit()

    if has_issues:
        _add_issue(
            db,
            deal_id=deal_id,
            issue_suffix="issue-arr-apr",
            claim_id=f"{deal_id}-claim-arr-mar",
            question=(
                f"March deck states {fmt_inr(arr_paise)} ARR, but April active MRR is "
                f"{fmt_inr(active_mrr_paise)} ({fmt_inr(active_mrr_paise * 12)} annualised). "
                "Are the definitions or reporting dates different?"
            ),
            evidence_for=[sref(f"{deal_id}-doc-deck-mar", "paragraph 1")],
            evidence_against=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")],
            description="Issue opened: stated ARR does not reconcile to annualised active MRR.",
            suggested_request="Ask for the ARR bridge by customer and confirm whether contracted-but-not-live or non-recurring revenue is included.",
        )
        db.commit()

    return run_id


# ---------------------------------------------------------------------------
# Scenario-specific fixtures
# ---------------------------------------------------------------------------
def _seed_brutal_cases(db: Session, deal_id: str):
    """Dense adversarial fixture: duplication, boundaries, missing metadata,
    negative values, hostile text, conflicting same-date assertions, and a full
    open -> explained -> reopened review lifecycle.
    """
    # Legitimate same-value claims from different dates/sources: must not merge.
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-pipeline-mar", metric="pipeline_mrr",
        original_text="Unsigned pipeline: ₹9 lakh/month.", amount_paise=lakh(9), as_of_date="2026-03-01",
        definition="Unsigned sales pipeline as of March board deck",
        sources=[sref(f"{deal_id}-doc-deck-mar", "appendix, pipeline table")],
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-pipeline-may", metric="pipeline_mrr",
        original_text="Unsigned pipeline: ₹9 lakh/month (unchanged).", amount_paise=lakh(9), as_of_date="2026-05-01",
        definition="Unsigned sales pipeline as of May board update",
        sources=[sref(f"{deal_id}-doc-board-minutes-jun", "pipeline recap")],
    )

    # Boundary values: one paise, one rupee, zero, huge BigInteger, and negative.
    for suffix, metric, text, amount in [
        ("claim-boundary-one-paise", "rounding_adjustment", "Rounding adjustment: ₹0.01.", 1),
        ("claim-boundary-one-rupee", "misc_fee", "Bank account maintenance fee: ₹1.", rupees(1)),
        ("claim-boundary-zero", "waived_fee", "Waived platform fee: ₹0.", 0),
        ("claim-boundary-max", "total_addressable_market", "Deck-asserted TAM: ₹99,990 crore.", crore(99_990)),
        ("claim-negative", "refunds", "Customer credit notes issued: -₹4.5 lakh.", -lakh(4.5)),
    ]:
        _add_claim(
            db, deal_id=deal_id, claim_suffix=suffix, metric=metric, original_text=text,
            amount_paise=amount, as_of_date="2026-04-01",
            definition="Boundary/adversarial seed fixture",
            sources=[sref(f"{deal_id}-doc-bank-statement-may", "boundary test line")],
        )

    # Null metadata + no quote.
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-no-metadata", metric="other_income",
        original_text="Misc other income, ₹2.1 lakh, unclassified in export.", amount_paise=lakh(2.1),
        as_of_date="2026-04-30", definition=None,
        sources=[sref(f"{deal_id}-doc-stripe-export-mar", "row 47", None)],
    )

    # No source at all: useful for citation-state / evidence-request UI.
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-no-source", metric="verbal_pipeline",
        original_text="Founder verbally mentioned ~₹14 lakh/month of late-stage pipeline.", amount_paise=lakh(14),
        as_of_date="2026-06-30", definition="Verbal claim with no uploaded supporting artifact", sources=[],
    )

    # Messy punctuation and non-GAAP wording.
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-messy-text", metric="adj_ebitda",
        original_text="Adj. EBITDA (Mgmt-adj*, unaudited) — Q1'26: (₹4,50,000) — *excludes one-time legal costs",
        amount_paise=-lakh(4.5), as_of_date="2026-03-31",
        definition="Management-adjusted EBITDA, a non-GAAP figure explicitly marked unaudited",
        sources=[sref(f"{deal_id}-doc-board-minutes-jun", "financials appendix")],
    )

    # Potential HTML/script injection must render as text, never execute.
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-hostile-markup", metric="note",
        original_text='<img src=x onerror="alert(1)"> Founder note: <script>alert("x")</script> ARR unchanged.',
        amount_paise=lakh(1), as_of_date="2026-04-15",
        definition="Security fixture: untrusted extracted document text",
        sources=[sref(f"{deal_id}-doc-founder-email-apr", "malformed html block")],
    )

    # Same metric + same date + contradictory amounts. The engine must preserve
    # both and surface a conflict rather than choosing whichever was inserted last.
    conflict_doc = _add_document(
        db, deal_id, "doc-mrr-counterstatement-apr", "April Finance Counterstatement", "email", "2026-04-01",
        "Controller email: Active MRR is ₹47 lakh, not ₹50 lakh; three invoices were paused before month-end.",
    )
    counter_claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-active-mrr-counter-apr", metric="active_mrr",
        original_text="Active MRR is ₹47 lakh, not ₹50 lakh.", amount_paise=lakh(47), as_of_date="2026-04-01",
        definition="Controller's same-date corrected active-MRR assertion",
        sources=[sref(conflict_doc, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-same-date-mrr-conflict", claim_id=counter_claim,
        question="Two 2026-04-01 sources assert different active MRR values (₹50 lakh vs ₹47 lakh). Which is authoritative?",
        evidence_for=[sref(conflict_doc, "sentence 1")],
        evidence_against=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")],
        suggested_request="Request the invoice-level April close ledger and identify whether paused invoices were included.",
        at="2026-04-02T00:00:00Z",
    )
    db.commit()

    # Full open -> explained -> reopened lifecycle.
    issue_id = _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-pipeline-consistency",
        claim_id=f"{deal_id}-claim-pipeline-may",
        question="Pipeline stayed exactly ₹9 lakh/month from March to May. Was it recalculated or carried forward?",
        evidence_for=[sref(f"{deal_id}-doc-board-minutes-jun", "pipeline recap")],
        evidence_against=[sref(f"{deal_id}-doc-deck-mar", "appendix, pipeline table")],
        suggested_request="Request the underlying CRM pipeline export to prove the composition changed.",
        at="2026-05-02T00:00:00Z",
        description="Issue opened: identical pipeline figure reported two months apart.",
    )
    db.commit()

    reopened_issue = db.query(Issue).filter(Issue.id == issue_id).one()
    review1 = Review(
        id=f"{deal_id}-review-pipeline-1",
        issue_id=issue_id,
        decision="accept_explanation",
        explanation="Founder said some deals closed and new ones entered, coincidentally netting to the same total.",
        reviewed_at="2026-05-10T00:00:00Z",
        reviewer="analyst",
        memory_status="retained",
    )
    db.add(review1)
    reopened_issue.status = "explained"
    reopened_issue.history = list(reopened_issue.history) + [
        event("reviewed", f"Review {review1.id} recorded decision 'accept_explanation'.", [], at="2026-05-10T00:00:00Z")
    ]
    db.commit()

    review2 = Review(
        id=f"{deal_id}-review-pipeline-2",
        issue_id=issue_id,
        decision="dispute",
        explanation="CRM export was not provided after three follow-ups; the explanation cannot be verified.",
        reviewed_at="2026-06-15T00:00:00Z",
        reviewer="analyst",
        memory_status="pending",
    )
    db.add(review2)
    reopened_issue.status = "reopened"
    reopened_issue.history = list(reopened_issue.history) + [
        event("reopened", f"Review {review2.id} recorded decision 'dispute'.", [], at="2026-06-15T00:00:00Z")
    ]
    db.commit()


def _seed_pre_revenue(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-pre-revenue-note", "Pre-Revenue Operating Note", "analyst_note", "2026-04-20",
        "The product is in private beta. There are no paying customers. Pilot LOIs are non-binding and carry no recurring revenue.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-paying-customers-zero", metric="paying_customers",
        original_text="Paying customers: 0.", amount_paise=0, as_of_date="2026-04-20",
        definition="Count-like fixture represented in the existing amount field for zero-value boundary coverage",
        sources=[sref(doc, "sentence 2")],
    )
    db.commit()


def _seed_annual_prepay(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-prepaid-contract", "Annual Prepaid Enterprise Contract", "contract", "2026-04-12",
        "Customer paid ₹1.2 crore upfront for a 12-month subscription. Recognised recurring value is ₹10 lakh/month; cash receipt is not one-month MRR.",
    )
    claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-annual-prepay-cash", metric="cash_receipt",
        original_text="Annual subscription cash collected upfront: ₹1.2 crore.", amount_paise=crore(1.2),
        as_of_date="2026-04-12", definition="Cash receipt for a 12-month prepaid subscription; do not treat as monthly revenue",
        sources=[sref(doc, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-prepay-classification", claim_id=claim,
        question="The bank shows a ₹1.2 crore receipt, but only ₹10 lakh/month is recurring value. Is the system keeping cash, billings and MRR separate?",
        evidence_for=[sref(doc, "sentence 1")],
        evidence_against=[sref(doc, "sentence 2")],
        suggested_request="Verify revenue recognition schedule; do not annualise the cash receipt.",
        at="2026-04-12T00:00:00Z",
    )
    db.commit()


def _seed_usage_based(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-usage-apr", "April Usage Revenue Export", "ledger", "2026-04-30",
        "Committed platform MRR: ₹14 lakh. Variable compute usage in April: ₹8.4 lakh. Usage is recurring in behavior but not contractually fixed.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-usage-revenue-apr", metric="usage_revenue",
        original_text="Variable usage revenue in April: ₹8.4 lakh.", amount_paise=lakh(8.4), as_of_date="2026-04-30",
        definition="Variable metered revenue; not committed MRR",
        sources=[sref(doc, "sentence 2")],
    )
    db.commit()


def _seed_multi_currency(db: Session, deal_id: str):
    usd_doc = _add_document(
        db, deal_id, "doc-usd-contract", "US Enterprise Contract", "contract", "2026-03-31",
        "Contracted subscription: USD 10,000/month. Treasury normalization for the seed uses ₹87.50/USD, i.e. ₹8.75 lakh/month.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-usd-mrr-normalized", metric="foreign_currency_mrr",
        original_text="USD 10,000/month; normalized at ₹87.50/USD to ₹8.75 lakh.", amount_paise=lakh(8.75),
        as_of_date="2026-03-31", definition="Foreign-currency recurring revenue normalized to INR at the stated FX rate",
        sources=[sref(usd_doc, "sentence 1")],
        currency_code="USD", original_amount_minor=10_000_00, fx_rate_to_inr="87.50",
    )

    # A second currency on the same deal, different FX rate and reporting date —
    # confirms currency handling isn't a single-hardcoded-rate special case.
    eur_doc = _add_document(
        db, deal_id, "doc-eur-contract", "EU Enterprise Contract", "contract", "2026-04-10",
        "Contracted subscription: EUR 6,000/month. Treasury normalization uses ₹95.20/EUR, i.e. ₹5.71 lakh/month.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-eur-mrr-normalized", metric="foreign_currency_mrr",
        original_text="EUR 6,000/month; normalized at ₹95.20/EUR to ₹5.71 lakh.", amount_paise=lakh(5.712),
        as_of_date="2026-04-10", definition="Foreign-currency recurring revenue normalized to INR at the stated FX rate",
        sources=[sref(eur_doc, "sentence 1")],
        currency_code="EUR", original_amount_minor=6_000_00, fx_rate_to_inr="95.20",
    )
    db.commit()


def _seed_restatement(db: Session, deal_id: str):
    old_doc = _add_document(
        db, deal_id, "doc-board-pack-may-v1", "May Board Pack", "deck", "2026-05-31",
        "Version 1.0: ARR was reported as ₹5.4 crore before correcting a duplicated customer contract.", version="1.0",
    )
    new_doc = _add_document(
        db, deal_id, "doc-board-pack-may-v2", "May Board Pack — Restated", "deck", "2026-05-31",
        "Version 2.0 RESTATED: ARR is ₹4.8 crore after removing a duplicated ₹5 lakh/month contract. Supersedes v1.0.", version="2.0",
    )
    old_claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-arr-may-v1", metric="arr",
        original_text="ARR: ₹5.4 crore.", amount_paise=crore(5.4), as_of_date="2026-05-31",
        definition="Original board-pack ARR before restatement", sources=[sref(old_doc, "sentence 1")],
    )
    new_claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-arr-may-v2", metric="arr",
        original_text="RESTATED ARR: ₹4.8 crore.", amount_paise=crore(4.8), as_of_date="2026-05-31",
        definition="Restated ARR; supersedes version 1.0", sources=[sref(new_doc, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-restatement", claim_id=new_claim,
        question="Two versions of the same May board pack contain different ARR. Has v2.0 been marked as the superseding source rather than treated as a contemporaneous contradiction?",
        evidence_for=[sref(new_doc, "sentence 1")], evidence_against=[sref(old_doc, "sentence 1")],
        suggested_request="Preserve both versions and attach supersession metadata; do not delete the historical assertion.",
        at="2026-06-01T00:00:00Z",
    )
    db.commit()


def _seed_duplicate_ingestion(db: Session, deal_id: str):
    # Intentionally duplicate extraction, separate IDs, identical source + text.
    for idx in (1, 2):
        _add_claim(
            db, deal_id=deal_id, claim_suffix=f"claim-duplicate-seat-count-{idx}", metric="licensed_seats",
            original_text="Licensed seats under contract: 1,250.", amount_paise=rupees(1250), as_of_date="2026-04-01",
            definition="Synthetic duplicate-ingestion fixture; semantically a count, not currency",
            sources=[sref(f"{deal_id}-doc-contract-register-feb", "row 2, licensed seats")],
        )
    db.commit()


def _seed_negative_refund(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-credit-notes", "April Credit Note Register", "ledger", "2026-04-30",
        "Credit notes issued: ₹6.2 lakh. Net expansion after credits: -₹1.2 lakh. Negative values are legitimate, not parse failures.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-net-expansion-negative", metric="net_expansion_mrr",
        original_text="Net expansion MRR: -₹1.2 lakh.", amount_paise=-lakh(1.2), as_of_date="2026-04-30",
        definition="Expansion less contraction and credits for the month",
        sources=[sref(doc, "sentence 2")],
    )
    db.commit()


def _seed_timed_churn(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-churn-after-cutoff", "Customer Churn Notice", "notice", "2026-04-05",
        "A ₹4 lakh/month customer churned effective 2026-04-05. The 2026-04-01 MRR snapshot was correct at its cutoff and must not be retroactively rewritten.",
    )
    churn_claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-churn-apr05", metric="churned_mrr",
        original_text="Customer churn effective 2026-04-05: ₹4 lakh/month.", amount_paise=lakh(4), as_of_date="2026-04-05",
        definition="MRR lost after the April 1 reporting cutoff", sources=[sref(doc, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-timing-churn", claim_id=churn_claim,
        question="A churn occurs four days after the April 1 MRR snapshot. The older snapshot should remain historically true while the current state changes.",
        evidence_for=[sref(doc, "sentence 1")], evidence_against=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")],
        suggested_request="Reconcile on an as-of-date basis; do not mark the April 1 claim false solely because of the April 5 event.",
        at="2026-04-05T00:00:00Z",
    )
    db.commit()


def _seed_expansion(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-expansion-may", "May Expansion Order", "contract", "2026-05-20",
        "Existing customer expanded by ₹6 lakh/month effective 2026-05-20. This should increase current MRR but not change the historical April 1 snapshot.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-expansion-may", metric="expansion_mrr",
        original_text="Expansion effective 2026-05-20: +₹6 lakh/month.", amount_paise=lakh(6), as_of_date="2026-05-20",
        definition="Incremental recurring revenue from an existing customer",
        sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_concentration(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-customer-concentration", "Customer Concentration Schedule", "ledger", "2026-04-01",
        "Total active MRR: ₹50 lakh. Largest customer: ₹35 lakh/month (70%). Remaining customers: ₹15 lakh/month.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-largest-customer-mrr", metric="largest_customer_mrr",
        original_text="Largest customer MRR: ₹35 lakh (70% of active MRR).", amount_paise=lakh(35), as_of_date="2026-04-01",
        definition="Largest single-customer recurring revenue concentration",
        sources=[sref(doc, "sentence 2")],
    )
    db.commit()


def _seed_restricted_cash(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-restricted-cash", "Treasury Cash Breakdown", "cash", "2026-04-01",
        "Gross cash: ₹4 crore. Restricted customer escrow: ₹2.5 crore. Unrestricted operating cash: ₹1.5 crore.",
    )
    claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-unrestricted-cash", metric="unrestricted_cash",
        original_text="Unrestricted operating cash: ₹1.5 crore.", amount_paise=crore(1.5), as_of_date="2026-04-01",
        definition="Cash available for operating runway after restricted escrow",
        sources=[sref(doc, "sentence 3")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-restricted-cash", claim_id=claim,
        question="Headline cash is ₹4 crore, but only ₹1.5 crore is unrestricted. Which balance is used for runway?",
        evidence_for=[sref(doc, "sentence 3")], evidence_against=[sref(f"{deal_id}-doc-cash-q1", "Current Cash line")],
        suggested_request="Use unrestricted operating cash for runway and preserve gross/restricted balances separately.",
    )
    db.commit()


def _seed_signed_financing(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-financing-close", "Financing Closing Notice", "contract", "2026-06-25",
        "The ₹1.08 crore extension signed and funded on 2026-06-25. This changes the status of the earlier proposed financing; it should not rewrite the term sheet's historical unsigned state.",
    )
    claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-financing-funded-jun", metric="financing_received",
        original_text="Financing funded: ₹1.08 crore on 2026-06-25.", amount_paise=crore(1.08), as_of_date="2026-06-25",
        definition="Cash proceeds received after signing/closing",
        sources=[sref(doc, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-financing-state-change", claim_id=claim,
        question="The June 10 term sheet was unsigned; the June 25 notice says it funded. Can the system represent a state transition instead of calling one source wrong?",
        evidence_for=[sref(doc, "sentence 1")], evidence_against=[sref(f"{deal_id}-doc-term-sheet-jun", "Status line")],
        suggested_request="Keep both states with their dates: proposed on June 10, funded on June 25.",
        at="2026-06-25T00:00:00Z",
    )
    db.commit()


def _seed_stale_data(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-old-arr", "December 2025 Investor Deck", "deck", "2025-12-31",
        "ARR as of 2025-12-31: ₹72 lakh. This is valid historical evidence but stale for an April 2026 current-state question.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-arr-dec25", metric="arr",
        original_text="ARR as of 2025-12-31: ₹72 lakh.", amount_paise=lakh(72), as_of_date="2025-12-31",
        definition="Historical ARR snapshot", sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_source_conflict(db: Session, deal_id: str):
    bank = _add_document(
        db, deal_id, "doc-bank-confirmation", "Bank Balance Confirmation", "cash", "2026-04-01",
        "Bank-confirmed closing available balance: ₹1.05 crore.",
    )
    founder = _add_document(
        db, deal_id, "doc-founder-cash-note", "Founder Cash Note", "email", "2026-04-01",
        "Founder email: 'We have about ₹1.4 crore cash available.' No reconciliation attached.",
    )
    bank_claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-bank-cash", metric="cash",
        original_text="Bank-confirmed available balance: ₹1.05 crore.", amount_paise=crore(1.05), as_of_date="2026-04-01",
        definition="Third-party bank-confirmed available balance", sources=[sref(bank, "sentence 1")],
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-founder-cash", metric="cash",
        original_text="We have about ₹1.4 crore cash available.", amount_paise=crore(1.4), as_of_date="2026-04-01",
        definition="Founder-stated available cash", sources=[sref(founder, "sentence 1")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-cash-source-conflict", claim_id=bank_claim,
        question="Founder says ₹1.4 crore available cash while the same-day bank confirmation shows ₹1.05 crore. What explains the ₹35 lakh difference?",
        evidence_for=[sref(bank, "sentence 1")], evidence_against=[sref(founder, "sentence 1")],
        suggested_request="Request a cash reconciliation covering pending deposits, restricted accounts and uncleared transfers.",
    )
    db.commit()


def _seed_runway_mismatch(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-runway-calculation", "Runway Calculation", "analyst_note", "2026-04-01",
        "Cash ₹36 lakh / monthly burn ₹12 lakh = 3.0 months of simple runway. Management deck says 6 months without a supporting burn-reduction plan.",
    )
    claim = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-runway-six-months", metric="runway",
        original_text="Management runway estimate: 6 months.", as_of_date="2026-04-01", stated_months="6",
        definition="Management estimate", sources=[sref(doc, "sentence 2")],
    )
    _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-runway-math", claim_id=claim,
        question="Cash/burn implies ~3.0 months of simple runway, while management states 6 months. Is there a documented burn reduction or incoming cash assumption?",
        evidence_for=[sref(doc, "sentence 2")], evidence_against=[sref(doc, "sentence 1")],
        suggested_request="Request monthly cash-flow forecast and identify explicit cost cuts or committed inflows supporting six months.",
    )
    db.commit()


def _seed_hostile_text(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-ocr-garbage", "OCR-imported Founder Note", "analyst_note", "2026-04-18",
        "<script>alert('x')</script>\nARR≈₹84,00,000??  \t  'FINAL_FINAL_v7' — \\x00 malformed-ish OCR marker.\nDo not execute markup; preserve text safely.",
    )
    long_text = "Long analyst note: " + ("customer-level reconciliation pending; " * 120)
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-long-text", metric="analyst_note",
        original_text=long_text, amount_paise=0, as_of_date="2026-04-18",
        definition="UI truncation/search robustness fixture", sources=[sref(doc, "full document")],
    )

    # A scanned artifact with no recoverable date stamp — document_date is
    # genuinely null, not an empty string. Exercises the Document.document_date
    # nullable path end-to-end (seed, API response, and UI rendering).
    _add_document(
        db, deal_id, "doc-undated-scan", "Undated Scanned Ledger Fragment", "ledger", None,
        "Poorly scanned ledger page. Header with the reporting date did not survive OCR; figures below are unverified without a date.",
    )
    db.commit()


def _seed_huge_scale(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-large-value", "Large Infrastructure Contract", "contract", "2026-04-22",
        "Multi-year contracted value: ₹250,000 crore. This exists to exercise BigInteger, formatting, export and chart-axis handling.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-huge-contract", metric="contract_value",
        original_text="Contracted value: ₹250,000 crore.", amount_paise=crore(250_000), as_of_date="2026-04-22",
        definition="Stress-test large integer", sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_tiny_scale(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-micropayment", "Micropayment Ledger", "ledger", "2026-04-01",
        "Active subscription: ₹1/month. Processor rounding adjustment: ₹0.01. One waived invoice: ₹0.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-one-paise", metric="rounding_adjustment",
        original_text="Processor rounding adjustment: ₹0.01.", amount_paise=1, as_of_date="2026-04-01",
        definition="Minimum representable monetary unit", sources=[sref(doc, "sentence 2")],
    )
    db.commit()


def _seed_unicode(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-unicode-note", "भारत Growth Note — Q1", "analyst_note", "2026-04-14",
        "ग्राहक ARR update: ₹1.56 crore — Bengaluru ↔ Hyderabad; founder wrote ‘growth ठीक है’. Emoji marker: 📈. Curly quotes and em—dashes are intentional.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-unicode", metric="narrative_arr",
        original_text="ग्राहक ARR update: ₹1.56 crore — growth ठीक है 📈", amount_paise=crore(1.56), as_of_date="2026-04-14",
        definition="Unicode ingestion/rendering fixture", sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_non_recurring(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-services-invoice", "Implementation Services Invoice", "ledger", "2026-04-25",
        "One-time implementation services: ₹30 lakh. Subscription MRR remains ₹10 lakh. Services are billings/revenue but not recurring ARR.",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-services-revenue", metric="non_recurring_revenue",
        original_text="One-time implementation services: ₹30 lakh.", amount_paise=lakh(30), as_of_date="2026-04-25",
        definition="Non-recurring professional services revenue excluded from ARR",
        sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_missing_metadata(db: Session, deal_id: str):
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-null-definition", metric="other_income",
        original_text="Other income ₹42,000.", amount_paise=rupees(42_000), as_of_date="2026-04-30",
        definition=None, sources=[sref(f"{deal_id}-doc-stripe-export-mar", "row 47", None)],
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-empty-sources", metric="verbal_commitment",
        original_text="Verbal commitment allegedly worth ₹3 lakh/month.", amount_paise=lakh(3), as_of_date="2026-04-30",
        definition="Claim intentionally has no source document", sources=[],
    )
    db.commit()


def _seed_future_dated(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-future-budget", "FY2027 Approved Budget", "analyst_note", "2027-04-01",
        "Projected ARR for FY2027: ₹12 crore. This is a forecast and future-dated; it must never overwrite 2026 actual ARR.",
        ingested_at="2026-09-27T00:00:00Z",
    )
    _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-future-arr", metric="forecast_arr",
        original_text="Projected FY2027 ARR: ₹12 crore.", amount_paise=crore(12), as_of_date="2027-04-01",
        definition="Forward-looking forecast, not actual ARR", sources=[sref(doc, "sentence 1")],
    )
    db.commit()


def _seed_document_only(db: Session, deal_id: str):
    _add_document(
        db, deal_id, "doc-unparsed-upload", "Uploaded Annual Report — Parsing Pending", "other", "2026-04-01",
        "Synthetic raw upload. Document is present, but claim extraction has intentionally not run yet.",
    )
    db.commit()


def _seed_resolved_issue(db: Session, deal_id: str):
    doc = _add_document(
        db, deal_id, "doc-reconciliation", "Revenue Reconciliation", "ledger", "2026-04-20",
        "The ₹1.2 crore ARR equals ₹10 lakh active MRR × 12. Earlier wording ambiguity was clarified; no numerical discrepancy remains.",
    )
    claim_id = _add_claim(
        db, deal_id=deal_id, claim_suffix="claim-reconciled-arr", metric="arr",
        original_text="Reconciled ARR: ₹1.2 crore.", amount_paise=crore(1.2), as_of_date="2026-04-20",
        definition="ARR reconciled directly to active MRR", sources=[sref(doc, "sentence 1")],
    )
    issue_id = _add_issue(
        db, deal_id=deal_id, issue_suffix="issue-wording-resolved", claim_id=claim_id,
        question="Did the older deck use ambiguous ARR wording?",
        evidence_for=[sref(doc, "sentence 1")], evidence_against=[sref(f"{deal_id}-doc-deck-mar", "paragraph 1")],
        suggested_request="No further evidence required after the reconciliation is verified.",
        at="2026-04-18T00:00:00Z",
    )
    db.commit()
    issue = db.query(Issue).filter(Issue.id == issue_id).one()
    review = Review(
        id=f"{deal_id}-review-wording-resolved", issue_id=issue_id, decision="accept_explanation",
        explanation="Reconciliation confirms ARR = active MRR × 12; ambiguity was wording-only.",
        reviewed_at="2026-04-20T00:00:00Z", reviewer="analyst", memory_status="retained",
    )
    db.add(review)
    issue.status = "resolved"
    issue.history = list(issue.history) + [
        event("resolved", f"Review {review.id} accepted reconciliation and resolved the issue.", [doc], at="2026-04-20T00:00:00Z")
    ]
    db.commit()


SCENARIO_SEEDERS = {
    "brutal": _seed_brutal_cases,
    "pre_revenue": _seed_pre_revenue,
    "annual_prepay": _seed_annual_prepay,
    "usage_based": _seed_usage_based,
    "multi_currency": _seed_multi_currency,
    "restatement": _seed_restatement,
    "duplicate_ingestion": _seed_duplicate_ingestion,
    "negative_refund": _seed_negative_refund,
    "timed_churn": _seed_timed_churn,
    "expansion": _seed_expansion,
    "concentration": _seed_concentration,
    "restricted_cash": _seed_restricted_cash,
    "signed_financing": _seed_signed_financing,
    "stale_data": _seed_stale_data,
    "source_conflict": _seed_source_conflict,
    "runway_mismatch": _seed_runway_mismatch,
    "hostile_text": _seed_hostile_text,
    "huge_scale": _seed_huge_scale,
    "tiny_scale": _seed_tiny_scale,
    "unicode": _seed_unicode,
    "non_recurring": _seed_non_recurring,
    "missing_metadata": _seed_missing_metadata,
    "future_dated": _seed_future_dated,
    "document_only": _seed_document_only,
    "resolved_issue": _seed_resolved_issue,
}


# ---------------------------------------------------------------------------
# Reset / global seed
# ---------------------------------------------------------------------------
def reset_db(db: Session) -> str:
    """Wipe and reseed the full deterministic scenario matrix.

    Returns Northstar's run_id for backward compatibility with the existing
    golden-path demo/tests.
    """
    db.query(DecisionReceipt).delete()
    db.query(EvidenceRequest).delete()
    db.query(ChangeReview).delete()
    db.query(ChatMessage).delete()
    db.query(ChatSession).delete()
    db.query(Review).delete()
    db.query(Issue).delete()
    db.query(Claim).delete()
    db.query(Document).delete()
    db.query(Deal).delete()
    db.commit()

    run_ids = {}
    for company in DEALS:
        run_id = f"run_{uuid.uuid4().hex[:12]}"

        # Parent first: safe when FK enforcement is enabled in Postgres/SQLite.
        db.add(Deal(
            id=company["id"],
            name=company["name"],
            industry=company["industry"],
            stage=company["stage"],
            synthetic=True,
            run_id=run_id,
            created_at=_now(),
        ))
        db.commit()

        if company.get("seed_baseline", True):
            seed_deal(
                db,
                company["id"],
                arr_paise=company["arr_paise"],
                active_mrr_paise=company["active_mrr_paise"],
                has_issues=company["has_issues"],
                company=company,
                run_id=run_id,
            )

        seeder = SCENARIO_SEEDERS.get(company.get("scenario"))
        if seeder:
            seeder(db, company["id"])

        run_ids[company["id"]] = run_id

    return run_ids["northstar"]


# ---------------------------------------------------------------------------
# Incremental evidence injection used by the demo flow
# ---------------------------------------------------------------------------
def introduce_july_evidence(
    db: Session,
    deal_id: str,
    *,
    current_mrr_paise: int = lakh(17),
    churned_mrr_paise: int = lakh(4),
) -> dict:
    """Introduce later evidence without rewriting earlier snapshots.

    Defaults preserve the original Northstar demo behavior; callers can pass
    deal-specific amounts for other companies.
    """
    if db.query(Document).filter(Document.id == f"{deal_id}-doc-update-jul").first():
        return {"introduced": False, "reason": "already introduced"}

    contents = {
        "july_update.md": f"# July Investor Update\n\nOur current MRR is {fmt_inr(current_mrr_paise)} as of 2026-07-01.\n",
        "july_churn.md": f"# Customer Churn Notice\n\nA major customer paying {fmt_inr(churned_mrr_paise)}/month churned effective 2026-07-05.\n",
        "july_sales_pipeline.csv": "stage,count,note\nlate_stage,4,synthetic pipeline fixture\n",
        "august_founder_slack.md": "Founder: July 1 MRR was a point-in-time snapshot; the July 5 churn happened later.\n",
    }

    for doc_base_id, title, dtype, filename, date in JULY_DOCS:
        db.add(Document(
            id=f"{deal_id}-{doc_base_id}",
            deal_id=deal_id,
            title=title,
            type=dtype,
            version="1.0",
            document_date=date,
            ingested_at="2026-09-27T00:00:00Z",
            content=contents[filename],
            source_url=f"seed://{deal_id}/{filename}",
            synthetic=True,
        ))
    db.commit()

    db.add_all([
        Claim(
            id=f"{deal_id}-claim-mrr-jul",
            deal_id=deal_id,
            metric="mrr",
            original_text=f"Our current MRR is {fmt_inr(current_mrr_paise)}.",
            stated_amount_paise=current_mrr_paise,
            as_of_date="2026-07-01",
            definition="Current MRR as stated in the July investor update",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-update-jul", "paragraph 1", f"Our current MRR is {fmt_inr(current_mrr_paise)}.")],
            created_at=_now(),
        ),
        Claim(
            id=f"{deal_id}-claim-churn-jul",
            deal_id=deal_id,
            metric="churned_mrr",
            original_text=f"A major customer paying {fmt_inr(churned_mrr_paise)}/month has churned.",
            stated_amount_paise=churned_mrr_paise,
            as_of_date="2026-07-05",
            definition="Monthly recurring revenue lost to a named churned customer",
            status="claimed",
            sources=[sref(f"{deal_id}-doc-churn-notice-jul", "paragraph 1")],
            created_at=_now(),
        ),
    ])
    db.commit()

    post_churn = current_mrr_paise - churned_mrr_paise
    db.add(Issue(
        id=f"{deal_id}-issue-mrr-jul",
        deal_id=deal_id,
        claim_id=f"{deal_id}-claim-mrr-jul",
        status="open",
        question=(
            f"July 1 update states {fmt_inr(current_mrr_paise)} current MRR, while a July 5 churn notice removes "
            f"{fmt_inr(churned_mrr_paise)}/month. Is post-churn MRR {fmt_inr(post_churn)} while the July 1 snapshot remains historically valid?"
        ),
        evidence_for=[sref(f"{deal_id}-doc-update-jul", "paragraph 1")],
        evidence_against=[sref(f"{deal_id}-doc-churn-notice-jul", "paragraph 1")],
        history=[event(
            "opened",
            "Issue opened: later churn changes current state but should not retroactively falsify the July 1 snapshot.",
            [f"{deal_id}-doc-update-jul", f"{deal_id}-doc-churn-notice-jul"],
            at="2026-07-05T00:00:00Z",
        )],
        suggested_request="Request the post-churn billing ledger and reconcile using effective dates.",
    ))
    db.commit()
    return {"introduced": True}
