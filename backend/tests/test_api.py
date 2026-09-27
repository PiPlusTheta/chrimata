def test_summary(client):
    resp = client.get("/api/deals/demo/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["company_name"] == "Northstar Ops"
    assert body["document_count"] == 15
    assert body["open_issue_count"] == 2
    assert body["run_id"]
    metrics = {m["id"]: m for m in body["metrics"]}
    assert metrics["calc-live-arr-apr"]["amount_paise"] == 144_00_000_00
    assert metrics["calc-runway-base"]["months"] == "4"


def test_calculations_match_the_answer_key(client):
    calcs = {c["metric"] + ":" + c["id"]: c for c in client.get("/api/deals/demo/calculations").json()}
    assert calcs["live_annualised_arr:calc-live-arr-apr"]["amount_paise"] == 144_00_000_00
    assert calcs["simple_cash_runway:calc-runway-base"]["months"] == "4"
    assert calcs["simple_cash_runway:calc-runway-scenario"]["months"] == "10"
    assert calcs["mrr_after_reported_churn:calc-mrr-post-churn-jul"]["amount_paise"] == 13_00_000_00


def test_claims_and_issues_round_trip(client):
    claims = client.get("/api/deals/demo/claims").json()
    assert len(claims) == 10
    assert all(isinstance(c["sources"], list) and c["sources"] for c in claims)

    issues = client.get("/api/deals/demo/issues").json()
    assert len(issues) == 2
    assert all(isinstance(i["evidence_for"], list) for i in issues)
    assert all(len(i["history"]) == 1 for i in issues)  # seeded "opened" event


def test_review_flow_requires_accept_before_resolve(client):
    resolve_too_early = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "resolve", "explanation": "skip ahead", "reviewer": "analyst",
    })
    assert resolve_too_early.status_code == 409

    r1 = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "accept_explanation",
        "explanation": "Founder clarified the March ARR figure combined active, contracted, and pipeline revenue.",
        "reviewer": "analyst",
    })
    assert r1.status_code == 200
    assert r1.json()["memory_status"] == "pending"

    r2 = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "resolve",
        "explanation": "Confirmed against the April ledger; terminology issue closed.",
        "reviewer": "analyst",
    })
    assert r2.status_code == 200

    issue = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == "issue-arr-apr")
    assert issue["status"] == "resolved"
    assert len(issue["history"]) == 3  # opened, reviewed, resolved
    reviews = client.get("/api/issues/issue-arr-apr/reviews").json()
    assert [r["decision"] for r in reviews] == ["accept_explanation", "resolve"]


def test_july_churn_issue_does_not_mutate_resolved_march_issue(client):
    client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "accept_explanation", "explanation": "explained", "reviewer": "analyst",
    })
    client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "resolve", "explanation": "resolved", "reviewer": "analyst",
    })

    issue_jul = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == "issue-mrr-jul")
    assert issue_jul["status"] == "open"
    assert len(issue_jul["history"]) == 1

    issue_apr = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == "issue-arr-apr")
    assert issue_apr["status"] == "resolved"


def test_missing_july_billing_ledger_leaves_mrr_unconfirmed(client):
    calc = next(c for c in client.get("/api/deals/demo/calculations").json() if c["id"] == "calc-mrr-post-churn-jul")
    assert calc["status"] == "inferred"
    assert any("july billing ledger" in a.lower() for a in calc["assumptions"])

    issue = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == "issue-mrr-jul")
    assert issue["status"] == "open"
    assert "billing ledger" in issue["suggested_request"].lower()


def test_review_rejects_unknown_decision(client):
    resp = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "definitely_true", "explanation": "nonsense", "reviewer": "analyst",
    })
    assert resp.status_code == 400


def test_review_rejects_empty_explanation(client):
    resp = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "request_evidence", "explanation": "   ", "reviewer": "analyst",
    })
    assert resp.status_code == 400


def test_reset_is_repeatable_without_duplicates(client):
    r1 = client.post("/api/demo/reset").json()
    r2 = client.post("/api/demo/reset").json()
    assert r1["run_id"] != r2["run_id"]

    claims = client.get("/api/deals/demo/claims").json()
    ids = [c["id"] for c in claims]
    assert len(ids) == len(set(ids)) == 10

    issues = client.get("/api/deals/demo/issues").json()
    assert len(issues) == 2
    assert all(len(i["history"]) == 1 for i in issues)


def test_memory_status_handshake(client):
    review = client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "accept_explanation", "explanation": "Explained via founder email.", "reviewer": "analyst",
    }).json()
    assert review["memory_status"] == "pending"

    ack = client.patch(f"/api/reviews/{review['id']}/memory-status", json={"memory_status": "retained"})
    assert ack.status_code == 200
    assert ack.json()["memory_status"] == "retained"


def test_document_content_is_read_from_the_real_seed_files(client):
    doc = client.get("/api/deals/demo/documents/doc-deck-mar").json()
    assert "Northstar Ops" in doc["content"]
    assert "₹2.4 crore" in doc["content"]
