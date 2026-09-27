from sqlalchemy.orm import Session
from app.models.domain import Document, Claim, Issue
import json

def reset_db(db: Session):
    # Clear existing data
    db.query(Issue).delete()
    db.query(Claim).delete()
    db.query(Document).delete()
    db.commit()

    # Create dummy seed data
    # March Pitch Deck
    doc1 = Document(
        id="doc_1",
        title="March Pitch Deck",
        date="2026-03-15T10:00:00Z",
        version="1.0",
        type="presentation",
        content="Our ARR is ₹2.4 crore...",
        source_url="data/demo/march_pitch_deck.md"
    )

    # April Ledger
    doc2 = Document(
        id="doc_2",
        title="April Billing Ledger",
        date="2026-04-01T10:00:00Z",
        version="1.0",
        type="ledger",
        content="Active Monthly Recurring Revenue: ₹12 lakh. Signed contracts not yet active: ₹5 lakh. Unsigned pipeline: ₹3 lakh.",
        source_url="data/demo/april_ledger.md"
    )

    # April Founder Explanation
    doc3 = Document(
        id="doc_3",
        title="Founder Email April",
        date="2026-04-15T10:00:00Z",
        version="1.0",
        type="email",
        content="The original March deck used 'ARR' loosely to combine active, contracted future, and unsigned pipeline amounts.",
        source_url="data/demo/april_founder_email.md"
    )

    # July Update
    doc4 = Document(
        id="doc_4",
        title="July Investor Update",
        date="2026-07-01T10:00:00Z",
        version="1.0",
        type="presentation",
        content="Current MRR is ₹17 lakh.",
        source_url="data/demo/july_update.md"
    )

    # July Churn Notice
    doc5 = Document(
        id="doc_5",
        title="Customer Churn Notice",
        date="2026-07-05T10:00:00Z",
        version="1.0",
        type="email",
        content="A major customer paying ₹4 lakh/month churned.",
        source_url="data/demo/july_churn.md"
    )

    # Cash Record
    doc6 = Document(
        id="doc_6",
        title="Q1 Cash Record",
        date="2026-04-01T10:00:00Z",
        version="1.0",
        type="ledger",
        content="Current Cash: ₹72 lakh. Monthly net burn: ₹18 lakh. Expected financing: ₹1.08Cr (unconfirmed).",
        source_url="data/demo/q1_cash.md"
    )

    db.add_all([doc1, doc2, doc3, doc4, doc5, doc6])
    db.commit()

    # Seed Claims
    claim1 = Claim(
        id="claim_1",
        metric="ARR",
        stated_value="24000000",
        unit="INR",
        as_of_date="2026-03-15",
        definition="Annual Recurring Revenue as per March deck",
        source_ids=json.dumps(["doc_1"]),
        status="active"
    )

    claim2 = Claim(
        id="claim_2",
        metric="MRR",
        stated_value="1700000",
        unit="INR",
        as_of_date="2026-07-01",
        definition="Monthly Recurring Revenue as per July update",
        source_ids=json.dumps(["doc_4"]),
        status="active"
    )

    claim3 = Claim(
        id="claim_3",
        metric="Cash Runway Scenario",
        stated_value="10.0",
        unit="Months",
        as_of_date="2026-04-01",
        definition="Runway with proposed financing",
        source_ids=json.dumps(["doc_6"]),
        status="active"
    )

    db.add_all([claim1, claim2, claim3])
    db.commit()

    # Seed Issues
    issue1 = Issue(
        id="issue_1",
        claim_id="claim_1",
        status="open",
        question="March deck states ₹2.4 crore ARR, but April ledger active MRR annualises to ₹1.44 crore. Is there a discrepancy?",
        evidence_for=json.dumps(["doc_1"]),
        evidence_against=json.dumps(["doc_2"])
    )

    issue2 = Issue(
        id="issue_2",
        claim_id="claim_2",
        status="open",
        question="July update states ₹17 lakh current MRR, but July churn notice shows ₹4 lakh/month churn. Is MRR ₹13 lakh?",
        evidence_for=json.dumps(["doc_4"]),
        evidence_against=json.dumps(["doc_5"]),
        suggested_request="Request July billing ledger for confirmation."
    )

    db.add_all([issue1, issue2])
    db.commit()
