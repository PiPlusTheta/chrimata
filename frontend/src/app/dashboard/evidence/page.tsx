"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDocuments, registerDocument } from "../../../api/client";
import type { DocumentRecord } from "../../../api/types";
import { Button, DataTable, EmptyState, Input, PageHeader, Panel, StatusBadge } from "../../../components/dashboard/ui";

export default function EvidenceVault() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("document"));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text/plain");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [claimMetric, setClaimMetric] = useState("");
  const [claimText, setClaimText] = useState("");
  const [claimAmount, setClaimAmount] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setDocuments(await fetchDocuments()); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load evidence."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const syncSelection = () => setSelectedId(new URLSearchParams(window.location.search).get("document"));
    window.addEventListener("popstate", syncSelection);
    return () => window.removeEventListener("popstate", syncSelection);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? documents.filter((document) => [document.title, document.id, document.type, document.content].some((value) => value.toLowerCase().includes(term))) : documents;
  }, [documents, search]);
  const selected = documents.find((document) => document.id === selectedId);

  function openDocument(id: string | null) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("document", id); else url.searchParams.delete("document");
    window.history.pushState({}, "", url);
    setSelectedId(id);
  }

  async function readFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md|csv)$/i.test(file.name)) { setError("Choose a text, Markdown, or CSV file. Other formats need a supported parser before ingestion."); return; }
    setContent(await file.text());
    if (!title) setTitle(file.name);
    setType(file.type || "text/plain");
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !date) return;
    if ((claimMetric || claimText || claimAmount) && (!claimMetric.trim() || !claimText.trim())) {
      setError("Enter both a metric and source claim text, or leave the claim fields blank.");
      return;
    }
    const amount = claimAmount.trim() ? Number(claimAmount) : null;
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) { setError("Claim amount must be a non-negative rupee value."); return; }
    const documentId = `doc-${crypto.randomUUID()}`;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const result = await registerDocument({
        id: documentId, deal_id: "demo", title: title.trim(), type, version: "1", document_date: date,
        ingested_at: new Date().toISOString(), content: content.trim(), synthetic: false,
        claims: claimMetric.trim() && claimText.trim() ? [{
          id: `claim-${crypto.randomUUID()}`, metric: claimMetric.trim(), original_text: claimText.trim(),
          stated_amount_paise: amount === null ? null : Math.round(amount * 100), as_of_date: date, locator: "submitted text",
        }] : [],
      });
      setDocuments((previous) => [result.document, ...previous]);
      setSuccess(`Evidence registered. ${result.claims_created.length} claim${result.claims_created.length === 1 ? "" : "s"} indexed; ${result.issues_opened.length} issue${result.issues_opened.length === 1 ? "" : "s"} opened.`);
      setTitle(""); setContent(""); setClaimMetric(""); setClaimText(""); setClaimAmount("");
      openDocument(documentId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to register evidence."); }
    finally { setSaving(false); }
  }

  return <>
    <PageHeader eyebrow="Evidence Vault / Current Mandate" title="Evidence & Ingestion Terminal" description="Review registered source documents or add text evidence to the live diligence record. Claims submitted with a document enter the existing discrepancy workflow." actions={<Button onClick={() => void load()}>Refresh</Button>} />
    {error && <Panel className="p-4 text-sm text-terra-light" role="alert">{error}</Panel>}
    {success && <Panel className="p-4 text-sm text-tertiary" role="status">{success}</Panel>}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <Panel className="overflow-hidden xl:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5"><div><h2 className="font-headline text-xl text-on-surface">Registered Evidence</h2><p className="text-xs text-on-surface-variant">{documents.length} documents in the current deal</p></div><Input aria-label="Search evidence" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" /></div>
        {loading ? <EmptyState title="Loading evidence" /> : filtered.length ? <DataTable><thead><tr className="border-b border-hairline bg-accent-surface/40 font-mono text-outline"><th className="px-4 py-3">Document</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-hairline text-xs">{filtered.map((document) => <tr key={document.id} className={selectedId === document.id ? "bg-accent-surface" : ""}><td className="px-4 py-3"><div className="text-on-surface">{document.title}</div><div className="font-mono text-[10px] text-outline">{document.id}</div></td><td className="px-4 py-3 font-mono text-on-surface-variant">{document.document_date}</td><td className="px-4 py-3 text-right"><button onClick={() => openDocument(document.id)} className="text-bronze hover:underline">Open</button></td></tr>)}</tbody></DataTable> : <EmptyState title="No matching evidence" description="Try another search term or register a document." />}
        {selected && <div className="border-t border-hairline p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-headline text-lg text-on-surface">{selected.title}</h3><p className="font-mono text-[10px] text-outline">{selected.id} · {selected.type} · {selected.document_date}</p></div><button onClick={() => openDocument(null)} className="text-xs text-on-surface-variant hover:text-on-surface">Close</button></div><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-hairline bg-accent-surface p-4 font-mono text-xs text-on-surface-variant">{selected.content}</pre></div>}
      </Panel>
      <Panel className="p-5 xl:col-span-5">
        <h2 className="font-headline text-xl text-on-surface">Register Evidence</h2>
        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">Paste text or choose a text, Markdown, or CSV file. Unsupported formats require a parser and cannot be submitted here.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs text-on-surface-variant">Document title<Input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full" /></label>
          <label className="block text-xs text-on-surface-variant">Document date<Input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full" /></label>
          <label className="block text-xs text-on-surface-variant">Text file (optional)<Input type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" onChange={(event) => void readFile(event.target.files?.[0])} className="mt-1 w-full" /></label>
          <label className="block text-xs text-on-surface-variant">Source text<textarea required value={content} onChange={(event) => setContent(event.target.value)} rows={8} className="dashboard-input mt-1 w-full resize-y" /></label>
          <div className="border-t border-hairline pt-4"><div className="mb-3 flex items-center gap-2"><h3 className="font-mono text-[10px] uppercase tracking-wide text-outline">Optional claim</h3><StatusBadge>Indexed if supplied</StatusBadge></div><div className="space-y-3"><label className="block text-xs text-on-surface-variant">Metric key<Input value={claimMetric} onChange={(event) => setClaimMetric(event.target.value)} placeholder="e.g. active_mrr" className="mt-1 w-full" /></label><label className="block text-xs text-on-surface-variant">Claim as written<Input value={claimText} onChange={(event) => setClaimText(event.target.value)} className="mt-1 w-full" /></label><label className="block text-xs text-on-surface-variant">Amount in ₹ (optional)<Input type="number" min="0" step="0.01" value={claimAmount} onChange={(event) => setClaimAmount(event.target.value)} className="mt-1 w-full" /></label></div></div>
          <Button type="submit" variant="primary" disabled={saving || !title.trim() || !content.trim()} className="w-full">{saving ? "Registering…" : "Register Evidence"}</Button>
        </form>
      </Panel>
    </div>
  </>;
}
