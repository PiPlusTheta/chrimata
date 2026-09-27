import os
from openai import OpenAI
from app.schemas.agent import AgentAnswer, RecalledContext
from app.schemas.domain import SourceRef

class AgentService:
    def __init__(self):
        self.api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.x.ai/v1" if os.getenv("XAI_API_KEY") else None
        
        if self.api_key:
            if self.base_url:
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            else:
                self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

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
        metrics = evidence.get("metrics", [])
        issues = evidence.get("issues", [])
        
        context_objs = []
        memory_texts = []
        for m in memory:
            mem_text = m.get("text", "")
            if mem_text:
                memory_texts.append(mem_text)
            context_objs.append(RecalledContext(
                review_id=m.get("review_id"),
                memory_id=m.get("memory_id"),
                summary=mem_text,
                source_ids=[]
            ))
            
        system_prompt = (
            "You are a financial due diligence AI assistant analyzing a startup's data. "
            "You have access to evidence (metrics, open issues) and retained memory of analyst reviews.\n\n"
            f"Evidence Metrics: {json.dumps(metrics)}\n"
            f"Evidence Issues: {json.dumps(issues)}\n"
            f"Retained Memory: {json.dumps(memory_texts)}\n\n"
            "Rules:\n"
            "1. You must cite real document IDs and locators from the evidence for any material factual statements.\n"
            "2. Distinguish between 'claimed', 'calculated', 'inferred', and 'conditional' numbers.\n"
            "3. If evidence is missing (e.g. July ledger), explicitly ask for it and do not invent figures.\n"
            "4. Never accuse anyone of dishonesty or make an investment decision.\n\n"
            "Respond in JSON matching this schema: "
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
