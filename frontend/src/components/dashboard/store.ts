import { create } from "zustand";
import { fetchSummary } from "../../api/client";
import type { Summary } from "../../api/types";

interface DashboardState {
  menuOpen: boolean;
  isCollapsed: boolean;
  summary: Summary | null;
  backendOnline: boolean;
  
  // Actions
  setMenuOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  init: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  menuOpen: false,
  isCollapsed: false,
  summary: null,
  backendOnline: false,

  setMenuOpen: (open) => set({ menuOpen: open }),
  setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

  init: async () => {
    try {
      const summary = await fetchSummary();
      set({ summary, backendOnline: true });
    } catch (e) {
      set({ backendOnline: false });
    }
  },
}));
