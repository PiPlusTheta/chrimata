"use client";

import { useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Send, Pencil, Check, X, RotateCcw, Square } from "lucide-react";
import {
  fetchSummary,
  fetchIssues,
  createChatSession,
  listChatSessions,
  getChatSession,
  renameChatSession,
  deleteChatSession,
  streamChatMessage,
} from "../../../api/client";
import type { ChatMessage, ChatSession, Summary } from "../../../api/types";
import { Button } from "../../../components/dashboard/ui";
import { MarkdownMessage } from "../../../components/dashboard/MarkdownMessage";

type StreamPhase = "idle" | "searching" | "solving" | "composing";

export default function AskChrimata() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const busy = phase !== "idle";

  useEffect(() => {
    (async () => {
      try {
        const [sum, iss, sessionList] = await Promise.all([
          fetchSummary(), fetchIssues(), listChatSessions(),
        ]);
        setSummary(sum);
        setSuggestions(iss.filter((i) => i.status === "open" || i.status === "reopened").slice(0, 3).map((i) => i.question));
        setSessions(sessionList);
        if (sessionList.length > 0) {
          setActiveId(sessionList[0].id);
          const detail = await getChatSession(sessionList[0].id);
          setMessages(detail.messages);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load conversations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, streamingText]);

  async function refreshSessions() {
    try { setSessions(await listChatSessions()); }
    catch { /* Keep the visible history if refresh fails. */ }
  }

  async function selectSession(id: string) {
    if (busy) return;
    setActiveId(id);
    setMobileNavOpen(false);
    try {
      const detail = await getChatSession(id);
      setMessages(detail.messages);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load conversation.");
    }
  }

  async function handleNewChat() {
    if (busy) return;
    let s: ChatSession;
    try { s = await createChatSession(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create conversation."); return; }
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setMessages([]);
    setQuestion("");
    composerRef.current?.focus();
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try { await deleteChatSession(id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete conversation."); return; }
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    if (activeId === id) {
      if (next.length > 0) selectSession(next[0].id);
      else {
        setActiveId(null);
        setMessages([]);
      }
    }
  }

  function startRename(s: ChatSession, e: React.MouseEvent) {
    e.stopPropagation();
    setRenamingId(s.id);
    setRenameValue(s.title);
  }

  async function commitRename(id: string) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      const updated = await renameChatSession(id, title);
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to rename conversation."); }
  }

  async function send(text: string, regenerate = false) {
    const q = text.trim();
    if (!q || busy) return;
    let sessionId = activeId;
    if (!sessionId) {
      try {
        const created = await createChatSession();
        sessionId = created.id;
        setSessions((prev) => [created, ...prev]);
        setActiveId(created.id);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to create conversation.");
        return;
      }
    }

    setQuestion("");
    setError(null);
    if (!regenerate) setMessages((prev) => [
      ...prev,
      { id: `local_${Date.now()}`, session_id: sessionId, role: "user", text: q, context: [], uncertainties: [], created_at: new Date().toISOString() },
    ]);
    else setMessages((prev) => {
      const lastAgent = prev.findLastIndex((message) => message.role === "agent");
      return lastAgent >= 0 ? prev.filter((_, index) => index !== lastAgent) : prev;
    });
    setStreamingText("");
    setPhase("searching");
    const controller = new AbortController();
    abortRef.current = controller;

    await streamChatMessage(sessionId, q, {
      onState: (state) => setPhase(state),
      onToken: (chunk) => { setPhase("composing"); setStreamingText((prev) => prev + chunk); },
      onDone: (msg) => {
        setMessages((prev) => [...prev.filter((m) => !m.id.startsWith("local_")), msg]);
        setStreamingText("");
        setPhase("idle");
        void refreshSessions();
      },
      onError: (message) => {
        setError(message);
        setStreamingText("");
        setPhase("idle");
        void getChatSession(sessionId).then((detail) => setMessages(detail.messages)).catch(() => {});
      },
    }, controller.signal, regenerate);
    abortRef.current = null;
  }

  function handleStop() {
    abortRef.current?.abort();
    setStreamingText("");
    setPhase("idle");
    if (activeId) void getChatSession(activeId).then((detail) => setMessages(detail.messages)).catch(() => {});
  }

  function handleRegenerate() {
    if (busy) return;
    const latestUser = [...messages].reverse().find((message) => message.role === "user");
    if (latestUser) void send(latestUser.text, true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(question);
    } else if (e.key === "Escape" && busy) {
      handleStop();
    }
  }

  const orbState = phase === "searching" ? "searching" : phase === "solving" ? "solving" : phase === "composing" ? "composing" : "breathing";

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-[var(--dashboard-content-gutter)] -mt-6 -mb-16">
      {/* Session rail */}
      <aside className={`w-72 flex-shrink-0 border-r border-outline-dim bg-aegean-surface/40 flex-col ${mobileNavOpen ? "flex fixed inset-y-16 left-0 z-40 bg-aegean-surface" : "hidden md:flex"}`}>
        <div className="p-4 border-b border-outline-dim">
          <Button variant="primary" onClick={handleNewChat} disabled={busy} className="w-full justify-center">
            <Plus className="h-3.5 w-3.5" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <div key={s.id} role="button" tabIndex={busy ? -1 : 0} aria-label={`Open ${s.title}`} onClick={() => void selectSession(s.id)} onKeyDown={(event) => { if (!busy && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); void selectSession(s.id); } }}
              className={`group/item flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-xs transition-colors ${s.id === activeId ? "bg-accent-surface border border-outline-dim text-text-primary" : "text-on-surface-variant hover:bg-accent-surface/50"}`}>
              {renamingId === s.id ? (
                <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(s.id); if (e.key === "Escape") setRenamingId(null); }}
                    className="dashboard-input flex-1 !py-1 !text-xs" />
                  <button onClick={() => commitRename(s.id)} className="text-tertiary"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setRenamingId(null)} className="text-outline"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{s.title}</div>
                    <div className="text-[10px] text-outline font-mono">{s.message_count} messages</div>
                  </div>
                  <button onClick={(e) => startRename(s, e)} className="opacity-0 group-hover/item:opacity-100 text-outline hover:text-bronze transition-opacity flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => handleDelete(s.id, e)} className="opacity-0 group-hover/item:opacity-100 text-outline hover:text-terra-light transition-opacity flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
          {sessions.length === 0 && <div className="text-xs text-outline text-center py-8">No conversations yet.</div>}
        </div>
      </aside>
      {mobileNavOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileNavOpen(false)} />}

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden p-3 border-b border-outline-dim">
          <Button onClick={() => setMobileNavOpen(true)} className="text-xs">Sessions ({sessions.length})</Button>
        </div>

        {messages.length === 0 && !busy ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <ThinkingOrb state="breathing" size={64} color="#C5A880" />
            <div>
              <h1 className="font-display text-2xl text-text-primary mb-1">Ask Chrimata</h1>
              <p className="text-sm text-on-surface-variant max-w-md">
                {summary ? `Scoped to ${summary.company_name} — ${summary.document_count} documents, ${summary.open_issue_count} open issue${summary.open_issue_count === 1 ? "" : "s"}.` : loading ? "Loading deal context…" : "Deal context unavailable. Try again when the data service is online."}
              </p>
            </div>
            {error && <div role="alert" className="max-w-lg rounded-lg border border-terra-alert/30 bg-terra-alert/10 px-4 py-3 text-xs text-terra-light">{error} <button onClick={() => window.location.reload()} className="ml-2 underline">Retry loading</button></div>}
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 w-full max-w-lg">
                {suggestions.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-left text-xs px-4 py-3 rounded-xl border border-outline-dim bg-aegean-card hover:border-bronze/40 text-on-surface-variant hover:text-text-primary transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
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
                      <ThinkingOrb state={orbState} size={20} color="#C5A880" />
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
                  <button onClick={handleRegenerate} className="flex items-center gap-1 hover:underline flex-shrink-0"><RotateCcw className="w-3 h-3" /> Retry</button>
                </div>
              )}

              {!busy && !error && messages.length > 0 && messages[messages.length - 1].role === "agent" && (
                <button onClick={handleRegenerate} className="flex items-center gap-1.5 text-[11px] text-outline hover:text-bronze transition-colors">
                  <RotateCcw className="w-3 h-3" /> Regenerate
                </button>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-outline-dim p-4">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={composerRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a claim, calculation, or issue… (Enter to send, Shift+Enter for a new line)"
              rows={1}
              className="dashboard-input flex-1 resize-none !py-2.5 max-h-40"
              style={{ minHeight: "2.5rem" }}
            />
            {busy ? (
              <button onClick={handleStop} className="w-10 h-10 rounded-full bg-terra-alert/20 border border-terra-alert/40 hover:bg-terra-alert/30 flex items-center justify-center flex-shrink-0 transition-colors" title="Stop (Esc)">
                <Square className="w-3.5 h-3.5 text-terra-light fill-current" />
              </button>
            ) : (
              <button onClick={() => send(question)} disabled={!question.trim()} className="w-10 h-10 rounded-full bg-bronze hover:bg-bronze-hover disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors">
                <Send className="w-4 h-4 text-aegean-dark ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
