"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchSummary,
  fetchIssues,
  fetchClaims,
  fetchDocuments,
  fetchDocument,
  fetchReport,
  submitReview,
  retainReview,
  agentAnalyze,
  agentAsk,
  agentReflect,
  newSession,
  resetDemo,
  injectJulyEvidence
} from "../../../api/client";
import {
  FileText,
  RefreshCw,
  Send,
  Database,
  CheckCircle2,
  BrainCircuit,
  Clock,
  PlayCircle,
  X,
  Link as LinkIcon,
  Sparkles,
  Download,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  GitBranch,
  Terminal,
  Lock,
  Gavel,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBar } from "../../../components/TrajectoryChart";

function renderMarkdownLite(text: string) {
  const boldify = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="text-on-surface">{part.slice(2, -2)}</strong>
      : part
  );
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <div key={i} className="font-semibold text-on-surface mt-2">{boldify(line.slice(4))}</div>;
    if (line.startsWith("## ")) return <div key={i} className="font-bold text-on-surface mt-2 text-sm">{boldify(line.slice(3))}</div>;
    if (line.startsWith("- ")) return <div key={i} className="pl-3 text-on-surface-variant">• {boldify(line.slice(2))}</div>;
    if (!line.trim()) return <div key={i} className="h-1" />;
    return <div key={i} className="text-on-surface-variant">{boldify(line)}</div>;
  });
}

const NAV = [
  { href: "/dashboard", label: "Queue & Intake", icon: LayoutDashboard },
  { href: "/dashboard/workspace", label: "Diligence Matrix", icon: GitBranch },
  { href: "/dashboard/ingest", label: "Evidence Vault", icon: Terminal },
];

