import uuid
import pathlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.domain import Document, Claim, Issue, Review, Deal, ChatSession, ChatMessage

DATA_DIR = pathlib.Path(__file__).resolve().parents[3] / "data" / "demo"


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
    return {"id": f"evt_{uuid.uuid4().hex[:8]}", "at": at, "kind": kind,
            "description": description, "source_ids": source_ids}


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

# Company registry — one shared baseline template (below), each with its own scale
# and a `has_issues` flag for whether the baseline ARR-vs-ledger discrepancy exists.
# `brutal` deals additionally get the hand-designed edge-case scenarios appended
# by _seed_brutal_cases(). This is deliberately a small number of carefully designed
# companies, not a large random set — each exists to exercise something specific.
DEALS = [
    {"id": "northstar", "name": "Northstar Ops", "industry": "Enterprise B2B SaaS", "stage": "Series A",
     "arr_paise": 2_400_000_000, "active_mrr_paise": 12_00_000_00, "has_issues": True, "brutal": False},
    {"id": "cybernetic", "name": "Cybernetic Systems", "industry": "Industrial Robotics", "stage": "Series B",
     "arr_paise": 1_440_000_000, "active_mrr_paise": 12_00_000_00, "has_issues": False, "brutal": False},
    {"id": "acme", "name": "Acme Corp", "industry": "Consumer Hardware", "stage": "Pre-Seed",
     "arr_paise": 5_00_00_00, "active_mrr_paise": 4_100_00, "has_issues": False, "brutal": False},
    {"id": "globex", "name": "Globex Corporation", "industry": "Fintech", "stage": "Series C",
     "arr_paise": 8_000_000_000, "active_mrr_paise": 50_000_000_00, "has_issues": True, "brutal": True},
    {"id": "initech", "name": "Initech", "industry": "Enterprise Software", "stage": "Series A",
     "arr_paise": 1_000_000_00, "active_mrr_paise": 8_00_000_00, "has_issues": False, "brutal": False},
    {"id": "soyuz", "name": "Soyuz Aerospace", "industry": "Aerospace", "stage": "Series B",
     "arr_paise": 3_200_000_000, "active_mrr_paise": 22_00_000_00, "has_issues": True, "brutal": False},
]


