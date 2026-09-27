def test_summary_initial_stage_excludes_july(client):
    resp = client.get("/api/deals/demo/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert body["company_name"] == "Northstar Ops"
    assert body["document_count"] == 11  # July docs held back until introduce-july-evidence
    assert body["open_issue_count"] == 1  # only issue-arr-apr exists initially
    assert body["run_id"]
    metrics = {m["id"]: m for m in body["metrics"]}
    assert metrics["calc-live-arr-apr"]["amount_paise"] == 144_00_000_00
    assert metrics["calc-runway-base"]["months"] == "4"
    assert "calc-mrr-post-churn-jul" not in metrics  # can't infer without July claims yet


def test_calculations_match_the_answer_key(client):
    calcs = {c["metric"] + ":" + c["id"]: c for c in client.get("/api/deals/demo/calculations").json()}
    assert calcs["live_annualised_arr:calc-live-arr-apr"]["amount_paise"] == 144_00_000_00
    assert calcs["simple_cash_runway:calc-runway-base"]["months"] == "4"
    assert calcs["simple_cash_runway:calc-runway-scenario"]["months"] == "10"


def test_claims_and_issues_round_trip(client):
    claims = client.get("/api/deals/demo/claims").json()
    assert len(claims) == 8
    assert all(isinstance(c["sources"], list) and c["sources"] for c in claims)

    issues = client.get("/api/deals/demo/issues").json()
    assert len(issues) == 1
    assert issues[0]["id"] == "issue-arr-apr"
    assert all(isinstance(i["evidence_for"], list) for i in issues)
    assert all(len(i["history"]) == 1 for i in issues)  # seeded "opened" event


def test_july_no_july_evidence_visible_before_introduction(client):
    # Chronology rule: July-dated documents/claims/issues must not exist until the
    # demo operator explicitly introduces them.
    docs = {d["id"] for d in client.get("/api/deals/demo/documents").json()}
    assert "doc-update-jul" not in docs
    assert "doc-churn-notice-jul" not in docs

    claims = {c["id"] for c in client.get("/api/deals/demo/claims").json()}
    assert "claim-mrr-jul" not in claims

    doc_lookup = client.get("/api/deals/demo/documents/doc-update-jul")
    assert doc_lookup.status_code == 404


def test_introduce_july_evidence_opens_new_issue_without_touching_april(client):
    client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "accept_explanation", "explanation": "explained", "reviewer": "analyst",
    })
    client.post("/api/issues/issue-arr-apr/reviews", json={
        "decision": "resolve", "explanation": "resolved", "reviewer": "analyst",
    })
    issue_apr_before = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == "issue-arr-apr")
    assert issue_apr_before["status"] == "resolved"

    result = client.post("/api/deals/demo/introduce-july-evidence")
    assert result.status_code == 200
    assert result.json()["introduced"] is True

    issues = client.get("/api/deals/demo/issues").json()
    assert len(issues) == 2
    issue_jul = next(i for i in issues if i["id"] == "issue-mrr-jul")
    assert issue_jul["status"] == "open"
    assert len(issue_jul["history"]) == 1

    issue_apr_after = next(i for i in issues if i["id"] == "issue-arr-apr")
    assert issue_apr_after["status"] == "resolved"  # untouched by the July introduction
    assert len(issue_apr_after["history"]) == 3  # unchanged: opened, reviewed, resolved

    calc = next(c for c in client.get("/api/deals/demo/calculations").json() if c["id"] == "calc-mrr-post-churn-jul")
    assert calc["status"] == "inferred"
    assert calc["amount_paise"] == 13_00_000_00
    assert any("july billing ledger" in a.lower() for a in calc["assumptions"])
    assert "billing ledger" in issue_jul["suggested_request"].lower()


