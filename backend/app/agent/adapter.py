import os
import json
from typing import List, Dict, Any, Optional

try:
    from hindsight import HindsightEmbedded
    HAS_HINDSIGHT = True
except ImportError:
    HAS_HINDSIGHT = False


# hindsight-all's embedded daemon only supports these providers for its own internal
# consolidation LLM (see hindsight/embedded.py docstring) — "xai" is NOT one of them,
# even though we use XAI/Grok for the user-facing chat LLM in AgentService. Passing an
# unsupported provider makes the embedded daemon fail to start, which used to look
# like Hindsight was silently working (is_available() stayed True) but always failed
# on every real call. This maps to a provider Hindsight actually supports.
_HINDSIGHT_PROVIDERS = ("groq", "openai", "ollama", "gemini", "anthropic", "lmstudio")
_DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini"


def _resolve_hindsight_provider():
    """Returns (provider, api_key, base_url, model) for HindsightEmbedded.

    OpenRouter isn't a provider hindsight-all knows natively, but it exposes an
    OpenAI-compatible API, so OPENROUTER_API_KEY is wired through as provider="openai"
    with a custom llm_base_url — the SDK supports overriding the base URL for exactly
    this kind of case (see embedded.py's llm_base_url param).
    """
    if os.getenv("OPENROUTER_API_KEY"):
        return (
            "openai",
            os.getenv("OPENROUTER_API_KEY"),
            "https://openrouter.ai/api/v1",
            os.getenv("HINDSIGHT_LLM_MODEL", _DEFAULT_OPENROUTER_MODEL),
        )
    if os.getenv("XAI_API_KEY"):
        return (
            "openai",
            os.getenv("XAI_API_KEY"),
            "https://api.x.ai/v1",
            os.getenv("HINDSIGHT_LLM_MODEL", "grok-3"),
        )
    for provider in _HINDSIGHT_PROVIDERS:
        key = os.getenv(f"{provider.upper()}_API_KEY")
        if key:
            return provider, key, None, os.getenv("HINDSIGHT_LLM_MODEL")
    return None, None, None, None


class HindsightAdapter:
    def __init__(self):
        self.provider, self.api_key, self.base_url, self.model = _resolve_hindsight_provider()
        if HAS_HINDSIGHT and self.api_key:
            kwargs = {"profile": "chrimata", "llm_provider": self.provider, "llm_api_key": self.api_key}
            if self.base_url:
                kwargs["llm_base_url"] = self.base_url
            if self.model:
                kwargs["llm_model"] = self.model
            self.client = HindsightEmbedded(**kwargs)
        else:
            self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    async def retain_review(self, bank_id: str, document_id: str, text: str, meta: dict) -> bool:
        """Uses the SDK's async methods (aretain/arecall), not the sync ones — FastAPI
        runs sync path-operation functions in a threadpool, and calling the sync
        hindsight-client methods from there trips an anyio cross-task/thread error
        ("Timeout context manager should be used inside a task"). The async methods
        run on the same event loop as the request, avoiding that entirely."""
        if not self.is_available():
            return False
        try:
            # Hindsight metadata values are strings. Investigation metadata includes
            # structured values (for example, source IDs and metric lists), so encode
            # those values as stable JSON instead of letting every retain fail model
            # validation before it reaches the memory store.
            metadata = {}
            for key, value in (meta or {}).items():
                if value is None:
                    continue
                if isinstance(value, str):
                    metadata[key] = value
                elif isinstance(value, (bool, int, float)):
                    metadata[key] = str(value).lower() if isinstance(value, bool) else str(value)
                else:
                    metadata[key] = json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)
            await self.client.aretain(
                bank_id=bank_id, document_id=document_id, content=text, metadata=metadata,
            )
            return True
        except Exception as e:
            print(f"Hindsight retain failed: {e}")
            return False

    async def recall(self, bank_id: str, query: str) -> List[Any]:
        """Returns a list of hindsight_client_api RecallResult objects (attributes:
        .text, .id, .document_id, .metadata — NOT dicts, callers must not use .get())."""
        if not self.is_available():
            return []
        try:
            res = await self.client.arecall(bank_id=bank_id, query=query)
            if hasattr(res, 'results'):
                return res.results
            elif isinstance(res, list):
                return res
            return []
        except Exception as e:
            print(f"Hindsight recall failed: {e}")
            return []

    async def reflect(self, bank_id: str, query: str) -> Optional[str]:
        """Hindsight's `reflect` synthesizes a markdown answer from consolidated
        memory (as opposed to `recall`, which returns raw matching memory items).
        Returns None if Hindsight is unavailable or the call fails — callers must
        treat that as "no reflection available", never fabricate one."""
        if not self.is_available():
            return None
        try:
            res = await self.client.areflect(bank_id=bank_id, query=query, budget="low")
            return getattr(res, "text", None)
        except Exception as e:
            print(f"Hindsight reflect failed: {e}")
            return None

    async def clear_bank(self, bank_id: str):
        if not self.is_available():
            return
        try:
            if hasattr(self.client, 'banks') and hasattr(self.client.banks, 'delete'):
                self.client.banks.delete(bank_id=bank_id)
        except Exception as e:
            print(f"Hindsight clear failed: {e}")
