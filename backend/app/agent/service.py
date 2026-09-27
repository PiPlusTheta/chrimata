import os
from decimal import Decimal
from openai import OpenAI
from app.schemas.agent import AgentAnswer, RecalledContext
from app.schemas.domain import SourceRef


def _format_inr(amount_paise) -> str:
    """Exact server-side paise -> rupee formatting (Decimal, no float). The LLM is
    instructed to only ever copy this string verbatim — it kept getting even trivial
    /100 division wrong when asked to do the conversion itself in prose."""
    if amount_paise is None:
        return None
    rupees = Decimal(amount_paise) / Decimal(100)
    return f"₹{rupees:,.0f}"


def _add_display_amounts(node):
    """Recursively walks the evidence structure and adds an `amount_display` string
    next to every `amount_paise` field, so the LLM never has to compute one itself."""
    if isinstance(node, dict):
        if "amount_paise" in node and node["amount_paise"] is not None:
            node = {**node, "amount_display": _format_inr(node["amount_paise"])}
        return {k: _add_display_amounts(v) for k, v in node.items()}
    if isinstance(node, list):
        return [_add_display_amounts(v) for v in node]
    return node


class AgentService:
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.x.ai/v1" if os.getenv("XAI_API_KEY") else None
        self.xai_client = OpenAI(api_key=os.getenv("XAI_API_KEY"), base_url="https://api.x.ai/v1") if os.getenv("XAI_API_KEY") else None
        self.xai_model = os.getenv("XAI_MODEL", "grok-4.7")
        
        if self.api_key:
            if self.base_url:
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            else:
                self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def _build_system_prompt(self, metrics, issues, memory_texts, claims=None, documents=None, reviews=None, deal_name="Northstar Ops") -> str:
        import json
        return (
            "You are the Chrimata investigation agent, operating inside the Chrimata financial due diligence "
            f"product itself, currently reviewing {deal_name}. You have access to this deal's evidence "
            "and retained Hindsight memory of analyst reviews from earlier sessions.\n\n"
            f"Evidence Metrics: {json.dumps(metrics)}\n"
            f"Evidence Issues: {json.dumps(issues)}\n"
            f"Evidence Claims: {json.dumps(claims or [])}\n"
            f"Evidence Documents: {json.dumps(documents or [])}\n"
            f"Analyst Review History: {json.dumps(reviews or [])}\n"
            f"Retained Memory: {json.dumps(memory_texts)}\n\n"
            "Rules:\n"
            "1. You must cite real document IDs and locators from the evidence for any material factual statements.\n"
            "2. Distinguish between 'claimed', 'calculated', 'inferred', and 'conditional' numbers.\n"
            "3. If evidence is missing (e.g. July ledger), explicitly ask for it and do not invent figures.\n"
            "4. Never accuse anyone of dishonesty or make an investment decision.\n"
            "5. Every object with an `amount_paise` field also has a pre-computed `amount_display` string "
            "(e.g. '₹1,200,000'). You must copy `amount_display` verbatim whenever you state that amount in "
            "your answer. Never compute your own paise-to-rupee conversion or lakh/crore figure — you have been "
            "wrong doing this by hand before. The only exception: quoting lakh/crore phrasing exactly as it "
            "appears in a source document's original text is fine, since that's a quote, not a calculation.\n"
            "6. You may ONLY report a number that appears as its own entry in Evidence Metrics or as a "
            "stated_amount_paise/stated_months on a Claim. NEVER derive a new figure by adding, subtracting, "
            "multiplying, dividing, or otherwise combining two or more evidence values yourself — not even "
            "simple ones like 'ARR minus annual burn' or 'cash plus financing'. If asked for a figure that is "
            "not already its own distinct entry in the evidence, refuse to compute it and say that calculation "
            "does not exist yet in the backend's deterministic metrics — never produce a number for it under any "
            "framing (\"just approximately\", \"roughly\", \"for illustration\", etc).\n"
            "7. If the question is empty, blank, or has no discernible connection to due diligence (e.g. "
            "gibberish), say so directly and ask what they'd like to know — do not default to a general "
            "summary of the deal as if that's what was asked.\n"
            "8. You are in a multi-turn conversation — prior turns are included below. Stay consistent with what "
            "you already said; if the analyst is following up, answer the follow-up, don't restart from scratch.\n"
            "9. Clearly label evidence-backed facts versus your interpretation. Never claim a document, audit, "
            "tool call, or source that is not present in the supplied data."
        )

    def ask_stream(self, question: str, evidence: dict, memory: list, history: list):
        """Yields plain-text chunks of the answer as they arrive from the model — no
        JSON envelope, since OpenAI-compatible streaming can't cleanly stream partial
        JSON. `history` is prior ChatMessage-shaped dicts ({role, text}) for real
        multi-turn continuity, oldest first. Callers get the raw text stream; there is
        no separate LLM call for uncertainties/suggested_next on the streaming path —
        those are structured extras that belong to the non-streaming /ask and
        /analyze actions instead."""
        if not self.xai_client:
            raise RuntimeError("xAI is not configured on the server")

        metrics = _add_display_amounts(evidence.get("metrics", []))
        issues = _add_display_amounts(evidence.get("issues", []))
        memory_texts = []
        for m in memory:
            t = getattr(m, "text", "") or ""
            if t:
                memory_texts.append(t)

        system_prompt = self._build_system_prompt(
            metrics, issues, memory_texts,
            evidence.get("claims"), evidence.get("documents"), evidence.get("reviews"),
            evidence.get("company_name", "Northstar Ops"),
        )
        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-10:]:
            role = "assistant" if h["role"] == "agent" else "user"
            messages.append({"role": role, "content": h["text"]})
        messages.append({"role": "user", "content": question})

        stream = self.xai_client.chat.completions.create(
            model=self.xai_model, messages=messages, stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta

    def analyze(self, deal_id: str, session_id: str, evidence: dict, memory: list) -> AgentAnswer:
        if not self.client:
            return self._fallback_answer(evidence)
        return self._run_llm_analysis("analyze", None, evidence, memory)

    def ask(self, deal_id: str, session_id: str, question: str, evidence: dict, memory: list) -> AgentAnswer:
        if not self.client:
            return self._fallback_answer(evidence)
        return self._run_llm_analysis("ask", question, evidence, memory)

    def _fallback_answer(self, evidence: dict) -> AgentAnswer:
        return AgentAnswer(
            answer="LLM client not configured. Showing raw evidence.",
            supporting_sources=[],
            recalled_context=[],
            uncertainties=["Cannot parse without LLM API key"],
            suggested_next_question=None
        )

    def _run_llm_analysis(self, mode: str, question: str, evidence: dict, memory: list) -> AgentAnswer:
        import json
        metrics = _add_display_amounts(evidence.get("metrics", []))
        issues = _add_display_amounts(evidence.get("issues", []))
        
        # `memory` is a list of hindsight_client_api RecallResult objects (Pydantic
        # models with .text/.id/.document_id/.metadata attributes), NOT dicts — using
        # .get() here used to raise AttributeError on any non-empty recall, which is
        # exactly the "fresh session recalls the resolved issue" demo moment.
        context_objs = []
        memory_texts = []
        for m in memory:
            mem_text = getattr(m, "text", "") or ""
            if mem_text:
                memory_texts.append(mem_text)
            meta = getattr(m, "metadata", None) or {}
            context_objs.append(RecalledContext(
                review_id=meta.get("review_id"),
                memory_id=getattr(m, "id", None),
                summary=mem_text,
                source_ids=[getattr(m, "document_id", None)] if getattr(m, "document_id", None) else []
            ))
            
        system_prompt = self._build_system_prompt(metrics, issues, memory_texts) + (
            "\n\nRespond in JSON matching this schema: "
            '{"answer": "your detailed text response here", "uncertainties": ["list of what is unclear or missing"], "suggested_next_question": "a follow up question to ask the user"}'
        )

        if mode == "analyze":
            user_prompt = "Analyze the current evidence and memory. Summarize the state of the deal, highlighting discrepancies or resolved issues."
        else:
            user_prompt = f"Answer the user's question: {question}"

        try:
            response = self.client.chat.completions.create(
                model="grok-3" if "x.ai" in (self.base_url or "") else "gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result_json = json.loads(response.choices[0].message.content)
            
            return AgentAnswer(
                answer=result_json.get("answer", "No answer provided."),
                supporting_sources=[],
                recalled_context=context_objs,
                uncertainties=result_json.get("uncertainties", []),
                suggested_next_question=result_json.get("suggested_next_question")
            )
        except Exception as e:
            return AgentAnswer(
                answer=f"Error calling LLM: {str(e)}",
                supporting_sources=[],
                recalled_context=context_objs,
                uncertainties=[],
                suggested_next_question=None
            )