def seed_deal(db: Session, deal_id: str, arr_paise: int, active_mrr_paise: int, has_issues: bool = True) -> str:
    run_id = f"run_{uuid.uuid4().hex[:12]}"

    for doc_base_id, title, dtype, filename, date in INITIAL_DOCS:
        doc_id = f"{deal_id}-{doc_base_id}"
        db.add(Document(
            id=doc_id, deal_id=deal_id, title=title, type=dtype, version="1.0",
            document_date=date, ingested_at="2026-09-27T00:00:00Z",
            content=_read(filename), source_url=f"data/demo/{filename}", synthetic=True,
        ))
    db.commit()

    claims = [
        Claim(id=f"{deal_id}-claim-arr-mar", deal_id=deal_id, metric="arr", original_text=f"Our current ARR is ₹{arr_paise/10000000:,.1f} crore.",
              stated_amount_paise=arr_paise, as_of_date="2026-03-15",
              definition="Annual Recurring Revenue as stated in the March pitch deck", status="claimed",
              sources=[sref(f"{deal_id}-doc-deck-mar", "paragraph 1", f"Our current ARR is ₹{arr_paise/10000000:,.1f} crore.")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-active-mrr-apr", deal_id=deal_id, metric="active_mrr", original_text=f"Active Monthly Recurring Revenue: ₹{active_mrr_paise/100000:,.1f} lakh.",
              stated_amount_paise=active_mrr_paise, as_of_date="2026-04-01",
              definition="MRR from customers currently active and billing", status="claimed",
              sources=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-contracted-mrr-apr", deal_id=deal_id, metric="contracted_mrr", original_text="Signed contracts not yet active: ₹5 lakh.",
              stated_amount_paise=5_00_000_00, as_of_date="2026-04-01",
              definition="Signed but not-yet-active monthly revenue — excluded from live ARR", status="claimed",
              sources=[sref(f"{deal_id}-doc-ledger-apr", "Signed contracts not yet active line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-pipeline-mrr-apr", deal_id=deal_id, metric="pipeline_mrr", original_text="Unsigned pipeline: ₹3 lakh.",
              stated_amount_paise=3_00_000_00, as_of_date="2026-04-01",
              definition="Unsigned sales pipeline monthly value — excluded from live ARR", status="claimed",
              sources=[sref(f"{deal_id}-doc-ledger-apr", "Unsigned pipeline line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-cash-q1", deal_id=deal_id, metric="cash", original_text="Current Cash: ₹72 lakh.",
              stated_amount_paise=72_00_000_00, as_of_date="2026-04-01",
              definition="Cash on hand per the Q1 cash record", status="claimed",
              sources=[sref(f"{deal_id}-doc-cash-q1", "Current Cash line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-burn-q1", deal_id=deal_id, metric="burn", original_text="Monthly Net Burn: ₹18 lakh.",
              stated_amount_paise=18_00_000_00, as_of_date="2026-04-01",
              definition="Net cash burn per month per the Q1 cash record", status="claimed",
              sources=[sref(f"{deal_id}-doc-cash-q1", "Monthly Net Burn line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-financing-proposed-jun", deal_id=deal_id, metric="proposed_financing", original_text="Amount: ₹1.08 Crore. Not yet signed.",
              stated_amount_paise=1_08_00_000_00, as_of_date="2026-06-10",
              definition="Series A extension amount in the draft term sheet — not yet signed", status="claimed",
              sources=[sref(f"{deal_id}-doc-term-sheet-jun", "Amount line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-runway-jul", deal_id=deal_id, metric="runway", original_text="Cash runway is tight (approx 3-4 months without the extension).",
              stated_months="3-4", as_of_date="2026-06-30",
              definition="Board's own qualitative runway estimate, pending the financing extension", status="claimed",
              sources=[sref(f"{deal_id}-doc-board-minutes-jun", "Agenda item 1")], created_at=_now()),
    ]
    db.add_all(claims)
    db.commit()

    if has_issues:
        issues = [
            Issue(id=f"{deal_id}-issue-arr-apr", deal_id=deal_id, claim_id=f"{deal_id}-claim-arr-mar", status="open",
                  question=f"March deck states ₹{arr_paise/10000000:,.1f} crore ARR, but the April ledger shows only ₹{active_mrr_paise/100000:,.1f} lakh active MRR. Is there a discrepancy?",
                  evidence_for=[sref(f"{deal_id}-doc-deck-mar", "paragraph 1")],
                  evidence_against=[sref(f"{deal_id}-doc-ledger-apr", "Active Monthly Recurring Revenue line")],
                  history=[event("opened", "Issue opened: March ARR claim exceeds April active-MRR-derived ARR.", [f"{deal_id}-doc-deck-mar", f"{deal_id}-doc-ledger-apr"])],
                  suggested_request="Ask the founder whether the March ARR figure includes non-active revenue."),
        ]
        db.add_all(issues)
        db.commit()

    return run_id


def _seed_brutal_cases(db: Session, deal_id: str):
    """Hand-designed edge cases layered onto a deal that already has the baseline
    claims/issues from seed_deal(). Each case exists to exercise one specific thing
    the deterministic evidence engine (or the agent reasoning over it) must get right."""

    # Scenario: duplicate-looking-but-legitimate claims — same metric, same amount,
    # different source documents and dates. Must NOT be silently merged or treated
    # as a data-entry duplicate; they're two independent assertions that happen to
    # agree.
    db.add_all([
        Claim(id=f"{deal_id}-claim-pipeline-mar", deal_id=deal_id, metric="pipeline_mrr",
              original_text="Unsigned pipeline: ₹9,00,000/month.", stated_amount_paise=9_00_000_00,
              as_of_date="2026-03-01", definition="Unsigned sales pipeline as of March board deck", status="claimed",
              sources=[sref(f"{deal_id}-doc-deck-mar", "appendix, pipeline table")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-pipeline-may", deal_id=deal_id, metric="pipeline_mrr",
              original_text="Unsigned pipeline: ₹9,00,000/month (unchanged).", stated_amount_paise=9_00_000_00,
              as_of_date="2026-05-01", definition="Unsigned sales pipeline as of May board update", status="claimed",
              sources=[sref(f"{deal_id}-doc-board-minutes-jun", "pipeline recap")], created_at=_now()),
    ])

    # Scenario: boundary amounts — ₹1 (minimum meaningful paise-denominated claim)
    # and a very large figure that exercises BigInteger without overflowing (a
    # earlier real bug in this codebase was a claim silently overflowing 32-bit
    # Integer — this guards against that class of regression at the top end too).
    db.add_all([
        Claim(id=f"{deal_id}-claim-boundary-min", deal_id=deal_id, metric="misc_fee",
              original_text="Bank account maintenance fee: ₹1.", stated_amount_paise=1,
              as_of_date="2026-04-01", definition="Smallest recorded line item, for boundary testing", status="claimed",
              sources=[sref(f"{deal_id}-doc-bank-statement-may", "fee line")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-boundary-max", deal_id=deal_id, metric="total_addressable_market",
              original_text="Deck-asserted TAM: ₹9,99,900 crore.", stated_amount_paise=9_999_00_000_000_00,
              as_of_date="2026-03-15", definition="Founder's total addressable market claim — a narrative figure, not a financial metric to be trusted at face value",
              status="claimed", sources=[sref(f"{deal_id}-doc-deck-mar", "market sizing slide")], created_at=_now()),
    ])

    # Scenario: claim with no definition and no quote (both nullable fields
    # genuinely absent, not empty strings) — exercises the nullable-field path.
    db.add(Claim(id=f"{deal_id}-claim-no-metadata", deal_id=deal_id, metric="other_income",
                 original_text="Misc other income, ₹2,10,000, unclassified in export.",
                 stated_amount_paise=2_10_000_00, as_of_date="2026-04-30", definition=None, status="claimed",
                 sources=[sref(f"{deal_id}-doc-stripe-export-mar", "row 47", None)], created_at=_now()))

    # Scenario: adversarial / messy original_text — mixed case, asterisks,
    # abbreviations, an em-dash, a currency symbol embedded mid-word — the kind of
    # text real ingestion produces and that must not break rendering or citation.
    db.add(Claim(id=f"{deal_id}-claim-messy-text", deal_id=deal_id, metric="adj_ebitda",
                 original_text="Adj. EBITDA (Mgmt-adj*, unaudited) — Q1'26: (₹4,50,000) — *excludes one-time legal costs",
                 stated_amount_paise=-4_50_000_00, as_of_date="2026-03-31",
                 definition="Management-adjusted EBITDA, a non-GAAP figure the company itself flags as unaudited",
                 status="claimed", sources=[sref(f"{deal_id}-doc-board-minutes-jun", "financials appendix")], created_at=_now()))
    db.commit()

    # Scenario: an issue that gets disputed after being explained, i.e. reopened —
    # exercises the full open -> explained -> reopened lifecycle and confirms
    # history stays append-only (3 events) rather than being overwritten.
    reopened_issue = Issue(
        id=f"{deal_id}-issue-pipeline-consistency", deal_id=deal_id, claim_id=f"{deal_id}-claim-pipeline-may",
        status="open",
        question="Pipeline was reported as unchanged at ₹9,00,000/month from March to May — is that plausible for a growth-stage company, or was the figure just copy-pasted forward?",
        evidence_for=[sref(f"{deal_id}-doc-board-minutes-jun", "pipeline recap")],
        evidence_against=[sref(f"{deal_id}-doc-deck-mar", "appendix, pipeline table")],
        history=[event("opened", "Issue opened: identical pipeline figure reported two months apart.",
                        [f"{deal_id}-doc-deck-mar", f"{deal_id}-doc-board-minutes-jun"], at="2026-05-02T00:00:00Z")],
        suggested_request="Request the underlying CRM pipeline export to confirm the figure was recalculated, not carried forward.",
    )
    db.add(reopened_issue)
    db.commit()

    review1 = Review(id=f"{deal_id}-review-pipeline-1", issue_id=reopened_issue.id, decision="accept_explanation",
                      explanation="Founder confirmed on call that pipeline composition changed (some deals closed, new ones added) but total happened to net to the same figure.",
                      reviewed_at="2026-05-10T00:00:00Z", reviewer="analyst", memory_status="retained")
    db.add(review1)
    reopened_issue.status = "explained"
    reopened_issue.history = list(reopened_issue.history) + [
        event("reviewed", f"Review {review1.id} recorded decision 'accept_explanation'.", [], at="2026-05-10T00:00:00Z")
    ]
    db.commit()

    review2 = Review(id=f"{deal_id}-review-pipeline-2", issue_id=reopened_issue.id, decision="dispute",
                      explanation="CRM export requested but not provided after three follow-ups; the 'netted out coincidentally' explanation cannot be verified and the figure is now flagged again pending evidence.",
                      reviewed_at="2026-06-15T00:00:00Z", reviewer="analyst", memory_status="pending")
    db.add(review2)
    reopened_issue.status = "reopened"
    reopened_issue.history = list(reopened_issue.history) + [
        event("reopened", f"Review {review2.id} recorded decision 'dispute'.", [], at="2026-06-15T00:00:00Z")
    ]
    db.commit()


def reset_db(db: Session) -> str:
    """Wipe and reseed every deal. Returns Northstar's run_id (the primary/default
    deal most existing tests and the golden-path demo script are anchored to)."""
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
        run_id = seed_deal(db, company["id"], arr_paise=company["arr_paise"],
                            active_mrr_paise=company["active_mrr_paise"], has_issues=company["has_issues"])
        if company.get("brutal"):
            _seed_brutal_cases(db, company["id"])
        db.add(Deal(id=company["id"], name=company["name"], industry=company["industry"],
                     stage=company["stage"], synthetic=True, run_id=run_id, created_at=_now()))
        db.commit()
        run_ids[company["id"]] = run_id

    return run_ids["northstar"]


def introduce_july_evidence(db: Session, deal_id: str) -> dict:
    if db.query(Document).filter(Document.id == f"{deal_id}-doc-update-jul").first():
        return {"introduced": False, "reason": "already introduced"}

    for doc_base_id, title, dtype, filename, date in JULY_DOCS:
        db.add(Document(
            id=f"{deal_id}-{doc_base_id}", deal_id=deal_id, title=title, type=dtype, version="1.0",
            document_date=date, ingested_at="2026-09-27T00:00:00Z",
            content=_read(filename), source_url=f"data/demo/{filename}", synthetic=True,
        ))
    db.commit()

    db.add_all([
        Claim(id=f"{deal_id}-claim-mrr-jul", deal_id=deal_id, metric="mrr", original_text="Our current MRR is ₹17 lakh.",
              stated_amount_paise=17_00_000_00, as_of_date="2026-07-01",
              definition="Current MRR as stated in the July investor update", status="claimed",
              sources=[sref(f"{deal_id}-doc-update-jul", "paragraph 1", "Our current MRR is ₹17 lakh.")], created_at=_now()),
        Claim(id=f"{deal_id}-claim-churn-jul", deal_id=deal_id, metric="churned_mrr", original_text="A major customer (MegaCorp) paying ₹4 lakh/month has churned.",
              stated_amount_paise=4_00_000_00, as_of_date="2026-07-05",
              definition="Monthly recurring revenue lost to the named churned customer", status="claimed",
              sources=[sref(f"{deal_id}-doc-churn-notice-jul", "paragraph 1")], created_at=_now()),
    ])
    db.commit()

    db.add(Issue(
        id=f"{deal_id}-issue-mrr-jul", deal_id=deal_id, claim_id=f"{deal_id}-claim-mrr-jul", status="open",
        question="July update states ₹17 lakh current MRR, but a dated churn notice shows a ₹4 lakh/month customer churned on July 5. Is post-churn MRR ₹13 lakh?",
        evidence_for=[sref(f"{deal_id}-doc-update-jul", "paragraph 1")],
        evidence_against=[sref(f"{deal_id}-doc-churn-notice-jul", "paragraph 1")],
        history=[event("opened", "Issue opened: churn notice postdates the reported July MRR figure.", [f"{deal_id}-doc-update-jul", f"{deal_id}-doc-churn-notice-jul"], at="2026-07-05T00:00:00Z")],
        suggested_request="Request the July billing ledger to confirm live MRR after the churn.",
    ))
    db.commit()
    return {"introduced": True}