def test_introduce_july_evidence_is_idempotent(client):
    r1 = client.post("/api/deals/demo/introduce-july-evidence").json()
    r2 = client.post("/api/deals/demo/introduce-july-evidence").json()
    assert r1["introduced"] is True
    assert r2["introduced"] is False

    docs = client.get("/api/deals/demo/documents").json()
    ids = [d["id"] for d in docs]
    assert len(ids) == len(set(ids)) == 15  # no duplicates

    issues = client.get("/api/deals/demo/issues").json()
    assert len([i for i in issues if i["id"] == "issue-mrr-jul"]) == 1


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


def test_reset_is_repeatable_without_duplicates_and_drops_july_evidence(client):
    client.post("/api/deals/demo/introduce-july-evidence")
    r1 = client.post("/api/demo/reset").json()
    r2 = client.post("/api/demo/reset").json()
    assert r1["run_id"] != r2["run_id"]

    claims = client.get("/api/deals/demo/claims").json()
    ids = [c["id"] for c in claims]
    assert len(ids) == len(set(ids)) == 8  # back to initial stage — July claims gone

    issues = client.get("/api/deals/demo/issues").json()
    assert len(issues) == 1
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


def test_ingesting_a_conflicting_claim_auto_opens_an_issue(client):
    resp = client.post("/api/deals/demo/documents", json={
        "id": "doc-board-update-aug", "title": "August Board Update", "type": "update", "version": "1.0",
        "document_date": "2026-08-15", "ingested_at": "2026-08-15T10:00:00Z",
        "content": "Active MRR has grown to 20 lakh.",
        "claims": [{
            "id": "claim-active-mrr-aug", "metric": "active_mrr",
            "original_text": "Active MRR has grown to 20 lakh.",
            "stated_amount_paise": 20_00_000_00, "as_of_date": "2026-08-15", "locator": "paragraph 1",
        }],
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["claims_created"] == ["claim-active-mrr-aug"]
    assert len(body["issues_opened"]) == 1

    issue_id = body["issues_opened"][0]
    issue = next(i for i in client.get("/api/deals/demo/issues").json() if i["id"] == issue_id)
    assert issue["claim_id"] == "claim-active-mrr-aug"
    assert issue["status"] == "open"
    assert "doc-ledger-apr" in [e["document_id"] for e in issue["evidence_against"]]
    # issue-arr-apr (the seeded, unrelated issue) must be untouched
    assert any(i["id"] == "issue-arr-apr" for i in client.get("/api/deals/demo/issues").json())


def test_ingesting_a_minor_claim_change_does_not_open_an_issue(client):
    # ₹72L -> ₹73L is a ~1.4% change — well under the 5% discrepancy threshold.
    resp = client.post("/api/deals/demo/documents", json={
        "id": "doc-minor-update", "title": "Minor Update", "type": "update", "version": "1.0",
        "document_date": "2026-08-20", "ingested_at": "2026-08-20T10:00:00Z", "content": "Cash is now 73 lakh.",
        "claims": [{
            "id": "claim-cash-aug", "metric": "cash", "original_text": "Cash is now 73 lakh.",
            "stated_amount_paise": 73_00_000_00, "as_of_date": "2026-08-20", "locator": "paragraph 1",
        }],
    })
    assert resp.status_code == 200
    assert resp.json()["issues_opened"] == []


def test_ingesting_a_duplicate_claim_id_is_rejected(client):
    payload = {
        "id": "doc-dup", "title": "Dup", "type": "update", "version": "1.0",
        "document_date": "2026-08-15", "ingested_at": "2026-08-15T10:00:00Z", "content": "x",
        "claims": [{
            "id": "claim-active-mrr-apr",  # collides with a seeded claim id
            "metric": "active_mrr", "original_text": "x", "stated_amount_paise": 1, "as_of_date": "2026-08-15", "locator": "p1",
        }],
    }
    resp = client.post("/api/deals/demo/documents", json=payload)
    assert resp.status_code == 409


def test_diligence_report_contains_claims_and_issues(client):
    resp = client.get("/api/deals/demo/report")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/markdown")
    text = resp.text
    assert "# Chrimata Diligence Report" in text
    assert "issue-arr-apr" in text
    assert "active_mrr" in text
    assert "₹14,400,000" in text  # calculated ARR, exact rupee display
