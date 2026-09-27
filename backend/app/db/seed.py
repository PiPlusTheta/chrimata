import uuid
import pathlib
from sqlalchemy.orm import Session
from app.models.domain import Document, Claim, Issue, Review, DemoRun

DATA_DIR = pathlib.Path(__file__).resolve().parents[3] / "data" / "demo"


def _read(filename: str) -> str:
    return (DATA_DIR / filename).read_text(encoding="utf-8")


def sref(document_id: str, locator: str, quote: str = None) -> dict:
    return {"document_id": document_id, "locator": locator, "quote": quote}


def event(kind: str, description: str, source_ids: list, at: str = "2026-04-01T00:00:00Z") -> dict:
    return {"id": f"evt_{uuid.uuid4().hex[:8]}", "at": at, "kind": kind,
            "description": description, "source_ids": source_ids}


# Chronology rule: July-dated evidence must not be visible at the initial demo stage.
# Split into what's seeded at reset ("initial") vs. what POST /deals/demo/introduce-july-evidence
# reveals live during the demo ("july"). See introduce_july_evidence() below.

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


def reset_db(db: Session) -> str:
    """Wipe and reseed the demo dataset. Returns the new run_id."""
    db.query(Review).delete()
    db.query(Issue).delete()
    db.query(Claim).delete()
    db.query(Document).delete()
    db.query(DemoRun).delete()
    db.commit()

    for doc_id, title, dtype, filename, date in INITIAL_DOCS:
        db.add(Document(
            id=doc_id, deal_id="demo", title=title, type=dtype, version="1.0",
            document_date=date, ingested_at="2026-09-27T00:00:00Z",
            content=_read(filename), source_url=f"data/demo/{filename}", synthetic=True,
        ))
    db.commit()

    claims = [
        Claim(id="claim-arr-mar", metric="arr", original_text="Our current ARR is ₹2.4 crore.",
              stated_amount_paise=2_400_000_00_00, as_of_date="2026-03-15",
              definition="Annual Recurring Revenue as stated in the March pitch deck", status="claimed",
              sources=[sref("doc-deck-mar", "paragraph 1", "Our current ARR is ₹2.4 crore.")]),
        Claim(id="claim-active-mrr-apr", metric="mrr", original_text="Active Monthly Recurring Revenue: ₹12 lakh.",
              stated_amount_paise=12_00_000_00, as_of_date="2026-04-01",
              definition="MRR from customers currently active and billing", status="claimed",
              sources=[sref("doc-ledger-apr", "Active Monthly Recurring Revenue line")]),
        Claim(id="claim-contracted-mrr-apr", metric="mrr", original_text="Signed contracts not yet active: ₹5 lakh.",
              stated_amount_paise=5_00_000_00, as_of_date="2026-04-01",
              definition="Signed but not-yet-active monthly revenue — excluded from live ARR", status="claimed",
              sources=[sref("doc-ledger-apr", "Signed contracts not yet active line")]),
        Claim(id="claim-pipeline-mrr-apr", metric="mrr", original_text="Unsigned pipeline: ₹3 lakh.",
              stated_amount_paise=3_00_000_00, as_of_date="2026-04-01",
              definition="Unsigned sales pipeline monthly value — excluded from live ARR", status="claimed",
              sources=[sref("doc-ledger-apr", "Unsigned pipeline line")]),
        Claim(id="claim-cash-q1", metric="runway", original_text="Current Cash: ₹72 lakh.",
              stated_amount_paise=72_00_000_00, as_of_date="2026-04-01",
              definition="Cash on hand per the Q1 cash record", status="claimed",
              sources=[sref("doc-cash-q1", "Current Cash line")]),
        Claim(id="claim-burn-q1", metric="runway", original_text="Monthly Net Burn: ₹18 lakh.",
              stated_amount_paise=18_00_000_00, as_of_date="2026-04-01",
              definition="Net cash burn per month per the Q1 cash record", status="claimed",
              sources=[sref("doc-cash-q1", "Monthly Net Burn line")]),
        Claim(id="claim-financing-proposed-jun", metric="runway", original_text="Amount: ₹1.08 Crore. Not yet signed.",
              stated_amount_paise=1_08_00_000_00, as_of_date="2026-06-10",
              definition="Series A extension amount in the draft term sheet — not yet signed", status="claimed",
              sources=[sref("doc-term-sheet-jun", "Amount line")]),
        Claim(id="claim-runway-jul", metric="runway", original_text="Cash runway is tight (approx 3-4 months without the extension).",
              stated_months="3-4", as_of_date="2026-06-30",
              definition="Board's own qualitative runway estimate, pending the financing extension", status="claimed",
              sources=[sref("doc-board-minutes-jun", "Agenda item 1")]),
    ]
    db.add_all(claims)
    db.commit()

    issues = [
        Issue(id="issue-arr-apr", claim_id="claim-arr-mar", status="open",
              question="March deck states ₹2.4 crore ARR, but the April ledger shows only ₹12 lakh active MRR (₹1.44 crore annualised). Is there a discrepancy?",
              evidence_for=[sref("doc-deck-mar", "paragraph 1")],
              evidence_against=[sref("doc-ledger-apr", "Active Monthly Recurring Revenue line")],
              history=[event("opened", "Issue opened: March ARR claim exceeds April active-MRR-derived ARR.", ["doc-deck-mar", "doc-ledger-apr"])],
              suggested_request="Ask the founder whether the March ARR figure includes non-active revenue."),
    ]
    db.add_all(issues)
    db.commit()

    run_id = f"run_{uuid.uuid4().hex[:12]}"
    db.add(DemoRun(id="demo", run_id=run_id))
    db.commit()
    return run_id


