import json

from app.api.endpoints import agent as agent_endpoint


def _events(response):
    events = []
    for block in response.text.strip().split("\n\n"):
        lines = block.splitlines()
        event = next((line[7:] for line in lines if line.startswith("event: ")), None)
        data = next((line[6:] for line in lines if line.startswith("data: ")), None)
        if event and data:
            events.append((event, json.loads(data)))
    return events


def test_chat_stream_persists_and_regenerates_without_duplicate_user_turn(client, monkeypatch):
    async def no_memory(*_args, **_kwargs):
        return []

    captured = []

    def fake_stream(question, evidence, memory, history):
        captured.append((question, evidence, history))
        yield "**Evidence:** "
        yield "April ledger supports the calculation."

    monkeypatch.setattr(agent_endpoint.hindsight_adapter, "recall", no_memory)
    monkeypatch.setattr(agent_endpoint.agent_service, "ask_stream", fake_stream)

    session = client.post("/api/agent/sessions", json={"deal_id": "demo"}).json()
    first = client.post(f"/api/agent/sessions/{session['id']}/stream", json={"question": "Explain ARR"})
    assert first.status_code == 200
    events = _events(first)
    assert ("state", "searching") in events
    assert ("state", "solving") in events
    assert "".join(data for event, data in events if event == "token") == "**Evidence:** April ledger supports the calculation."
    assert events[-1][0] == "done"

    second = client.post(f"/api/agent/sessions/{session['id']}/stream", json={"regenerate": True})
    assert second.status_code == 200
    detail = client.get(f"/api/agent/sessions/{session['id']}").json()
    assert [message["role"] for message in detail["messages"]] == ["user", "agent"]
    assert detail["messages"][1]["text"] == "**Evidence:** April ledger supports the calculation."
    assert captured[1][0] == "Explain ARR"
    assert captured[1][1]["documents"]
    assert captured[1][1]["claims"]
