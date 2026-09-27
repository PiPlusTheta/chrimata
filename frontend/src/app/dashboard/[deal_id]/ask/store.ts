import { create } from 'zustand';
import {
  fetchSummary,
  fetchIssues,
  createChatSession,
  listChatSessions,
  getChatSession,
  renameChatSession,
  deleteChatSession,
  streamChatMessage,
} from '../../../../api/client';
import type { ChatMessage, ChatSession, Summary } from '../../../../api/types';

export type StreamPhase = "idle" | "searching" | "solving" | "composing";

interface ChatState {
  summary: Summary | null;
  suggestions: string[];
  sessions: ChatSession[];
  activeId: string | null;
  messages: ChatMessage[];
  phase: StreamPhase;
  streamingText: string;
  error: string | null;
  loading: boolean;
  abortController: AbortController | null;

  init: (dealId: string) => Promise<void>;
  refreshSessions: (dealId: string) => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  newChat: (dealId: string) => Promise<string | undefined>;
  deleteChat: (id: string, dealId: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  send: (text: string, dealId: string, regenerate?: boolean) => Promise<void>;
  stop: () => void;
  regenerate: (dealId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  summary: null,
  suggestions: [],
  sessions: [],
  activeId: null,
  messages: [],
  phase: "idle",
  streamingText: "",
  error: null,
  loading: true,
  abortController: null,

  init: async (dealId: string) => {
    try {
      set({ loading: true, error: null });
      const [sum, iss, sessionList] = await Promise.all([
        fetchSummary(dealId),
        fetchIssues(dealId),
        listChatSessions(dealId),
      ]);
      set({
        summary: sum,
        suggestions: iss.filter((i) => i.status === "open" || i.status === "reopened").slice(0, 3).map((i) => i.question),
        sessions: sessionList,
      });
      if (sessionList.length > 0) {
        set({ activeId: sessionList[0].id });
        const detail = await getChatSession(sessionList[0].id);
        set({ messages: detail.messages });
      }
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Unable to load conversations." });
    } finally {
      set({ loading: false });
    }
  },

  refreshSessions: async (dealId: string) => {
    try {
      const sessions = await listChatSessions(dealId);
      set({ sessions });
    } catch {}
  },

  selectSession: async (id: string) => {
    const state = get();
    if (state.phase !== "idle") return;
    set({ activeId: id, error: null });
    try {
      const detail = await getChatSession(id);
      set({ messages: detail.messages });
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Unable to load conversation." });
    }
  },

  newChat: async (dealId: string) => {
    const state = get();
    if (state.phase !== "idle") return;
    try {
      const s = await createChatSession(dealId);
      set({
        sessions: [s, ...state.sessions],
        activeId: s.id,
        messages: [],
        error: null,
      });
      return s.id;
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Unable to create conversation." });
    }
  },

  deleteChat: async (id: string, dealId: string) => {
    try {
      await deleteChatSession(id);
      const state = get();
      const next = state.sessions.filter((s) => s.id !== id);
      set({ sessions: next });
      
      if (state.activeId === id) {
        if (next.length > 0) {
          get().selectSession(next[0].id);
        } else {
          set({ activeId: null, messages: [] });
        }
      }
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Unable to delete conversation." });
    }
  },

  renameChat: async (id: string, title: string) => {
    if (!title.trim()) return;
    try {
      const updated = await renameChatSession(id, title.trim());
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Unable to rename conversation." });
    }
  },

  send: async (text: string, dealId: string, regenerate = false) => {
    const q = text.trim();
    const state = get();
    if (!q || state.phase !== "idle") return;
    
    let sessionId = state.activeId;
    if (!sessionId) {
      try {
        const created = await createChatSession(dealId);
        sessionId = created.id;
        set({
          sessions: [created, ...state.sessions],
          activeId: created.id,
        });
      } catch (cause) {
        set({ error: cause instanceof Error ? cause.message : "Unable to create conversation." });
        return;
      }
    }

    set({ error: null });
    
    if (!regenerate) {
      set((s) => ({
        messages: [
          ...s.messages,
          { id: `local_${Date.now()}`, session_id: sessionId as string, role: "user", text: q, context: [], uncertainties: [], created_at: new Date().toISOString() },
        ],
      }));
    } else {
      set((s) => {
        const lastAgent = s.messages.findLastIndex((m) => m.role === "agent");
        return {
          messages: lastAgent >= 0 ? s.messages.filter((_, idx) => idx !== lastAgent) : s.messages,
        };
      });
    }

    set({ streamingText: "", phase: "searching" });
    const controller = new AbortController();
    set({ abortController: controller });

    await streamChatMessage(sessionId, q, {
      onState: (phase) => set({ phase }),
      onToken: (chunk) => {
        set((s) => ({ phase: "composing", streamingText: s.streamingText + chunk }));
      },
      onDone: (msg) => {
        set((s) => ({
          messages: [...s.messages.filter((m) => !m.id.startsWith("local_")), msg],
          streamingText: "",
          phase: "idle",
        }));
        get().refreshSessions(dealId);
      },
      onError: (err) => {
        set({ error: err, streamingText: "", phase: "idle" });
        if (sessionId) {
          getChatSession(sessionId).then((detail) => set({ messages: detail.messages })).catch(() => {});
        }
      },
    }, controller.signal, regenerate);
    
    set({ abortController: null });
  },

  stop: () => {
    const state = get();
    state.abortController?.abort();
    set({ streamingText: "", phase: "idle" });
    if (state.activeId) {
      getChatSession(state.activeId).then((detail) => set({ messages: detail.messages })).catch(() => {});
    }
  },

  regenerate: (dealId: string) => {
    const state = get();
    if (state.phase !== "idle") return;
    const latestUser = [...state.messages].reverse().find((m) => m.role === "user");
    if (latestUser) {
      get().send(latestUser.text, dealId, true);
    }
  },
}));
