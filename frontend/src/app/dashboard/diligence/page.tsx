"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  fetchIssues,
  fetchClaims,
  fetchDocuments,
  fetchDocument,
  fetchReport,
  submitReview,
  retainReview,
  resetDemo,
  injectJulyEvidence
} from "../../../api/client";
import {
  FileText,
  RefreshCw,
  Database,
  Clock,
  PlayCircle,
  X,
  Link as LinkIcon,
  Download,
  ChevronDown,
  ChevronUp,
  Gavel,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBar } from "../../../components/TrajectoryChart";
import { PageHeader, Panel, StatusBadge, Button, Input, Select, EmptyState } from "../../../components/dashboard/ui";
import Link from "next/link";
import { ROUTES } from "../../../routes";
import type { Claim, DocumentRecord, Issue, Summary } from "../../../api/types";

export default function DiligenceWorkspace() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewDrafts, setReviewDrafts] = useState<Record<string, {decision: string, exp: string}>>({});
  const [retaining, setRetaining] = useState<Record<string, string>>({});
  const [savedReviewIds, setSavedReviewIds] = useState<Record<string, string>>({});

  const [selectedDoc, setSelectedDoc] = useState<Partial<DocumentRecord> | null>(null);
  const [selectedLocator, setSelectedLocator] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
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
    } catch {
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
    } catch {
      setRetaining(prev => ({...prev, [issueId]: "failed"}));
    }
  };

  const attemptRetain = async (issueId: string, reviewId: string) => {
    setRetaining(prev => ({...prev, [issueId]: "retaining"}));
    try {
      const ret = await retainReview(reviewId);
      setRetaining(prev => ({...prev, [issueId]: ret.status}));
    } catch {
      setRetaining(prev => ({...prev, [issueId]: "failed"}));
    }
  };

  const handleRetryRetain = (issueId: string) => {
    const reviewId = savedReviewIds[issueId];
    if (reviewId) attemptRetain(issueId, reviewId);
  };

  if (loading && !summary) return <EmptyState title="Loading Chrimata..." />;
  if (error) return <EmptyState title="Unable to load diligence data" description={error} />;

  const openIssueCount = issues.filter(i => i.status === "open" || i.status === "reopened").length;

  return (
    <>
<PageHeader eyebrow={<>Target Verification Profile {openIssueCount > 0 && <span className="text-terra-light">/ {openIssueCount} Open Issue{openIssueCount !== 1 ? "s" : ""}</span>}</>} title={<>{summary?.company_name} <StatusBadge>Synthetic Demo</StatusBadge></>} description={`${summary?.document_count} documents on record`} actions={<><Button onClick={handleExportReport}><Download className="h-3.5 w-3.5" /> Export Report</Button><Button onClick={async () => { await injectJulyEvidence(); loadData(); }}><PlayCircle className="h-3.5 w-3.5" /> Add July Evidence</Button><Button variant="danger" onClick={handleReset}><RefreshCw className="h-3.5 w-3.5" /> Reset Demo</Button><Link href={ROUTES.ask} className="dashboard-button dashboard-button-primary">Ask Chrimata</Link></>} />
<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* LEFT */}
          <div className="xl:col-span-12 flex flex-col gap-8">
            {/* Metrics */}
            <section>
              <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" /> Calculated Metrics
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summary?.metrics?.map((m) => {
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
                              {m.sources?.map((s, i) => (
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
            <Panel className="p-6">
              <h3 className="font-display text-lg text-text-primary mb-1">Claimed vs. Calculated ARR</h3>
              <p className="font-mono text-[10px] text-outline mb-5">March deck assertion vs. April-ledger-derived live ARR — exact figures, no fabricated trend</p>
              {(() => {
                const claimArr = claims.find((c) => c.id === "claim-arr-mar");
                const calcArr = summary?.metrics?.find((m) => m.id === "calc-live-arr-apr");
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
            </Panel>

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
                        {claim && <div className="text-sm text-on-surface-variant">Claim: <span className="text-text-primary italic">&ldquo;{claim.original_text}&rdquo;</span> ({claim.as_of_date})</div>}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {iss.evidence_for?.map((s, i) => (
                            <button key={`ef-${i}`} onClick={() => openSource(s.document_id, s.locator)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-tertiary/10 border border-tertiary/20 text-tertiary rounded hover:bg-tertiary/20 transition-colors">
                              <LinkIcon className="w-2.5 h-2.5" /> for: {s.document_id}
                            </button>
                          ))}
                          {iss.evidence_against?.map((s, i) => (
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
                            <Select className="sm:w-48"
                              value={draft.decision} onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, decision: e.target.value}})}>
                              <option value="accept_explanation">Accept Explanation</option>
                              <option value="request_evidence">Request Evidence</option>
                              <option value="dispute">Dispute</option>
                              <option value="resolve">Resolve</option>
                            </Select>
                            <Input type="text" placeholder="Explanation..." className="flex-1"
                              value={draft.exp} onChange={(e) => setReviewDrafts({...reviewDrafts, [iss.id]: {...draft, exp: e.target.value}})} />
                            <Button variant="primary" onClick={() => handleSubmitReview(iss.id)}>Save</Button>
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
            <Panel className="p-5">
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
            </Panel>
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
    </>
  );
}
