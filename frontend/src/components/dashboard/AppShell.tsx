"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import { Category, Hierarchy, ArchiveBook, MessageProgramming, HambergerMenu, StatusUp, Bank, ArrowRight2, ArrowLeft2, CloseCircle } from "iconsax-react";

import { getDashboardNav, ROUTES } from "../../routes";
import { useDashboardStore } from "./store";

// Map route icon strings to Iconsax components
const ICON_MAP: Record<string, React.ReactNode> = {
  space_dashboard: <Category size={18} variant="Linear" color="currentColor" />,
  account_tree: <Hierarchy size={18} variant="Linear" color="currentColor" />,
  terminal: <ArchiveBook size={18} variant="Linear" color="currentColor" />,
  auto_awesome: <MessageProgramming size={18} variant="Linear" color="currentColor" />,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ deal_id?: string }>();
  const dealId = params?.deal_id || "demo";
  const nav = getDashboardNav(dealId);
  const { menuOpen, setMenuOpen, isCollapsed, setIsCollapsed, summary, backendOnline, init } = useDashboardStore();

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <div className={`dashboard-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {menuOpen && <button className="dashboard-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`dashboard-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Dashboard navigation">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex absolute -right-3 top-4 h-6 w-6 items-center justify-center rounded-full border border-outline-dim bg-aegean-surface text-outline hover:text-text-primary hover:bg-bronze hover:text-aegean-dark hover:border-bronze transition-colors z-50">
          {isCollapsed ? <ArrowRight2 size={14} color="currentColor" /> : <ArrowLeft2 size={14} color="currentColor" />}
        </button>
        <div>
          <div className="dashboard-sidebar-brand">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 items-center justify-center rounded-full bg-tertiary"><span className="absolute h-3.5 w-3.5 rounded-full border border-tertiary node-ping" /></span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-on-surface">Enclave 4.2</span>
            </div>
            <span className="rounded border border-accent-border bg-accent-surface px-2 py-0.5 font-mono text-[10px] text-on-surface-variant">{summary ? summary.run_id.slice(0, 6) : "—"}</span>
          </div>
          <div className="px-5 py-4">
            <div className="rounded-lg border border-hairline bg-accent-surface/70 p-3">
              <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider">
                <span className="text-outline">Current Run</span>
                <span className={`flex items-center gap-1 font-semibold ${backendOnline ? "text-tertiary" : "text-terra-light"}`}><span className={`h-1 w-1 rounded-full ${backendOnline ? "bg-tertiary" : "bg-terra-light"}`} /> {backendOnline ? "Online" : "Unavailable"}</span>
              </div>
              <div className="mt-1 truncate font-mono text-[11px] text-on-surface">{summary?.company_name ?? "No deal loaded"}</div>
              <div className="mt-0.5 font-mono text-[10px] text-on-surface-variant/80">{summary ? `${summary.document_count} documents · ${summary.open_issue_count} open issues` : "Connect to view deal status"}</div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
            {nav.map((item) => {
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`dashboard-nav-link ${active ? "is-active" : ""}`}>
                <span className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-[18px] h-[18px]">{ICON_MAP[item.icon] || <StatusUp size={18} variant="Linear" color="currentColor" />}</span>
                  <span className="nav-label">{item.label}</span>
                </span>
                {item.href === ROUTES.queue(dealId) && summary && <span className="nav-badge font-mono text-[10px] text-outline">{summary.open_issue_count}</span>}
              </Link>;
            })}
          </nav>
        </div>
        <div className="border-t border-hairline bg-card-bg p-5 sidebar-footer">
          <div className="flex items-center justify-between"><div><div className="font-mono text-[9px] uppercase tracking-wider text-outline">Data Service</div><div className={`font-mono text-[11px] font-medium ${backendOnline ? "text-tertiary" : "text-terra-light"}`}>{backendOnline ? "Connected" : "Unavailable"}</div></div><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent-border bg-accent-surface text-outline"><StatusUp size={15} variant="Linear" color="currentColor" /></span></div>
        </div>
      </aside>
      <div className="dashboard-frame">
        <header className="dashboard-topbar">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button className="dashboard-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen}><HambergerMenu size={24} variant="Linear" color="currentColor" /></button>
            <div className="flex min-w-0 items-center gap-3"><img src="/logo.png" alt="Logo" className="h-4 w-auto object-contain" /><span className="font-display text-lg font-light tracking-tight text-on-surface">Chrimata</span><span className="hidden h-4 w-px bg-accent-border sm:block" /><span className="hidden truncate font-headline text-lg font-light tracking-tight text-on-surface sm:inline">Institutional Terminal</span></div>
            <div className="hidden items-center gap-2 rounded-full border border-hairline bg-accent-surface/70 px-2.5 py-1 md:flex"><span className={`h-1.5 w-1.5 rounded-full ${backendOnline ? "bg-tertiary" : "bg-terra-light"}`} /><span className="font-mono text-[10px] font-medium tracking-wide text-on-surface-variant">{backendOnline ? "DATA SERVICE CONNECTED" : "DATA SERVICE UNAVAILABLE"}</span></div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-xs font-semibold leading-snug text-on-surface">{summary?.company_name ?? "Chrimata"}</div><div className="font-mono text-[10px] text-on-surface-variant">Diligence Workspace</div></div><span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-border bg-accent-surface text-secondary"><Bank size={17} variant="Linear" color="currentColor" /></span></div>
          </div>
        </header>
        <main id="main-content" className="dashboard-content"><nav aria-label="Breadcrumb" className="dashboard-breadcrumb"><span>Dashboard</span><span aria-hidden="true">/</span><span aria-current="page">{nav.find(item => item.href === pathname)?.label}</span></nav>{children}</main>
      </div>
    </div>
  );
}
