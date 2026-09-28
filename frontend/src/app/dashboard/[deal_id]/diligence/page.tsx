"use client";

import { useEffect, useState } from "react";
import { MarkdownMessage } from "../../../../components/dashboard/MarkdownMessage";
import { useParams } from "next/navigation";
import {
  fetchIssues,
  fetchClaims,
  fetchDocuments,
  fetchDocument,
  fetchReport,
  submitReview,
  retainReview,
  resetDemo,
  injectJulyEvidence,
  listChangeReviews,
  generateEvidenceRequest,
  listEvidenceRequests,
  patchEvidenceRequest,
  getDecisionReceipt,
  retryRetention as apiRetryRetention,
  memoryReplay,
  createAIReview
} from "../../../../api/client";
import { useDashboardStore } from "../../../../components/dashboard/store";
import { formatPaise } from "../../../../lib/format";
import {
  DocumentText,
  Refresh2,
  Data,
  Clock,
  PlayCircle,
  CloseSquare,
  Link as LinkIcon,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
  Judge,
} from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBar } from "../../../../components/TrajectoryChart";
import { PageHeader, Panel, StatusBadge, Button, Input, Select, EmptyState } from "../../../../components/dashboard/ui";
import Link from "next/link";
import { ROUTES } from "../../../../routes";
import type { Claim, DocumentRecord, Issue, Summary } from "../../../../api/types";

