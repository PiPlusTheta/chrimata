/** Canonical product paths. Legacy paths are redirected in next.config.ts. */
export const ROUTES = {
  home: "/",
  queue: "/dashboard/queue",
  diligence: "/dashboard/diligence",
  evidence: "/dashboard/evidence",
  ask: "/dashboard/ask",
} as const;

export const DASHBOARD_NAV = [
  { href: ROUTES.queue, label: "Queue & Intake", icon: "space_dashboard", meta: "14" },
  { href: ROUTES.diligence, label: "Diligence Matrix", icon: "account_tree", meta: "ACT" },
  { href: ROUTES.evidence, label: "Evidence Vault", icon: "terminal", meta: "88 GB" },
  { href: ROUTES.ask, label: "Ask Chrimata", icon: "auto_awesome", meta: "AI" },
] as const;
