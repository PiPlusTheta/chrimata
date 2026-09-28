"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchDocuments, fetchIssues } from "../../../../api/client";
import type { DocumentRecord, Issue } from "../../../../api/types";
import { useDashboardStore } from "../../../../components/dashboard/store";
import { ROUTES } from "../../../../routes";
import { Button, DataTable, EmptyState, FilterBar, PageHeader, Panel, StatCard, StatusBadge } from "../../../../components/dashboard/ui";

function formatPaise(paise?: number | null) {
  if (paise == null) return "—";
  if (paise >= 1_000_000_000) return `₹${(paise / 1_000_000_000).toFixed(2)} Cr`;
  if (paise >= 10_000_000) return `₹${(paise / 10_000_000).toFixed(2)} L`;
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function DashboardQueue() {
  const params = useParams<{ deal_id?: string }>();
  const dealId = params?.deal_id || "northstar";
  const { summary } = useDashboardStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextIssues, nextDocuments] = await Promise.all([fetchIssues(dealId), fetchDocuments(dealId)]);
      setIssues(nextIssues);
      setDocuments(nextDocuments);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the review queue.");
    } finally {
      setLoading(false);
    }
  }, [dealId]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const filteredDocuments = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? documents.filter((doc) => [doc.title, doc.type, doc.id, doc.content].some((value) => value?.toLowerCase().includes(term))) : documents;
  }, [documents, query]);
  const openIssues = issues.filter((issue) => issue.status === "open" || issue.status === "reopened");
  const arr = summary?.metrics.find((metric) => metric.id === "calc-live-arr-apr");
  const runway = summary?.metrics.find((metric) => metric.id === "calc-runway-base");

  function exportCsv() {
    if (!summary) return;
    const rows: (string | number)[][] = [["company", "run_id", "documents", "open_issues"], [summary.company_name, summary.run_id, summary.document_count, summary.open_issue_count], [], ["metric", "status", "amount_paise", "months"]];
    for (const metric of summary.metrics) rows.push([metric.metric, metric.status, metric.amount_paise ?? "", metric.months ?? ""]);
    // CSV injection guard: a cell starting with =, +, -, @, tab, or CR is interpreted
    // as a formula by Excel/Sheets when opened. Values here come from claim/metric
    // text an analyst may have typed, so prefix with a bare quote to force text mode.
    const escapeCsvCell = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
    const csv = rows.map((row) => row.map((value) => `"${escapeCsvCell(String(value)).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chrimata-${summary.run_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <>
    <PageHeader eyebrow="Portfolio Review Ledger / Cryptographic Integrity Level 4" title="Institutional Review Queue & Diligence Registry" description={summary ? `Current mandate: ${summary.company_name}. Evidence and discrepancies below are loaded from the active run.` : "Review the active mandate and its evidence."} actions={<><Button onClick={() => void load()}>Refresh</Button><Button onClick={exportCsv} disabled={!summary}>Export CSV</Button><Link href={ROUTES.evidence(dealId)} className="dashboard-button dashboard-button-primary">Register Evidence</Link></>} />
    {error && <Panel className="p-4 text-sm text-terra-light" role="alert">{error} <Button onClick={() => void load()} className="ml-3">Retry</Button></Panel>}
    {loading && !summary ? <EmptyState title="Loading review queue" /> : summary && <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents on Record" value={summary.document_count} status={<StatusBadge tone="success">Current run</StatusBadge>} footer={<><span>{summary.company_name}</span><Link href={ROUTES.evidence(dealId)} className="text-bronze">View evidence</Link></>} />
        <StatCard label="Open Issues" value={<span className="text-terra-light">{openIssues.length}</span>} status={<StatusBadge tone={openIssues.length ? "warning" : "success"}>{openIssues.length ? "Review" : "Clear"}</StatusBadge>} footer={<><span>Claim investigation</span><Link href={ROUTES.diligence(dealId)} className="text-bronze">Investigate</Link></>} />
        <StatCard label="Live Annualised ARR" value={<span className="text-bronze">{formatPaise(arr?.amount_paise)}</span>} status={<StatusBadge tone="accent">{arr?.status ?? "Unavailable"}</StatusBadge>} footer={<><span>{arr?.formula ?? "No calculation"}</span></>} />
        <StatCard label="Cash Runway" value={<span className="text-tertiary">{runway?.months ?? "—"} mo</span>} status={<StatusBadge tone="neutral">{runway?.status ?? "Unavailable"}</StatusBadge>} footer={<><span>{runway?.formula ?? "No calculation"}</span></>} />
      </section>
      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-headline text-xl text-on-surface">Claim Veracity Investigation</h2><Link href={ROUTES.diligence(dealId)} className="text-xs text-bronze">Open Diligence Matrix</Link></div>
        {openIssues.length ? <div className="space-y-3">{openIssues.map((issue) => <div key={issue.id} className="rounded-lg border border-hairline bg-accent-surface p-3"><div className="mb-1 flex items-center gap-2"><StatusBadge tone="warning">{issue.status}</StatusBadge><span className="font-mono text-[10px] text-outline">{issue.id}</span></div><p className="text-sm text-on-surface">{issue.question}</p></div>)}</div> : <EmptyState title="No open issues" description="The current run has no open claim investigations." />}
      </Panel>
      <Panel className="overflow-hidden">
        <div className="border-b border-hairline p-5"><h2 className="font-headline text-xl text-on-surface">Evidence Registry</h2><p className="mt-1 text-xs text-on-surface-variant">Documents in the current mandate</p></div>
        <FilterBar className="!rounded-none !border-0"><label htmlFor="queue-search" className="font-mono text-[10px] uppercase text-outline">Search evidence</label><input id="queue-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, type, ID, or contents" className="dashboard-input w-full sm:max-w-sm" /></FilterBar>
        {filteredDocuments.length ? <DataTable><thead><tr className="border-y border-hairline bg-accent-surface/40 font-mono text-outline"><th className="px-4 py-3">Document</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-hairline text-xs">{filteredDocuments.map((doc) => <tr key={doc.id}><td className="px-4 py-3 text-on-surface">{doc.title}<div className="font-mono text-[10px] text-outline">{doc.id}</div></td><td className="px-4 py-3 text-on-surface-variant">{doc.type}</td><td className="px-4 py-3 font-mono text-on-surface-variant">{doc.document_date}</td><td className="px-4 py-3 text-right"><Link href={`${ROUTES.evidence(dealId)}?document=${encodeURIComponent(doc.id)}`} className="text-bronze hover:underline">Open</Link></td></tr>)}</tbody></DataTable> : <EmptyState title="No matching documents" description="Try another search term." />}
      </Panel>
    </>}
  </>;
}
