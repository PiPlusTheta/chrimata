import os
from typing import List, Dict, Any, Optional

try:
    from hindsight import HindsightEmbedded
    HAS_HINDSIGHT = True
except ImportError:
    HAS_HINDSIGHT = False

class HindsightAdapter:
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if HAS_HINDSIGHT and self.api_key:
            # We use HindsightEmbedded which spins up a local daemon automatically
            provider = "xai" if os.getenv("XAI_API_KEY") else "openai"
            
            # Note: HindsightEmbedded uses 'openai', 'anthropic', 'gemini', 'groq', 'xai', etc.
            self.client = HindsightEmbedded(
                profile="chrimata",
                llm_provider=provider,
                llm_api_key=self.api_key
            )
        else:
            self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    def retain_review(self, bank_id: str, document_id: str, text: str, meta: dict) -> bool:
        if not self.is_available():
            return False
        try:
            self.client.retain(bank_id=bank_id, document_id=document_id, content=text, metadata=meta)
            return True
        except Exception as e:
            print(f"Hindsight retain failed: {e}")
            return False

    def recall(self, bank_id: str, query: str) -> List[dict]:
        if not self.is_available():
            return []
        try:
            res = self.client.recall(bank_id=bank_id, query=query)
            # The recall method returns a list of results based on hindsight-all.md
            # "results = client.recall(bank_id="my-bank", query="What does Alice do?")"
            # "for r in results: print(r.text)"
            # Let's handle it carefully
            if hasattr(res, 'results'):
                return res.results
            elif hasattr(res, 'memories'):
                return res.memories
            elif isinstance(res, list):
                return res
            return []
        except Exception as e:
            print(f"Hindsight recall failed: {e}")
            return []

    def clear_bank(self, bank_id: str):
        if not self.is_available():
            return
        try:
            if hasattr(self.client, 'banks') and hasattr(self.client.banks, 'delete'):
                self.client.banks.delete(bank_id=bank_id)
        except Exception as e:
            print(f"Hindsight clear failed: {e}")