export default function DiligenceWorkspace() {
  const params = useParams<{ deal_id?: string }>();
  const dealId = params?.deal_id || "northstar";
  const { summary } = useDashboardStore();
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

  // New features state
  const [changeReviews, setChangeReviews] = useState<any[]>([]);
  const [evidenceRequests, setEvidenceRequests] = useState<Record<string, any[]>>({});
  const [decisionReceipts, setDecisionReceipts] = useState<Record<string, any>>({});
  const [memoryReplays, setMemoryReplays] = useState<Record<string, any>>({});
  const [featureLoading, setFeatureLoading] = useState<Record<string, boolean>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [iss, cls, ds] = await Promise.all([
        fetchIssues(dealId), fetchClaims(dealId), fetchDocuments(dealId)
      ]);
      setIssues(iss);
      setClaims(cls);
      setDocs(ds);
      setError("");

      // Fetch extra data for new features
      const crs = await listChangeReviews(dealId).catch(() => []);
      setChangeReviews(crs);

      const erData: Record<string, any[]> = {};
      const drData: Record<string, any> = {};
      for (const i of iss) {
        const er = await listEvidenceRequests(i.id).catch(() => []);
        if (er.length) erData[i.id] = er;
        
        const dr = await getDecisionReceipt(i.id).catch(() => null);
        if (dr) drData[i.id] = dr;
      }
      setEvidenceRequests(erData);
      setDecisionReceipts(drData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
    setLoading(false);
  }

  const handleReset = async () => {
    await resetDemo();
    await loadData();
  };

  const handleExportReport = async () => {
    const md = await fetchReport(dealId);
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
      const doc = await fetchDocument(dealId, documentId);
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

  const handleGenerateEvidenceRequest = async (issueId: string) => {
    setFeatureLoading(prev => ({...prev, [`er_${issueId}`]: true}));
    try {
      await generateEvidenceRequest(issueId);
      await loadData(); // Reload to get the new request
    } catch (e: any) {
      alert("Failed to generate evidence request: " + e.message);
    }
    setFeatureLoading(prev => ({...prev, [`er_${issueId}`]: false}));
  };

  const handleMemoryReplay = async (issueId: string) => {
    setFeatureLoading(prev => ({...prev, [`mr_${issueId}`]: true}));
    try {
      const res = await memoryReplay(issueId);
      setMemoryReplays(prev => ({...prev, [issueId]: res}));
    } catch (e: any) {
      alert("Failed to run memory replay: " + e.message);
    }
    setFeatureLoading(prev => ({...prev, [`mr_${issueId}`]: false}));
  };

  const handleAnalyzeNewEvidence = async (docId: string) => {
    setFeatureLoading(prev => ({...prev, [`analyze_${docId}`]: true}));
    try {
      await createAIReview(docId, true);
      await loadData();
    } catch (e: any) {
      alert("Failed to analyze new evidence: " + e.message);
    }
    setFeatureLoading(prev => ({...prev, [`analyze_${docId}`]: false}));
  };

  if (loading && !summary) return <EmptyState title="Loading Chrimata..." />;
  if (error) return <EmptyState title="Unable to load diligence data" description={error} />;

  const openIssueCount = issues.filter(i => i.status === "open" || i.status === "reopened").length;

  return (
    <>
<PageHeader eyebrow={<>Target Verification Profile {openIssueCount > 0 && <span className="text-terra-light">/ {openIssueCount} Open Issue{openIssueCount !== 1 ? "s" : ""}</span>}</>} title={<>{summary?.company_name} <StatusBadge>Synthetic Demo</StatusBadge></>} description={`${summary?.document_count} documents on record`} actions={<><Button onClick={handleExportReport}><DocumentDownload className="h-3.5 w-3.5" /> Export Report</Button><Button onClick={async () => { await injectJulyEvidence(dealId); loadData(); }}><PlayCircle className="h-3.5 w-3.5" /> Add July Evidence</Button><Button variant="danger" onClick={handleReset}><Refresh2 className="h-3.5 w-3.5" /> Reset Demo</Button><Link href={ROUTES.ask(dealId)} className="dashboard-button dashboard-button-primary">Ask Chrimata</Link></>} />
<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* LEFT */}
          <div className="xl:col-span-12 flex flex-col gap-8">
            {/* Metrics */}
            <section>
              <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <Data className="w-4 h-4" /> Calculated Metrics
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
                        {m.status} {isOpen ? <ArrowUp2 className="w-3 h-3"/> : <ArrowDown2 className="w-3 h-3"/>}
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
                const claimArr = claims.find((c) => c.id.endsWith("-claim-arr-mar"));
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
                <Judge className="w-4 h-4 text-terra-light" /> Claim Veracity Investigation
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

                      {/* Feature 3: Decision Receipt */}
                      {decisionReceipts[iss.id] && (
                        <div className="mt-4 pt-4 border-t border-outline-dim pl-3 bg-aegean-dark/50 p-3 rounded-lg">
                          <h4 className="font-mono text-[10px] uppercase text-outline mb-2 flex items-center justify-between">
                            <span>Decision Receipt</span>
                            <span className={decisionReceipts[iss.id].retention_status === 'retained' ? 'text-tertiary' : 'text-terra-light'}>
                              {decisionReceipts[iss.id].retention_status.toUpperCase()}
                            </span>
                          </h4>
                          <div className="text-xs text-on-surface-variant font-mono whitespace-pre-wrap">{decisionReceipts[iss.id].decision_text}</div>
                          <div className="mt-2 text-[9px] text-outline">Recalled {decisionReceipts[iss.id].recall_count || 0} times by future agents</div>
                          
                          <div className="mt-3 flex gap-2">
                            <Button variant="secondary" onClick={() => handleMemoryReplay(iss.id)} disabled={featureLoading[`mr_${iss.id}`]}>
                              {featureLoading[`mr_${iss.id}`] ? "Replaying..." : "Test Memory Replay (Sandbox)"}
                            </Button>
                          </div>
                          {memoryReplays[iss.id] && (
                            <div className="mt-3 p-3 bg-black/40 border border-outline-dim rounded text-xs">
                              <h5 className="font-semibold text-text-primary mb-2">Memory Effect (Server-side diff):</h5>
                              {memoryReplays[iss.id].differences.map((diff: any, idx: number) => (
                                <div key={idx} className="mb-2">
                                  <div className="text-outline uppercase text-[10px]">{diff.field}</div>
                                  <div className="flex gap-2">
                                    <div className="flex-1 bg-terra-alert/10 text-terra-light p-1.5 rounded line-through opacity-80">Without memory: {diff.without_memory}</div>
                                    <div className="flex-1 bg-tertiary/10 text-tertiary p-1.5 rounded">With memory: {diff.with_memory}</div>
                                  </div>
                                </div>
                              ))}
                              {memoryReplays[iss.id].memory_used.length > 0 && (
                                <div className="mt-2 text-[10px] text-bronze">
                                  Retrieved {memoryReplays[iss.id].memory_used.length} memories for context.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feature 2: Evidence Requests */}
                      {evidenceRequests[iss.id] && evidenceRequests[iss.id].length > 0 && (
                        <div className="mt-4 pt-4 border-t border-outline-dim pl-3">
                          <h4 className="font-mono text-[10px] uppercase text-outline mb-2 flex items-center justify-between">
                            <span>Learned Evidence Requests</span>
                          </h4>
                          <div className="flex flex-col gap-2">
                            {evidenceRequests[iss.id].map((req: any) => (
                              <div key={req.id} className="bg-aegean-dark border border-outline-dim p-2 rounded text-xs">
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${req.status === 'requested' ? 'bg-bronze/20 text-bronze' : req.status === 'received' ? 'bg-tertiary/20 text-tertiary' : 'bg-terra-alert/20 text-terra-light'}`}>{req.status}</span>
                                </div>
                                <div className="text-text-primary italic mb-1">"{req.request_text}"</div>
                                <div className="text-outline text-[10px]">Reasoning: {req.reason}</div>
                                {req.status === 'requested' && (
                                  <div className="mt-2 flex gap-1">
                                    <button className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-1 rounded" onClick={async () => {
                                      await patchEvidenceRequest(req.id, "received");
                                      loadData();
                                    }}>Mark Received</button>
                                    <button className="text-[10px] bg-terra-alert/10 text-terra-light px-2 py-1 rounded" onClick={async () => {
                                      const note = prompt("Why was it insufficient?");
                                      if (note) {
                                        await patchEvidenceRequest(req.id, "insufficient", note);
                                        loadData();
                                      }
                                    }}>Mark Insufficient</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                            
                            <Button variant="secondary" onClick={() => handleGenerateEvidenceRequest(iss.id)} disabled={featureLoading[`er_${iss.id}`]}>
                              {featureLoading[`er_${iss.id}`] ? "Thinking..." : "Generate AI Request"}
                            </Button>
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
                  <div key={d.id} className="text-left flex gap-3 items-center bg-aegean-dark/60 p-2.5 rounded-lg border border-outline-dim hover:border-outline-soft transition-colors relative group">
                    <button onClick={() => openSource(d.id)} className="flex-1 min-w-0 text-left flex gap-3 items-center">
                      <div className="w-8 h-8 rounded bg-accent-surface flex items-center justify-center flex-shrink-0 text-outline">
                        <DocumentText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-medium text-text-primary truncate">{d.title}</span>
                          <span className="text-[10px] text-outline font-mono group-hover:opacity-0 transition-opacity duration-200">{d.document_date}</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant line-clamp-2 [&_.ask-markdown]:text-[10px] [&_p]:my-0 [&_h1]:text-[10px] [&_h2]:text-[10px] [&_ul]:my-0 [&_li]:my-0">
                          <MarkdownMessage text={d.content} />
                        </div>
                      </div>
                    </button>
                    <button onClick={() => handleAnalyzeNewEvidence(d.id)} disabled={featureLoading[`analyze_${d.id}`]}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#0d1520]/90 backdrop-blur-sm text-bronze border border-bronze/20 px-2 py-1 rounded text-[9px] font-mono uppercase z-10 shadow-sm">
                      {featureLoading[`analyze_${d.id}`] ? "Analyzing..." : "Analyze Impact"}
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
            
            {/* Feature 1: Memory-Aware "What Changed?" */}
            {changeReviews.length > 0 && (
              <Panel className="p-5">
                <h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Data className="w-4 h-4 text-bronze" /> Investigation History ("What Changed?")
                </h2>
                <div className="flex flex-col gap-4">
                  {changeReviews.map(cr => (
                    <div key={cr.id} className="bg-aegean-dark border border-outline-dim rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-semibold text-text-primary">{cr.summary}</div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded ${cr.author_type === 'agent' ? 'bg-bronze/20 text-bronze' : 'bg-tertiary/20 text-tertiary'}`}>{cr.author_type} Review</span>
                      </div>
                      
                      {cr.detected_changes?.length > 0 && (
                        <div className="mt-3">
                          <div className="text-[10px] uppercase text-outline mb-1 font-mono">Detected Changes:</div>
                          <ul className="text-xs text-on-surface-variant space-y-1 list-disc pl-4">
                            {cr.detected_changes.map((dc: any, idx: number) => (
                              <li key={idx}>
                                {dc.statement} 
                                {dc.source_ids?.length > 0 && <span className="text-[9px] text-outline ml-1">({dc.source_ids.join(", ")})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {(cr.affected_issue_ids?.length > 0 || cr.created_issue_ids?.length > 0) && (
                        <div className="mt-3 flex gap-4">
                          {cr.affected_issue_ids.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase text-outline mb-1 font-mono">Affected Issues:</div>
                              <div className="flex gap-1 flex-wrap">
                                {cr.affected_issue_ids.map((id: string) => <span key={id} className="bg-terra-alert/10 text-terra-light px-1.5 py-0.5 rounded text-[10px] font-mono">{id}</span>)}
                              </div>
                            </div>
                          )}
                          {cr.created_issue_ids.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase text-outline mb-1 font-mono">New Issues Opened:</div>
                              <div className="flex gap-1 flex-wrap">
                                {cr.created_issue_ids.map((id: string) => <span key={id} className="bg-bronze/10 text-bronze px-1.5 py-0.5 rounded text-[10px] font-mono">{id}</span>)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cr.memory_ids_used?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-outline-dim">
                          <div className="text-[10px] uppercase text-bronze mb-1 font-mono">Memory Effect:</div>
                          <div className="text-xs text-on-surface-variant italic">{cr.memory_context_summary}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            
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
                  <CloseSquare className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto text-sm text-on-surface-variant">
                {docLoading ? "Fetching document..." : <MarkdownMessage text={selectedDoc?.content || ""} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
