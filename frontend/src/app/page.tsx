"use client";

import { useEffect, useState } from "react";
import { 
  fetchSummary, 
  fetchIssues, 
  fetchClaims, 
  fetchDocuments,
  submitReview,
  retainReview,
  agentAnalyze,
  agentAsk,
  newSession,
  resetDemo,
  injectJulyEvidence
} from "../api/client";
import { 
  AlertCircle,
  FileText,
  MessageSquare,
  RefreshCw,
  Send,
  Database,
  CheckCircle2,
  BrainCircuit,
  Clock,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [session, setSession] = useState<string>("init");
  const [chat, setChat] = useState<{role: string, text: string, context?: any[]}[]>([]);
  const [question, setQuestion] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, {decision: string, exp: string}>>({});
  const [retaining, setRetaining] = useState<Record<string, string>>({});
  const [savedReviewIds, setSavedReviewIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sum, iss, cls, ds] = await Promise.all([
        fetchSummary(), fetchIssues(), fetchClaims(), fetchDocuments()
      ]);
      setSummary(sum);
      setIssues(iss);
      setClaims(cls);
      setDocs(ds);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to load");
    }
    setLoading(false);
  }

  const formatPaise = (paise: number) => {
    if (paise >= 1000000000) return `₹${(paise / 1000000000).toFixed(2)} Cr`;
    if (paise >= 10000000) return `₹${(paise / 10000000).toFixed(2)} L`;
    return `₹${(paise / 100).toFixed(0)}`;
  };

  const handleReset = async () => {
    await resetDemo();
    await loadData();
    setChat([]);
    setSession("init");
  };

  const handleNewSession = async () => {
    if (!summary?.run_id) return;
    const res = await newSession(summary.run_id);
    setSession(res.session_id);
    setChat([{ role: "agent", text: "Started a fresh session. My memory remains intact." }]);
  };

  const handleAgentAnalyze = async () => {
    if (!summary) return;
    const res = await agentAnalyze("demo", session);
    setChat(prev => [...prev, { role: "agent", text: res.answer.answer, context: res.answer.recalled_context }]);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setChat(prev => [...prev, { role: "user", text: q }]);
    try {
      const res = await agentAsk("demo", session, q);
      setChat(prev => [...prev, { role: "agent", text: res.answer, context: res.recalled_context }]);
    } catch (e) {
      setChat(prev => [...prev, { role: "agent", text: "Error connecting to agent." }]);
    }
  };

  const handleSubmitReview = async (issueId: string) => {
    const draft = reviewDrafts[issueId];
    if (!draft?.decision || !draft?.exp) return;

    setRetaining(prev => ({...prev, [issueId]: "saving"}));
    try {
      const rev = await submitReview(issueId, draft.decision, draft.exp, "Nitesh");
      setSavedReviewIds(prev => ({...prev, [issueId]: rev.id}));
      await attemptRetain(issueId, rev.id);
      loadData();
    } catch (e) {
      setRetaining(prev => ({...prev, [issueId]: "failed"}));
    }
  };

  // Retry only re-attempts Hindsight retention for the review already saved above —
  // it must NOT call submitReview again, which would create a duplicate analyst
  // review with the same decision/explanation.
  const attemptRetain = async (issueId: string, reviewId: string) => {
    setRetaining(prev => ({...prev, [issueId]: "retaining"}));
    try {
      const ret = await retainReview(reviewId);
      setRetaining(prev => ({...prev, [issueId]: ret.status}));
    } catch (e) {
      setRetaining(prev => ({...prev, [issueId]: "failed"}));
    }
  };

  const handleRetryRetain = (issueId: string) => {
    const reviewId = savedReviewIds[issueId];
    if (reviewId) attemptRetain(issueId, reviewId);
  };

  if (loading && !summary) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white font-mono">Loading Chrimata...</div>;
  if (error) return <div className="p-8 text-red-500 bg-gray-900 h-screen">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-indigo-500/30">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-indigo-400 w-6 h-6" />
          <h1 className="text-xl font-medium tracking-tight text-white">Chrimata</h1>
          <span className="px-2 py-1 bg-gray-800 rounded-md text-xs text-gray-400 ml-4 font-mono">Run: {summary?.run_id?.substring(0,6)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async () => { await injectJulyEvidence(); loadData(); }} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors">
            <PlayCircle className="w-4 h-4" /> Add July Evidence
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset Demo
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context & Evidence */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Overview Metrics */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Database className="w-4 h-4"/> Metrics Overview ({summary?.company_name})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary?.metrics?.map((m: any) => (
                <div key={m.id} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-xs text-gray-400 mb-1">{m.metric.replace(/_/g, ' ')}</div>
                  <div className="text-xl font-medium text-white mb-2">{m.amount_paise ? formatPaise(m.amount_paise) : (m.months ? m.months : 'N/A')}</div>
                  <div className="text-[10px] text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded inline-block">{m.status}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Issues & Claims */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Claim Investigation</h2>
            <div className="flex flex-col gap-4">
              {issues.map(iss => {
                const claim = claims.find(c => c.id === iss.claim_id);
                const draft = reviewDrafts[iss.id] || {decision: 'accept_explanation', exp: ''};
                const rStatus = retaining[iss.id];
                
                return (
                  <div key={iss.id} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-white">{iss.question}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${iss.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {iss.status}
                          </span>
                        </div>
                        {claim && (
                          <div className="text-sm text-gray-400">
                            Claim: <span className="text-gray-200">{claim.original_text}</span> ({claim.as_of_date})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Analyst Review Form */}
                    {iss.status !== 'resolved' && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <h4 className="text-xs text-gray-400 mb-2">Analyst Review</h4>
                        <div className="flex gap-2 mb-3">
                          <select 
                            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            value={draft.decision}
                            onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, decision: e.target.value}})}
                          >
                            <option value="accept_explanation">Accept Explanation</option>
                            <option value="request_evidence">Request Evidence</option>
                            <option value="dispute">Dispute</option>
                            <option value="resolve">Resolve</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Explanation..." 
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            value={draft.exp}
                            onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, exp: e.target.value}})}
                          />
                          <button 
                            onClick={() => handleSubmitReview(iss.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Save
                          </button>
                        </div>
                        {rStatus && (
                          <div className="text-xs flex items-center gap-1 mt-2 text-gray-400">
                            Status: <span className={rStatus === 'retained' ? 'text-green-400' : (rStatus === 'failed' ? 'text-red-400' : 'text-amber-400')}>{rStatus}</span>
                            {rStatus === 'failed' && <button className="ml-2 text-indigo-400 hover:underline text-[10px]" onClick={() => handleRetryRetain(iss.id)}>Retry</button>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {issues.length === 0 && <div className="text-sm text-gray-500 py-4 text-center">No open issues.</div>}
            </div>
          </section>

          {/* Evidence Timeline */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Evidence Timeline</h2>
            <div className="flex flex-col gap-3">
              {docs.map(d => (
                <div key={d.id} className="flex gap-4 items-center bg-gray-800/20 p-3 rounded-lg border border-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-200 truncate">{d.title}</span>
                      <span className="text-xs text-gray-500 font-mono">{d.document_date}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">{d.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Agent Console */}
        <div className="lg:col-span-4 flex flex-col">
          <section className="flex-1 bg-gray-900/80 border border-gray-800 rounded-xl flex flex-col h-[calc(100vh-100px)] sticky top-24 shadow-2xl shadow-indigo-900/10 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400"/> Hindsight Agent
              </h2>
              <div className="flex gap-2">
                <button onClick={handleAgentAnalyze} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">Analyze</button>
                <button onClick={handleNewSession} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900 rounded transition-colors">New Session</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {chat.map((msg, i) => (
                  <motion.div 
                    initial={{opacity: 0, y: 10}} 
                    animate={{opacity: 1, y: 0}}
                    key={i} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                    {msg.context && msg.context.length > 0 && (
                      <div className="mt-2 text-xs bg-indigo-900/20 border border-indigo-500/20 p-2 rounded-lg max-w-[90%]">
                        <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Recalled Memory</div>
                        {msg.context.map((c, j) => (
                          <div key={j} className="text-indigo-200/70 italic">&quot;{c.summary}&quot;</div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {chat.length === 0 && (
                <div className="h-full flex items-center justify-center text-center p-6 text-gray-500 text-sm">
                  Agent is ready. Run Analyze or start asking questions.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/80">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                  placeholder="Ask the investigation agent..." 
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                <button onClick={handleAsk} className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </button>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
