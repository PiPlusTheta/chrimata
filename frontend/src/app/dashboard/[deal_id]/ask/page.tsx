"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingOrb } from "thinking-orbs";
import { Add, Trash, Send2, Edit2, TickSquare, CloseSquare, Refresh2, Stop } from "iconsax-react";
import { useChatStore } from "./store";
import { Button } from "../../../../components/dashboard/ui";
import { MarkdownMessage } from "../../../../components/dashboard/MarkdownMessage";

import { useParams } from "next/navigation";

export default function AskChrimata() {
  const params = useParams<{ deal_id?: string }>();
  const dealId = params?.deal_id || "northstar";
  const {
    summary,
    suggestions,
    sessions,
    activeId,
    messages,
    phase,
    streamingText,
    error,
    loading,
    init,
    selectSession,
    newChat,
    deleteChat,
    renameChat,
    send,
    stop,
    regenerate,
  } = useChatStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const busy = phase !== "idle";

  useEffect(() => {
    void init(dealId);
  }, [dealId, init]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, streamingText]);

  async function handleNewChat() {
    await newChat(dealId);
    setQuestion("");
    composerRef.current?.focus();
  }

  function startRename(s: any, e: React.MouseEvent) {
    e.stopPropagation();
    setRenamingId(s.id);
    setRenameValue(s.title);
  }

  async function commitRename(id: string) {
    await renameChat(id, renameValue);
    setRenamingId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(question, dealId);
      setQuestion("");
    } else if (e.key === "Escape" && busy) {
      stop();
    }
  }

  const orbState = phase === "searching" ? "searching" : phase === "solving" ? "solving" : phase === "composing" ? "composing" : "breathing";

  return (
    <div className="flex h-[calc(100vh-140px)] -mx-[var(--dashboard-content-gutter)] -mb-16 border-t border-outline-dim/40 relative">
      {/* Session rail */}
      <aside className={`w-72 flex-shrink-0 border-r border-outline-dim bg-aegean-surface/40 flex-col ${mobileNavOpen ? "flex absolute inset-y-0 left-0 z-40 bg-aegean-surface" : "hidden md:flex"}`}>
        <div className="p-4 border-b border-outline-dim">
          <Button variant="primary" onClick={handleNewChat} disabled={busy} className="w-full justify-center">
            <Add size={16} className="mr-1" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <div key={s.id} role="button" tabIndex={busy ? -1 : 0} aria-label={`Open ${s.title}`} 
              onClick={() => { selectSession(s.id); setMobileNavOpen(false); }} 
              onKeyDown={(event) => { if (!busy && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); selectSession(s.id); setMobileNavOpen(false); } }}
              className={`group/item flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-xs transition-colors ${s.id === activeId ? "bg-accent-surface border border-outline-dim text-text-primary" : "text-on-surface-variant hover:bg-accent-surface/50"}`}>
              {renamingId === s.id ? (
                <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(s.id); if (e.key === "Escape") setRenamingId(null); }}
                    className="dashboard-input flex-1 !py-1 !text-xs" />
                  <button onClick={() => commitRename(s.id)} className="text-tertiary"><TickSquare size={16} /></button>
                  <button onClick={() => setRenamingId(null)} className="text-outline"><CloseSquare size={16} /></button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{s.title}</div>
                    <div className="text-[10px] text-outline font-mono">{s.message_count} messages</div>
                  </div>
                  <button onClick={(e) => startRename(s, e)} className="opacity-0 group-hover/item:opacity-100 text-outline hover:text-bronze transition-opacity flex-shrink-0">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteChat(s.id, dealId); }} className="opacity-0 group-hover/item:opacity-100 text-outline hover:text-terra-light transition-opacity flex-shrink-0">
                    <Trash size={16} />
                  </button>
                </>
              )}
            </div>
          ))}
          {sessions.length === 0 && !loading && <div className="text-xs text-outline text-center py-8">No conversations yet.</div>}
          {loading && <div className="text-[11px] font-mono text-outline uppercase tracking-wider text-center py-8">Loading history...</div>}
        </div>
      </aside>
      {mobileNavOpen && <div className="absolute inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileNavOpen(false)} />}

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="md:hidden p-3 border-b border-outline-dim">
          <Button onClick={() => setMobileNavOpen(true)} className="text-xs">Sessions ({sessions.length})</Button>
        </div>

        {messages.length === 0 && !busy && !streamingText ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center overflow-y-auto">
            <div className="relative flex items-center justify-center" style={{ transform: "scale(1.5)" }}>
              <div className="absolute inset-0 -m-6 rounded-full bg-bronze/10 blur-2xl" />
              <div className="absolute inset-0 -m-2 rounded-full border border-bronze/15" />
              <ThinkingOrb state="connecting" size={64} color="#C5A880" dots={1.35} dotSize={1.15} gravity />
            </div>
            <div className="mt-4">
              <h1 className="font-display text-2xl text-text-primary mb-1">Ask Chrimata</h1>
              <p className="text-sm text-on-surface-variant max-w-md">
                {summary ? `Scoped to ${summary.company_name} — ${summary.document_count} documents, ${summary.open_issue_count} open issue${summary.open_issue_count === 1 ? "" : "s"}.` : "Initialize a query against the deterministic ledger."}
              </p>
            </div>
            {error && <div role="alert" className="max-w-lg rounded-lg border border-terra-alert/30 bg-terra-alert/10 px-4 py-3 text-xs text-terra-light">{error} <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button></div>}
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-lg mt-4">
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => { setQuestion(""); send(q, dealId); }}
                    className="text-left text-xs px-4 py-3 rounded-xl border border-outline-dim bg-aegean-card hover:border-bronze/40 text-on-surface-variant hover:text-text-primary transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${msg.role === "user" ? "" : "w-full"}`}>
                      {msg.role === "user"
                        ? <div className="bg-bronze text-aegean-dark rounded-2xl rounded-br-sm px-4 py-2.5 text-sm whitespace-pre-wrap">{msg.text}</div>
                        : <MarkdownMessage text={msg.text} />}
                      {msg.role === "agent" && <div className="mt-2 font-mono text-[10px] uppercase tracking-wide text-outline">AI interpretation · verify against cited source documents</div>}
                      {msg.role === "agent" && msg.context && msg.context.length > 0 && <details className="mt-3 rounded-lg border border-tertiary/20 bg-tertiary/5 p-3 text-xs text-on-surface-variant"><summary className="cursor-pointer font-mono text-[10px] uppercase text-tertiary">Retrieved analyst memory ({msg.context.length})</summary><div className="mt-2 space-y-2">{msg.context.map((context, index) => <div key={index}>{context.summary}{context.source_ids.length > 0 && <div className="font-mono text-[10px] text-outline">Sources: {context.source_ids.join(", ")}</div>}</div>)}</div></details>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {busy && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <ThinkingOrb state={orbState} size={20} color="#C5A880" dots={1.25} />
                      <span className="text-[11px] text-outline font-mono uppercase tracking-wide">
                        {phase === "searching" ? "Retrieving evidence and memory…" : phase === "solving" ? "Reasoning over the deal…" : "Composing answer…"}
                      </span>
                    </div>
                    {streamingText && <MarkdownMessage text={streamingText} />}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-between gap-3 text-xs text-terra-light bg-terra-alert/10 border border-terra-alert/25 rounded-lg px-4 py-3">
                  <span>{error}</span>
                  <button onClick={() => regenerate(dealId)} className="flex items-center gap-1 hover:underline flex-shrink-0"><Refresh2 size={14} /> Retry</button>
                </div>
              )}

              {!busy && !error && messages.length > 0 && messages[messages.length - 1].role === "agent" && (
                <button onClick={() => regenerate(dealId)} className="flex items-center gap-1.5 text-[11px] text-outline hover:text-bronze transition-colors">
                  <Refresh2 size={14} /> Regenerate
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-outline-dim p-4 bg-aegean-dark flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-end gap-2 relative">
            <textarea
              ref={composerRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a claim, calculation, or issue… (Enter to send, Shift+Enter for a new line)"
              rows={1}
              className="dashboard-input flex-1 resize-none !py-2.5 max-h-40 bg-aegean-surface/50"
              style={{ minHeight: "2.5rem" }}
            />
            {busy ? (
              <button onClick={stop} className="w-10 h-10 rounded-full bg-terra-alert/20 border border-terra-alert/40 hover:bg-terra-alert/30 flex items-center justify-center flex-shrink-0 transition-colors" title="Stop (Esc)">
                <Stop size={18} className="text-terra-light" variant="Bold" />
              </button>
            ) : (
              <button onClick={() => { send(question, dealId); setQuestion(""); }} disabled={!question.trim()} className="w-10 h-10 rounded-full bg-bronze hover:bg-bronze-hover disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors">
                <Send2 size={18} className="text-aegean-dark ml-0.5" variant="Bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
