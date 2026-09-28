/** Canonical product paths. Legacy paths are redirected in next.config.ts. */
export const ROUTES = {
  home: "/",
  architecture: "/dashboard/architecture",
  queue: (dealId: string) => `/dashboard/${dealId}/queue`,
  diligence: (dealId: string) => `/dashboard/${dealId}/diligence`,
  evidence: (dealId: string) => `/dashboard/${dealId}/evidence`,
  ask: (dealId: string) => `/dashboard/${dealId}/ask`,
} as const;

export const getDashboardNav = (dealId: string) => [
  { href: ROUTES.queue(dealId), label: "Queue & Intake", icon: "space_dashboard", meta: "14" },
  { href: ROUTES.diligence(dealId), label: "Diligence Matrix", icon: "account_tree", meta: "ACT" },
  { href: ROUTES.evidence(dealId), label: "Evidence Vault", icon: "terminal", meta: "88 GB" },
  { href: ROUTES.ask(dealId), label: "Ask Chrimata", icon: "auto_awesome", meta: "AI" },
];