export default function DiligenceWorkspace() {
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

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [selectedLocator, setSelectedLocator] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);

  const [reflectText, setReflectText] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const [reflectUnavailable, setReflectUnavailable] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

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
    setReflectText(null);
    setReflectUnavailable(null);
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

  const handleReflect = async () => {
    setReflecting(true);
    setReflectText(null);
    setReflectUnavailable(null);
    try {
      const res = await agentReflect("demo");
      if (res.available) setReflectText(res.text);
      else setReflectUnavailable(res.reason || "Hindsight has nothing to reflect on yet.");
    } catch (e) {
      setReflectUnavailable("Error connecting to Hindsight.");
    }
    setReflecting(false);
  };

  const handleExportReport = async () => {
    const md = await fetchReport();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chrimata-diligence-report-${summary?.run_id || "demo"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openSource = async (documentId: string, locator?: string) => {
    setDocLoading(true);
    setSelectedLocator(locator || null);
    try {
      const doc = await fetchDocument(documentId);
      setSelectedDoc(doc);
    } catch (e) {
      setSelectedDoc({ title: documentId, content: "Could not load this document.", document_date: "" });
    }
    setDocLoading(false);
  };

  const handleSubmitReview = async (issueId: string) => {
    const draft = reviewDrafts[issueId];
    if (!draft?.decision || !draft?.exp) return;
    setRetaining(prev => ({...prev, [issueId]: "saving"}));
    try {
      const rev = await submitReview(issueId, draft.decision, draft.exp, "Analyst");
      setSavedReviewIds(prev => ({...prev, [issueId]: rev.id}));
      await attemptRetain(issueId, rev.id);
      loadData();
    } catch (e) {
      setRetaining(prev => ({...prev, [issueId]: "failed"}));
    }
  };

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

  if (loading && !summary) return <div className="flex h-screen items-center justify-center bg-aegean-dark text-text-primary font-mono text-sm">Loading Chrimata...</div>;
  if (error) return <div className="p-8 text-terra-alert bg-aegean-dark h-screen font-mono text-sm">{error}</div>;

  const openIssueCount = issues.filter(i => i.status === "open" || i.status === "reopened").length;

  return (
    <div className="min-h-screen bg-aegean-dark text-text-primary font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 hover:w-56 group bg-aegean-surface border-r border-outline-dim flex flex-col justify-between transition-all duration-300 z-50 overflow-hidden">
        <div className="flex flex-col py-4">
          <div className="px-4 mb-6 flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-bronze flex-shrink-0" />
            <span className="font-display text-sm text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Chrimata</span>
          </div>
          <nav className="flex flex-col gap-1 px-2">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = item.href === "/dashboard/workspace";
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-xs transition-all ${active ? "bg-accent-surface text-bronze border border-outline-dim" : "text-on-surface-variant hover:bg-accent-surface hover:text-on-surface"}`}>
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="ml-3 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-outline-dim">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-outline flex-shrink-0" />
            <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <div className="font-mono text-[9px] uppercase tracking-wider text-outline">Demo Integrity</div>
              <div className="font-mono text-[10px] text-tertiary font-medium">Synthetic Data</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-16">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-aegean-dark/85 backdrop-blur-md border-b border-outline-dim flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-on-surface-variant px-2 py-0.5 rounded bg-accent-surface border border-outline-dim">
              RUN {summary?.run_id?.substring(0, 6)}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-surface border border-outline-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary status-pulse"></span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wide">Hindsight Active</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportReport} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-surface hover:bg-outline-dim border border-outline-dim rounded-md text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
            <button onClick={async () => { await injectJulyEvidence(); loadData(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-surface hover:bg-outline-dim border border-outline-dim rounded-md text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              <PlayCircle className="w-3.5 h-3.5" /> Add July Evidence
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 border border-terra-alert/30 text-terra-light hover:bg-terra-alert/10 rounded-md text-xs transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          </div>
        </header>

        {/* Workspace title */}
        <div className="px-8 py-6 border-b border-outline-dim">
          <div className="font-mono text-[10px] uppercase tracking-wider text-outline mb-1.5">
            Target Verification Profile {openIssueCount > 0 && <span className="text-terra-light font-semibold">/ {openIssueCount} Open Issue{openIssueCount !== 1 ? "s" : ""}</span>}
          </div>
          <h1 className="font-display text-3xl text-text-primary font-light tracking-tight flex items-center gap-3">
            {summary?.company_name}
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-accent-surface border border-outline-dim text-on-surface-variant uppercase tracking-widest">Synthetic Demo</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-2">{summary?.document_count} documents on record</p>
        </div>

        <div className="p-8 max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            {/* Metrics */}
            <section>
              <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" /> Calculated Metrics
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summary?.metrics?.map((m: any) => {
                  const isOpen = expandedCalc === m.id;
                  const statusColor = m.status === "conditional" ? "text-terra-light border-terra-alert/20 bg-terra-alert/10"
                    : m.status === "inferred" ? "text-bronze border-bronze/20 bg-bronze/10"
                    : "text-tertiary border-tertiary/20 bg-tertiary/10";
                  return (
                    <div key={m.id} className="bg-aegean-card rounded-xl border border-outline-dim p-4 hover-glow">
                      <div className="text-xs text-outline font-mono mb-1">{m.metric.replace(/_/g, ' ')}</div>
                      <div className="font-display text-2xl text-text-primary mb-2">{m.amount_paise ? formatPaise(m.amount_paise) : (m.months ? `${m.months} mo` : 'N/A')}</div>
                      <button onClick={() => setExpandedCalc(isOpen ? null : m.id)} className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${statusColor}`}>
                        {m.status} {isOpen ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-[11px] text-on-surface-variant space-y-1 overflow-hidden">
                            <div><span className="text-outline">formula:</span> <code className="text-bronze">{m.formula}</code></div>
                            {m.assumptions?.map((a: string, i: number) => <div key={i} className="text-outline">• {a}</div>)}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {m.sources?.map((s: any, i: number) => (
                                <button key={i} onClick={() => openSource(s.document_id, s.locator)} className="flex items-center gap-1 px-1.5 py-0.5 bg-bronze/10 border border-bronze/20 text-bronze rounded hover:bg-bronze/20 transition-colors">
                                  <LinkIcon className="w-2.5 h-2.5" /> {s.document_id}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Real animated comparison bars — claimed vs calculated, never fabricated */}
            <section className="bg-aegean-card rounded-xl border border-outline-dim p-6">
              <h3 className="font-display text-lg text-text-primary mb-1">Claimed vs. Calculated ARR</h3>
              <p className="font-mono text-[10px] text-outline mb-5">March deck assertion vs. April-ledger-derived live ARR — exact figures, no fabricated trend</p>
              {(() => {
                const claimArr = claims.find((c: any) => c.id === "claim-arr-mar");
                const calcArr = summary?.metrics?.find((m: any) => m.id === "calc-live-arr-apr");
                const claimed = claimArr?.stated_amount_paise || 0;
                const calculated = calcArr?.amount_paise || 0;
                const maxVal = Math.max(claimed, calculated) || 1;
                return (
                  <div className="flex flex-col gap-4">
                    <AnimatedBar label="Claimed (March deck)" displayValue={claimed ? formatPaise(claimed) : "n/a"} fraction={claimed / maxVal} color="#B85D3B" sublabel={claimArr?.original_text} />
                    <AnimatedBar label="Calculated (April ledger, annualised)" displayValue={calculated ? formatPaise(calculated) : "n/a"} fraction={calculated / maxVal} color="#4A7C59" sublabel={calcArr?.formula} />
                  </div>
                );
              })()}
            </section>

            {/* Issues */}
            <section>
              <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-terra-light" /> Claim Veracity Investigation
              </h2>
              <div className="flex flex-col gap-4">
                {issues.map(iss => {
                  const claim = claims.find(c => c.id === iss.claim_id);
                  const draft = reviewDrafts[iss.id] || {decision: 'accept_explanation', exp: ''};
                  const rStatus = retaining[iss.id];
                  const resolved = iss.status === 'resolved' || iss.status === 'explained';
                  return (
                    <div key={iss.id} className={`bg-aegean-card border border-outline-dim rounded-xl p-5 relative overflow-hidden ${resolved ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${resolved ? 'bg-tertiary' : 'bg-terra-alert'}`}></div>
                      <div className="pl-3">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-display text-lg text-text-primary">{iss.question}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full whitespace-nowrap uppercase border ${resolved ? 'bg-tertiary/10 border-tertiary/30 text-tertiary' : 'bg-terra-alert/10 border-terra-alert/30 text-terra-light'}`}>
                            {iss.status}
                          </span>
                        </div>
                        {claim && <div className="text-sm text-on-surface-variant">Claim: <span className="text-text-primary italic">"{claim.original_text}"</span> ({claim.as_of_date})</div>}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {iss.evidence_for?.map((s: any, i: number) => (
                            <button key={`ef-${i}`} onClick={() => openSource(s.document_id, s.locator)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-tertiary/10 border border-tertiary/20 text-tertiary rounded hover:bg-tertiary/20 transition-colors">
                              <LinkIcon className="w-2.5 h-2.5" /> for: {s.document_id}
                            </button>
                          ))}
                          {iss.evidence_against?.map((s: any, i: number) => (
                            <button key={`ea-${i}`} onClick={() => openSource(s.document_id, s.locator)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-terra-alert/10 border border-terra-alert/20 text-terra-light rounded hover:bg-terra-alert/20 transition-colors">
                              <LinkIcon className="w-2.5 h-2.5" /> against: {s.document_id}
                            </button>
                          ))}
                        </div>
                      </div>

                      {iss.status !== 'resolved' && (
                        <div className="mt-4 pt-4 border-t border-outline-dim pl-3">
                          <h4 className="font-mono text-[10px] uppercase text-outline mb-2">Analyst Judgment</h4>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select className="bg-accent-surface border border-outline-dim rounded-md px-3 py-2 text-sm text-text-primary focus:border-bronze outline-none sm:w-48"
                              value={draft.decision} onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, decision: e.target.value}})}>
                              <option value="accept_explanation">Accept Explanation</option>
                              <option value="request_evidence">Request Evidence</option>
                              <option value="dispute">Dispute</option>
                              <option value="resolve">Resolve</option>
                            </select>
                            <input type="text" placeholder="Explanation..." className="flex-1 bg-accent-surface border border-outline-dim rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-outline focus:border-bronze outline-none"
                              value={draft.exp} onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, exp: e.target.value}})} />
                            <button onClick={() => handleSubmitReview(iss.id)} className="bg-bronze text-aegean-dark hover:bg-bronze-hover px-4 py-2 rounded-md text-sm font-medium transition-colors">Save</button>
                          </div>
                          {rStatus && (
                            <div className="text-xs flex items-center gap-1 mt-2 text-on-surface-variant">
                              Status: <span className={rStatus === 'retained' ? 'text-tertiary' : (rStatus === 'failed' ? 'text-terra-light' : 'text-bronze')}>{rStatus}</span>
                              {rStatus === 'failed' && <button className="ml-2 text-bronze hover:underline text-[10px]" onClick={() => handleRetryRetain(iss.id)}>Retry</button>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {issues.length === 0 && <div className="text-sm text-outline py-4 text-center">No open issues.</div>}
              </div>
            </section>

            {/* Timeline */}
            <section className="bg-aegean-card rounded-xl border border-outline-dim p-5">
              <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Evidence Timeline
              </h2>
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {docs.map(d => (
                  <button key={d.id} onClick={() => openSource(d.id)} className="text-left flex gap-3 items-center bg-aegean-dark/60 p-2.5 rounded-lg border border-outline-dim hover:border-outline-soft transition-colors">
                    <div className="w-8 h-8 rounded bg-accent-surface flex items-center justify-center flex-shrink-0 text-outline">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-medium text-text-primary truncate">{d.title}</span>
                        <span className="text-[10px] text-outline font-mono">{d.document_date}</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant truncate">{d.content}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Agent */}
          <div className="xl:col-span-4 flex flex-col">
            <section className="bg-aegean-card border border-outline-dim rounded-xl flex flex-col h-[calc(100vh-140px)] sticky top-24 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-dim flex justify-between items-center">
                <h2 className="font-mono text-xs font-semibold text-bronze uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4"/> Hindsight Agent
                </h2>
                <div className="flex gap-1.5">
                  <button onClick={handleAgentAnalyze} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-accent-surface hover:bg-outline-dim text-on-surface-variant rounded transition-colors">Analyze</button>
                  <button onClick={handleReflect} disabled={reflecting} className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-bronze/15 border border-bronze/30 text-bronze hover:bg-bronze/25 rounded transition-colors disabled:opacity-50">
                    <Sparkles className="w-3 h-3" /> {reflecting ? "..." : "Reflect"}
                  </button>
                  <button onClick={handleNewSession} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 bg-tertiary/15 border border-tertiary/30 text-tertiary hover:bg-tertiary/25 rounded transition-colors">New Session</button>
                </div>
              </div>

              {(reflectText || reflectUnavailable) && (
                <div className="p-3 border-b border-outline-dim bg-bronze/5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] uppercase tracking-wider text-bronze font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Hindsight Reflection {reflectUnavailable && "(unavailable)"}
                  </div>
                  <div className="text-xs space-y-0.5">{reflectText ? renderMarkdownLite(reflectText) : reflectUnavailable}</div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {chat.map((msg, i) => (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-bronze text-aegean-dark rounded-br-none' : 'bg-accent-surface border border-outline-dim text-text-primary rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                      {msg.context && msg.context.length > 0 && (
                        <div className="mt-2 text-xs bg-tertiary/10 border border-tertiary/20 p-2 rounded-lg max-w-[90%]">
                          <div className="font-semibold text-tertiary mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Recalled Memory</div>
                          {msg.context.map((c, j) => <div key={j} className="text-tertiary/80 italic">&quot;{c.summary}&quot;</div>)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chat.length === 0 && <div className="h-full flex items-center justify-center text-center p-6 text-outline text-sm">Agent is ready. Run Analyze or start asking questions.</div>}
              </div>

              <div className="p-4 border-t border-outline-dim">
                <div className="flex gap-2">
                  <input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask the investigation agent..." className="flex-1 bg-accent-surface border border-outline-dim rounded-full px-4 py-2 text-sm text-text-primary focus:border-bronze outline-none transition-all" />
                  <button onClick={handleAsk} className="w-10 h-10 rounded-full bg-bronze hover:bg-bronze-hover flex items-center justify-center flex-shrink-0 transition-colors">
                    <Send className="w-4 h-4 text-aegean-dark ml-0.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(selectedDoc || docLoading) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={() => { setSelectedDoc(null); setSelectedLocator(null); }}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="bg-aegean-card border border-outline-dim rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-outline-dim flex justify-between items-start">
                <div>
                  <div className="text-xs text-outline font-mono">{selectedDoc?.id}</div>
                  <h3 className="text-lg font-display text-text-primary">{docLoading ? "Loading..." : selectedDoc?.title}</h3>
                  {selectedDoc?.document_date && <div className="text-xs text-outline">Document date: {selectedDoc.document_date} · Ingested: {selectedDoc.ingested_at}</div>}
                  {selectedLocator && <div className="text-xs text-bronze mt-1">Cited locator: {selectedLocator}</div>}
                </div>
                <button onClick={() => { setSelectedDoc(null); setSelectedLocator(null); }} className="text-outline hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto text-sm text-on-surface-variant whitespace-pre-wrap font-mono">
                {docLoading ? "Fetching document..." : selectedDoc?.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
