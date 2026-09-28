import { create } from "zustand";
import { fetchDeals, fetchSummary } from "../../api/client";
import type { DealSummary, Summary } from "../../api/types";

interface DashboardState {
  menuOpen: boolean;
  isCollapsed: boolean;
  summary: Summary | null;
  backendOnline: boolean;
  deals: DealSummary[];

  // Actions
  setMenuOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  init: (dealId: string) => Promise<void>;
  clearActiveDeal: () => void;
  loadDeals: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  menuOpen: false,
  isCollapsed: false,
  summary: null,
  backendOnline: false,
  deals: [],

  setMenuOpen: (open) => set({ menuOpen: open }),
  setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

  init: async (dealId: string) => {
    try {
      const summary = await fetchSummary(dealId);
      set({ summary, backendOnline: true });
    } catch (e) {
      set({ backendOnline: false });
    }
  },

  // Called when navigating to a route with no active deal (e.g. the /dashboard
  // portfolio picker) so a previously-viewed company's summary doesn't linger
  // in the sidebar/header as if it were still the "active mandate".
  clearActiveDeal: () => set({ summary: null }),

  loadDeals: async () => {
    try {
      const deals = await fetchDeals();
      set({ deals });
    } catch (e) {
      // Non-fatal: the switcher just won't show other companies this load.
    }
  },
}));
