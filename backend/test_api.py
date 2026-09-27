import httpx
import json

base_url = "http://localhost:8000/api"
client = httpx.Client(timeout=60.0)

print("1. Resetting Demo...")
res = client.post(f"{base_url}/demo/reset")
print(res.json())
run_id = res.json()["run_id"]

print("\n2. Getting Summary...")
res = client.get(f"{base_url}/deals/demo/summary")
print(res.json()["company_name"], "Run ID:", res.json()["run_id"])

print("\n3. Testing Agent New Session...")
res = client.post(f"{base_url}/agent/new-session", json={"run_id": run_id})
print(res.json())
session_id = res.json()["session_id"]

print("\n4. Testing Agent Analyze...")
res = client.post(f"{base_url}/agent/analyze", json={
    "deal_id": "demo",
    "session_id": session_id
})
print(json.dumps(res.json(), indent=2))

print("\n5. Testing Agent Ask...")
res = client.post(f"{base_url}/agent/ask", json={
    "deal_id": "demo",
    "session_id": session_id,
    "question": "What is the calculated ARR for Northstar Ops?"
})
print(json.dumps(res.json(), indent=2))

print("\n6. Submitting and Retaining an Analyst Review...")
issues = client.get(f"{base_url}/deals/demo/issues").json()
if issues:
    issue_id = issues[0]["id"]
    res = client.post(f"{base_url}/issues/{issue_id}/reviews", json={
        "decision": "accept_explanation",
        "explanation": "Founder clarified definitions. ARR includes pipeline in their internal deck.",
        "reviewer": "Agent"
    })
    review_id = res.json()["id"]
    print(f"Review created: {review_id}")
    
    res = client.post(f"{base_url}/agent/retain-review", json={"review_id": review_id})
    print("Retain response:", res.json())
    
    # Check memory status
    review = client.get(f"{base_url}/reviews/{review_id}").json()
    print("Final memory status:", review["memory_status"])
else:
    print("No issues found to review.")

print("\nALL TESTS COMPLETED.")