def introduce_july_evidence(db: Session) -> dict:
    """Reveals the July documents + claims + opens issue-mrr-jul, live during the demo.
    Idempotent: calling it twice is a no-op the second time (no duplicate claims/issues).
    Deliberately does NOT touch issue-arr-apr — the April resolution must stay intact."""
    if db.query(Document).filter(Document.id == "doc-update-jul").first():
        return {"introduced": False, "reason": "already introduced"}

    for doc_id, title, dtype, filename, date in JULY_DOCS:
        db.add(Document(
            id=doc_id, deal_id="demo", title=title, type=dtype, version="1.0",
            document_date=date, ingested_at="2026-09-27T00:00:00Z",
            content=_read(filename), source_url=f"data/demo/{filename}", synthetic=True,
        ))
    db.commit()

    db.add_all([
        Claim(id="claim-mrr-jul", metric="mrr", original_text="Our current MRR is ₹17 lakh.",
              stated_amount_paise=17_00_000_00, as_of_date="2026-07-01",
              definition="Current MRR as stated in the July investor update", status="claimed",
              sources=[sref("doc-update-jul", "paragraph 1", "Our current MRR is ₹17 lakh.")]),
        Claim(id="claim-churn-jul", metric="mrr", original_text="A major customer (MegaCorp) paying ₹4 lakh/month has churned.",
              stated_amount_paise=4_00_000_00, as_of_date="2026-07-05",
              definition="Monthly recurring revenue lost to the named churned customer", status="claimed",
              sources=[sref("doc-churn-notice-jul", "paragraph 1")]),
    ])
    db.commit()

    db.add(Issue(
        id="issue-mrr-jul", claim_id="claim-mrr-jul", status="open",
        question="July update states ₹17 lakh current MRR, but a dated churn notice shows a ₹4 lakh/month customer churned on July 5. Is post-churn MRR ₹13 lakh?",
        evidence_for=[sref("doc-update-jul", "paragraph 1")],
        evidence_against=[sref("doc-churn-notice-jul", "paragraph 1")],
        history=[event("opened", "Issue opened: churn notice postdates the reported July MRR figure.", ["doc-update-jul", "doc-churn-notice-jul"], at="2026-07-05T00:00:00Z")],
        suggested_request="Request the July billing ledger to confirm live MRR after the churn.",
    ))
    db.commit()
    return {"introduced": True}
