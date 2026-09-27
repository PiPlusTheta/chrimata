import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
print("XAI_API_KEY", os.getenv("XAI_API_KEY") is not None)

from app.agent.adapter import HindsightAdapter

async def main():
    ad = HindsightAdapter()
    print("Is available:", ad.is_available())
    print("Provider:", ad.provider)
    meta = {"review_id": "test", "issue_id": "test"}
    try:
        await ad.client.aretain(bank_id="test", document_id="test_doc", content="test", metadata=meta)
        print("Success")
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(main())
