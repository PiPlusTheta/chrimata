"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSummary } from "../../api/client";

export default function DashboardQueue() {
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => { fetchSummary().then(setSummary).catch(() => {}); }, []);

  const formatPaise = (paise?: number) => {
    if (!paise) return "n/a";
    if (paise >= 1000000000) return `₹${(paise / 1000000000).toFixed(2)} Cr`;
    if (paise >= 10000000) return `₹${(paise / 10000000).toFixed(2)} L`;
    return `₹${(paise / 100).toFixed(0)}`;
  };
  const arrMetric = summary?.metrics?.find((m: any) => m.id === "calc-live-arr-apr");
  const runwayMetric = summary?.metrics?.find((m: any) => m.id === "calc-runway-base");

  return (
    <>
{/*  Institutional Review Queue & Diligence Registry  */}




{/*  COLLAPSIBLE / SLEEK NAVIGATION SIDEBAR  */}
<aside className="fixed left-0 top-0 h-full w-64 bg-card-bg/90 backdrop-blur-xl z-50 flex flex-col justify-between border-r border-accent-border">
<div className="flex flex-col">
{/*  Brand & Security Identifier  */}
<div className="h-16 px-6 flex items-center justify-between border-b border-hairline">
<div className="flex items-center gap-2.5">
<div className="relative flex items-center justify-center">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="absolute w-3.5 h-3.5 rounded-full border border-tertiary node-ping"></span>
</div>
<span className="font-mono text-[11px] font-semibold text-on-surface tracking-wider uppercase">Enclave 4.2</span>
</div>
<span className="font-mono text-[10px] text-on-surface-variant px-2 py-0.5 rounded bg-accent-surface border border-accent-border">
          TX: 809F
        </span>
</div>
{/*  Trust State Micro-Pill  */}
<div className="px-5 py-4">
<div className="bg-accent-surface/70 rounded-lg p-3 border border-hairline hover:border-hairline-light transition-colors">
<div className="flex items-center justify-between">
<span className="font-mono text-[9px] uppercase tracking-wider text-outline">Session Verification</span>
<span className="font-mono text-[9px] text-tertiary font-semibold flex items-center gap-1">
<span className="w-1 h-1 rounded-full bg-tertiary"></span> ACTIVE
            </span>
</div>
<div className="font-mono text-[11px] text-on-surface mt-1 truncate">RUN_10 • ZERO_FAULT</div>
<div className="font-mono text-[10px] text-on-surface-variant/80 mt-0.5">0x8F92 • B314</div>
</div>
</div>
{/*  Navigation Links  */}
<nav className="flex flex-col gap-1 px-3 mt-1">
<a className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-accent-border/60 text-secondary border border-secondary/20 font-medium text-xs transition-all shadow-sm" href="/dashboard">
<span className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px]">space_dashboard</span>
<span>Queue &amp; Intake</span>
</span>
<span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-secondary/10 text-secondary">14</span>
</a>
<a className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-accent-surface/60 hover:text-on-surface text-xs transition-all" href="/dashboard/workspace">
<span className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] opacity-70">account_tree</span>
<span>Diligence Matrix</span>
</span>
<span className="font-mono text-[10px] text-tertiary">ACT</span>
</a>
<a className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-accent-surface/60 hover:text-on-surface text-xs transition-all" href="/dashboard/ingest">
<span className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] opacity-70">terminal</span>
<span>Evidence Vault</span>
</span>
<span className="font-mono text-[11px] text-outline">88 GB</span>
</a>
<a className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-accent-surface/60 hover:text-on-surface text-xs transition-all" href="#">
<span className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] opacity-70">menu_book</span>
<span>IC Prospectus</span>
</span>
<span className="font-mono text-[10px] text-secondary/80">PR-09</span>
</a>
<a className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-accent-surface/60 hover:text-on-surface text-xs transition-all" href="#">
<span className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-[18px] opacity-70">verified</span>
<span>Cryptographic Audits</span>
</span>
<span className="font-mono text-[11px] text-tertiary">99.98%</span>
</a>
</nav>
</div>
{/*  Sidebar Bottom Status  */}
<div className="p-5 border-t border-hairline bg-card-bg">
<div className="flex items-center justify-between">
<div>
<div className="font-mono text-[9px] uppercase tracking-wider text-outline">Enclave Integrity</div>
<div className="font-mono text-[11px] text-tertiary font-medium">HSM Zurich Online</div>
</div>
<div className="w-7 h-7 rounded-lg bg-accent-surface border border-accent-border flex items-center justify-center text-outline">
<span className="material-symbols-outlined text-[15px]">lock</span>
</div>
</div>
</div>
</aside>
{/*  MAIN VIEWPORT CONTAINER  */}
<div className="pl-64">
{/*  SLEEK GLASS TOPBAR  */}
<header className="fixed top-0 left-64 right-0 h-16 bg-root-bg/80 backdrop-blur-md z-40 border-b border-hairline flex items-center justify-between px-8">
<div className="flex items-center gap-4">
<div className="flex items-center gap-3">
<span className="font-display text-lg tracking-tight text-on-surface font-light">Chrimata</span>
<span className="h-4 w-[1px] bg-accent-border hidden sm:block"></span>
<span className="font-headline text-lg tracking-tight text-on-surface font-light hidden lg:inline">Institutional Terminal</span>
</div>
<div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-surface/70 border border-hairline">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="font-mono text-[10px] text-on-surface-variant font-medium tracking-wide">SECURE ENCLAVE ACTIVE</span>
</div>
</div>
<div className="flex items-center gap-6">
{/*  Global Clock Synchronizer  */}
<div className="hidden xl:flex items-center gap-4 font-mono text-xs text-on-surface-variant pr-4 border-r border-hairline">
<div className="flex items-center gap-1.5">
<span className="text-outline text-[10px]">UTC</span>
<span className="text-on-surface tabular-nums">14:32:08</span>
</div>
<div className="flex items-center gap-1.5">
<span className="text-outline text-[10px]">EST</span>
<span className="text-on-surface tabular-nums">09:32:08</span>
</div>
</div>
{/*  User Identity Profile  */}
<div className="flex items-center gap-3">
<div className="text-right hidden sm:block">
<div className="text-xs font-semibold text-on-surface leading-snug">E. Vane-Tempest</div>
<div className="font-mono text-[10px] text-on-surface-variant">Lead Diligence Partner</div>
</div>
<div className="w-8 h-8 rounded-full bg-accent-surface border border-accent-border flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[17px]">shield_person</span>
</div>
</div>
</div>
</header>
{/*  MAIN SCROLLABLE WORKSPACE  */}
<main className="pt-20 px-8 pb-16 max-w-[1600px] mx-auto space-y-7">
{/*  ELEVATED HEADER: HERO TITLE & QUICK COMMAND ACTIONS  */}
<section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-hairline">
<div className="space-y-1.5">
<div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-outline">
<span>Portfolio Review Ledger</span>
<span className="text-accent-border">/</span>
<span className="text-tertiary">Cryptographic Integrity Level 4</span>
</div>
<h1 className="font-headline text-3xl md:text-4xl text-on-surface font-light tracking-tight">
            Institutional Review Queue &amp; Diligence Registry
          </h1>
<p className="text-xs md:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            High-assurance deal evaluation terminal. Real-time reconciliation proofs, cap-table verification states, and automated anomaly alerts across active mandates.
          </p>
</div>
<div className="flex items-center gap-2.5 flex-wrap">
<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-bg border border-hairline font-mono text-xs">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="text-on-surface-variant">Auto-Ingest:</span>
<span className="text-on-surface font-medium">Active (28ms)</span>
</div>
<button className="px-4 py-2 rounded-lg bg-secondary text-secondary-dark font-medium text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
<span className="material-symbols-outlined text-[15px]">add_circle</span>
<span>Register Mandate</span>
</button>
<button className="px-3.5 py-2 rounded-lg bg-card-bg border border-hairline hover:border-hairline-light text-on-surface font-mono text-xs transition-all flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-outline">download</span>
<span>Export CSV</span>
</button>
</div>
</section>
{/*  4 TOP POLISHED METRIC CARDS WITH ARCHITECTURAL STEPPING  */}
<section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
{/*  METRIC 1  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 flex flex-col justify-between hover:border-hairline-light transition-all shadow-sm relative overflow-hidden group">
<div className="flex items-center justify-between text-outline">
<span className="font-mono text-[10px] uppercase tracking-wider">Documents on Record</span>
<span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">folder_special</span>
</div>
<div className="my-4 flex items-baseline justify-between">
<span className="font-headline text-4xl text-on-surface font-light">{summary?.document_count ?? "—"}</span>
<span className="font-mono text-[10px] text-tertiary px-2 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20">
              LIVE
            </span>
</div>
<div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-on-surface-variant">
<span className="flex items-center gap-1 text-tertiary font-mono text-[11px]">
<span className="material-symbols-outlined text-[13px]">description</span> Northstar Ops
            </span>
<span className="font-mono text-[11px] text-outline">Single active deal</span>
</div>
</div>
{/*  METRIC 2  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 flex flex-col justify-between hover:border-hairline-light transition-all shadow-sm relative overflow-hidden group">
<div className="flex items-center justify-between text-outline">
<span className="font-mono text-[10px] uppercase tracking-wider">Open Issues</span>
<span className="material-symbols-outlined text-[18px] text-error group-hover:scale-110 transition-transform">warning</span>
</div>
<div className="my-4 flex items-baseline justify-between">
<div className="flex items-baseline gap-2">
<span className="font-headline text-4xl text-error font-light">{summary?.open_issue_count ?? "—"}</span>
<span className="font-mono text-xs text-outline">flagged</span>
</div>
<span className="font-mono text-[10px] text-error px-2 py-0.5 rounded-full bg-error-dark border border-error/30 uppercase font-semibold">
              LIVE
            </span>
</div>
<div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-on-surface-variant">
<span className="text-error font-mono text-[11px] flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">gavel</span> Forensic review
            </span>
<span className="font-mono text-[11px] text-outline">Northstar Ops</span>
</div>
</div>
{/*  METRIC 3  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 flex flex-col justify-between hover:border-hairline-light transition-all shadow-sm relative overflow-hidden group">
<div className="flex items-center justify-between text-outline">
<span className="font-mono text-[10px] uppercase tracking-wider">Live Annualised ARR</span>
<span className="material-symbols-outlined text-[18px] text-secondary group-hover:scale-110 transition-transform">account_balance</span>
</div>
<div className="my-4 flex items-baseline justify-between">
<span className="font-headline text-4xl text-secondary font-light">{formatPaise(arrMetric?.amount_paise)}</span>
<span className="font-mono text-[10px] text-on-surface-variant px-2 py-0.5 rounded-full bg-accent-surface border border-hairline">
              {arrMetric?.status ?? "—"}
            </span>
</div>
<div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-on-surface-variant">
<span className="font-mono text-[11px] text-outline">active_mrr × 12</span>
<span className="font-mono text-[11px] text-on-surface">April ledger</span>
</div>
</div>
{/*  METRIC 4  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 flex flex-col justify-between hover:border-hairline-light transition-all shadow-sm relative overflow-hidden group">
<div className="flex items-center justify-between text-outline">
<span className="font-mono text-[10px] uppercase tracking-wider">Cash Runway</span>
<span className="material-symbols-outlined text-[18px] text-tertiary group-hover:scale-110 transition-transform">bolt</span>
</div>
<div className="my-4 flex items-baseline justify-between">
<div className="flex items-baseline gap-1">
<span className="font-headline text-4xl text-tertiary font-light">{runwayMetric?.months ?? "—"}</span>
<span className="font-mono text-xs text-tertiary">mo</span>
</div>
<span className="font-mono text-[10px] text-tertiary px-2 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20">
              {runwayMetric?.status ?? "—"}
            </span>
</div>
<div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-on-surface-variant">
<span className="font-mono text-[11px] text-tertiary">cash / monthly_net_burn</span>
<span className="font-mono text-[11px] text-outline">Constant burn</span>
</div>
</div>
</section>
{/*  NEW: ANIMATED ASSETS CONTAINER - VECTOR TELEMETRY & DISCREPANCY TRAJECTORY  */}
<section className="bg-card-bg rounded-xl border border-hairline p-6 relative overflow-hidden shadow-md">
{/*  Subtle Background Glow  */}
<div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
<div>
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary telemetry-glow"></span>
<h2 className="font-headline text-xl text-on-surface font-light">Real-Time Diligence &amp; Discrepancy Trajectory</h2>
<span className="font-mono text-[9px] px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/30 uppercase">Live Telemetry</span>
</div>
<p className="font-mono text-[11px] text-on-surface-variant mt-0.5">Continuous multi-node hash validation against secondary syndicates</p>
</div>
<div className="flex items-center gap-4 font-mono text-[11px]">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-0.5 bg-tertiary inline-block"></span>
<span>Reconciled Proofs</span>
</div>
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-0.5 bg-error inline-block"></span>
<span>Discrepancy Drift</span>
</div>
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-0.5 border-t border-dashed border-secondary inline-block"></span>
<span>Benchmark Trend</span>
</div>
</div>
</div>
{/*  Animated SVG Trajectory Canvas  */}
<div className="relative w-full h-44 mt-4 select-none">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 160">
<defs>
<linearGradient id="gradientVerified" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#9DD3AA" stopOpacity="0.25" />
<stop offset="100%" stopColor="#9DD3AA" stopOpacity="0" />
</linearGradient>
<linearGradient id="gradientError" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#FF8E85" stopOpacity="0.2" />
<stop offset="100%" stopColor="#FF8E85" stopOpacity="0" />
</linearGradient>
</defs>
{/*  Grid Lines  */}
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="1000" y1="40" y2="40" />
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="1000" y1="80" y2="80" />
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="1000" y1="120" y2="120" />
{/*  Area fills  */}
<path d="M 0 140 Q 150 110, 300 120 T 600 60 T 850 40 L 1000 30 L 1000 160 L 0 160 Z" fill="url(#gradientVerified)" />
<path d="M 0 150 Q 200 145, 400 135 T 750 125 L 1000 115 L 1000 160 L 0 160 Z" fill="url(#gradientError)" />
{/*  Trajectory Line 1 (Reconciled Proofs - Tertiary)  */}
<path className="animate-dash-flow" d="M 0 140 Q 150 110, 300 120 T 600 60 T 850 40 L 1000 30" fill="none" stroke="#9DD3AA" strokeLinecap="round" strokeWidth="2.5" />
{/*  Trajectory Line 2 (Drift - Error)  */}
<path d="M 0 150 Q 200 145, 400 135 T 750 125 L 1000 115" fill="none" stroke="#FF8E85" strokeDasharray="4 4" strokeWidth="1.8" />
{/*  Benchmark Target Curve (Secondary)  */}
<path d="M 0 130 C 250 100, 550 70, 1000 45" fill="none" stroke="#E0C298" strokeDasharray="2 3" strokeWidth="1.5" />
{/*  Pulsing Verification Nodes  */}
<g transform="translate(300, 120)">
<circle cx="0" cy="0" fill="#9DD3AA" r="4" />
<circle className="node-ping" cx="0" cy="0" fill="none" r="9" stroke="#9DD3AA" strokeWidth="1.5" />
</g>
<g transform="translate(600, 60)">
<circle cx="0" cy="0" fill="#9DD3AA" r="4" />
<circle className="node-ping" cx="0" cy="0" fill="none" r="9" stroke="#9DD3AA" strokeWidth="1.5" />
</g>
<g transform="translate(850, 40)">
<circle cx="0" cy="0" fill="#E0C298" r="4.5" />
<circle className="node-ping" cx="0" cy="0" fill="none" r="10" stroke="#E0C298" strokeWidth="1.5" />
</g>
<g transform="translate(750, 125)">
<circle cx="0" cy="0" fill="#FF8E85" r="4" />
<circle className="node-ping" cx="0" cy="0" fill="none" r="8" stroke="#FF8E85" strokeWidth="1.5" />
</g>
</svg>
{/*  Scanning Light Sweep  */}
<div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent scanner-sweep pointer-events-none"></div>
</div>
{/*  Telemetry Bottom Micro-Bar  */}
<div className="mt-2 pt-3 border-t border-hairline flex flex-wrap items-center justify-between text-xs font-mono text-on-surface-variant gap-3">
<div className="flex items-center gap-6">
<span>Enclave Verification Hash: <span className="text-tertiary">0x8F92...B314 (SHA-256)</span></span>
<span>Sync Latency: <span className="text-on-surface font-semibold">18.4ms</span></span>
</div>
<div className="flex items-center gap-4">
<span className="text-outline">Active Validators: <span className="text-on-surface">32 Nodes</span></span>
<span className="text-tertiary flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[13px]">check_circle</span>
              All Quorums Reached
            </span>
</div>
</div>
</section>
{/*  CLEAN FILTER RAIL & SEARCH  */}
<section className="bg-card-bg rounded-xl border border-hairline p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
<div className="flex items-center flex-wrap gap-2.5">
<div className="flex items-center gap-1.5 pl-2 text-outline font-mono text-[11px] uppercase tracking-wider pr-2 border-r border-hairline">
<span className="material-symbols-outlined text-[15px]">filter_alt</span>
<span>Filter:</span>
</div>
{/*  Stage Filter  */}
<div className="flex items-center bg-accent-surface/70 rounded-lg border border-hairline px-3 py-1.5 text-xs">
<span className="font-mono text-[10px] text-outline mr-2 uppercase">Stage</span>
<select className="bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer pr-1" id="filter-stage">
<option className="bg-card-bg" defaultValue="all">All Stages</option>
<option className="bg-card-bg" defaultValue="seed">Seed Ext</option>
<option className="bg-card-bg" defaultValue="series-a">Series A</option>
<option className="bg-card-bg" defaultValue="series-b">Series B</option>
<option className="bg-card-bg" defaultValue="pre-ipo">Pre-IPO</option>
</select>
</div>
{/*  Sector Filter  */}
<div className="flex items-center bg-accent-surface/70 rounded-lg border border-hairline px-3 py-1.5 text-xs">
<span className="font-mono text-[10px] text-outline mr-2 uppercase">Sector</span>
<select className="bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer pr-1" id="filter-sector">
<option className="bg-card-bg" defaultValue="all">All Sectors</option>
<option className="bg-card-bg" defaultValue="saas">Enterprise SaaS</option>
<option className="bg-card-bg" defaultValue="bio">Biotech / Genomics</option>
<option className="bg-card-bg" defaultValue="logistics">Autonomous Logistics</option>
<option className="bg-card-bg" defaultValue="fin">Trade Infrastructure</option>
<option className="bg-card-bg" defaultValue="semi">Semiconductor AI</option>
</select>
</div>
{/*  Partner Filter  */}
<div className="flex items-center bg-accent-surface/70 rounded-lg border border-hairline px-3 py-1.5 text-xs">
<span className="font-mono text-[10px] text-outline mr-2 uppercase">Partner</span>
<select className="bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer pr-1" id="filter-partner">
<option className="bg-card-bg" defaultValue="all">All Partners</option>
<option className="bg-card-bg" defaultValue="sarah">Sarah Jenkins</option>
<option className="bg-card-bg" defaultValue="david">David Chen</option>
<option className="bg-card-bg" defaultValue="marcus">Marcus Vance</option>
<option className="bg-card-bg" defaultValue="elena">Elena Rostova</option>
</select>
</div>
{/*  Veracity Filter  */}
<div className="flex items-center bg-accent-surface/70 rounded-lg border border-hairline px-3 py-1.5 text-xs">
<span className="font-mono text-[10px] text-outline mr-2 uppercase">Veracity</span>
<select className="bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer pr-1" id="filter-veracity">
<option className="bg-card-bg" defaultValue="all">All States</option>
<option className="bg-card-bg" defaultValue="verified">Verified (&gt;85%)</option>
<option className="bg-card-bg" defaultValue="pending">Pending (70-84%)</option>
<option className="bg-card-bg" defaultValue="alert">Alert (&lt;70%)</option>
</select>
</div>
</div>
{/*  Grep Search  */}
<div className="flex items-center bg-accent-surface/80 rounded-lg border border-hairline hover:border-hairline-light px-3 py-1.5 min-w-[260px] transition-colors">
<span className="font-mono text-xs text-outline mr-2">grep:</span>
<input className="w-full bg-transparent font-mono text-xs text-on-surface placeholder:text-outline/70 focus:outline-none" id="deal-search-input" placeholder="deal, tax id, counterparty..." type="text"/>
<span className="material-symbols-outlined text-[16px] text-outline">search</span>
</div>
</section>
{/*  DUAL WORKSPACE: MAIN WORKSHEET (COL 8) & REAL-TIME ALERTS / CHRONO FEED (COL 4)  */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
{/*  LEFT COMPARTMENT: MANDATE WORKSHEET TABLE (COL 8)  */}
<div className="xl:col-span-8 flex flex-col bg-card-bg rounded-xl border border-hairline overflow-hidden shadow-sm">
{/*  Table Controls Header  */}
<div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between flex-wrap gap-2">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-secondary"></div>
<span className="font-mono text-xs font-medium text-on-surface uppercase tracking-wider">Mandate Verification Worksheet</span>
<span className="font-mono text-[10px] text-tertiary px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20">
                STRICT ENCLAVE
              </span>
</div>
<div className="flex items-center gap-4 font-mono text-xs text-outline">
<span>Displaying 5 of 14</span>
<div className="flex items-center gap-1.5">
<button className="w-7 h-7 rounded bg-accent-surface border border-hairline hover:border-hairline-light text-on-surface flex items-center justify-center transition-colors" title="Compact view">
<span className="material-symbols-outlined text-[15px]">density_small</span>
</button>
<button className="w-7 h-7 rounded bg-accent-surface border border-hairline hover:border-hairline-light text-on-surface flex items-center justify-center transition-colors" title="Column customization">
<span className="material-symbols-outlined text-[15px]">view_column</span>
</button>
</div>
</div>
</div>
{/*  Spacious, High-Legibility Data Table  */}
<div className="overflow-x-auto w-full">
<table className="w-full border-collapse text-left whitespace-nowrap">
<thead>
<tr className="border-b border-hairline text-outline font-mono text-[10px] uppercase tracking-wider bg-accent-surface/30">
<th className="py-3 px-4 w-10 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</th>
<th className="py-3 px-4 font-medium text-on-surface">Company</th>
<th className="py-3 px-4 font-medium">Sector</th>
<th className="py-3 px-4 font-medium">Stage</th>
<th className="py-3 px-4 font-medium">Lead Partner</th>
<th className="py-3 px-4 font-medium text-right">Veracity</th>
<th className="py-3 px-4 font-medium">Discrepancies</th>
<th className="py-3 px-4 font-medium">Evidence Health</th>
<th className="py-3 px-4 font-medium text-right">Target Close</th>
<th className="py-3 px-4 font-medium text-center">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-hairline font-mono text-xs">
{/*  ROW 1: NORTHSTAR OPS (ALERT)  */}
<tr className="hover:bg-accent-surface/50 transition-colors cursor-pointer deal-row" data-company="Northstar Ops">
<td className="py-3.5 px-4 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="font-body font-semibold text-on-surface text-sm flex items-center gap-2">
<span>Northstar Ops</span>
<span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-accent-surface border border-hairline">NS-A</span>
</div>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface-variant">Enterprise B2B SaaS</td>
<td className="py-3.5 px-4">
<span className="px-2 py-0.5 rounded bg-accent-surface border border-hairline text-[11px] text-on-surface">Series A</span>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface">Sarah Jenkins</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error-dark border border-error/30 text-error text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-error status-pulse"></span> {(summary?.open_issue_count ?? 0) > 0 ? "ALERT" : "CLEAR"}
                    </span>
</td>
<td className="py-3.5 px-4 text-error">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">flag</span>
<span>{summary?.open_issue_count ?? "—"} Unresolved</span>
</span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className="w-20 h-1.5 rounded-full bg-accent-surface overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ width: "100%" }}></div>
</div>
<span className="text-[11px] text-on-surface-variant">{summary?.document_count ?? "—"} Docs</span>
</div>
</td>
<td className="py-3.5 px-4 text-right text-on-surface-variant">2026-08-15</td>
<td className="py-3.5 px-4 text-center">
<a href="/dashboard/workspace" className="px-2.5 py-1 rounded bg-accent-surface hover:bg-secondary hover:text-secondary-dark text-on-surface font-body text-xs transition-colors inline-flex items-center gap-1">
<span>Workspace</span>
<span className="material-symbols-outlined text-[13px]">arrow_forward</span>
</a>
</td>
</tr>
{/*  ROW 2: KINETIX BIO (VERIFIED)  */}
<tr className="opacity-40 grayscale-[0.4] pointer-events-none deal-row" data-company="Kinetix Bio" aria-disabled="true">
<td className="py-3.5 px-4 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="font-body font-semibold text-on-surface text-sm flex items-center gap-2">
<span>Kinetix Bio</span><span className="font-mono text-[8px] px-1 py-0.5 rounded bg-outline/20 text-outline uppercase tracking-wide">Illustrative</span>
<span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-accent-surface border border-hairline">KB-S</span>
</div>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface-variant">Biotech / Genomics</td>
<td className="py-3.5 px-4">
<span className="px-2 py-0.5 rounded bg-accent-surface border border-hairline text-[11px] text-on-surface">Seed Ext</span>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface">David Chen</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-dark border border-tertiary/30 text-tertiary text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 94% VERIFIED
                    </span>
</td>
<td className="py-3.5 px-4 text-tertiary">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span>0 Active</span>
</span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className="w-20 h-1.5 rounded-full bg-accent-surface overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{ width: "92%" }}></div>
</div>
<span className="text-[11px] text-on-surface-variant">28 Docs</span>
</div>
</td>
<td className="py-3.5 px-4 text-right text-on-surface-variant">2026-08-01</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 rounded bg-accent-surface hover:border-secondary text-secondary font-body text-xs transition-colors inline-flex items-center gap-1 border border-hairline">
<span>Report</span>
<span className="material-symbols-outlined text-[13px]">description</span>
</button>
</td>
</tr>
{/*  ROW 3: AETHER ROBOTICS (PENDING)  */}
<tr className="opacity-40 grayscale-[0.4] pointer-events-none deal-row" data-company="Aether Robotics" aria-disabled="true">
<td className="py-3.5 px-4 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="font-body font-semibold text-on-surface text-sm flex items-center gap-2">
<span>Aether Robotics</span><span className="font-mono text-[8px] px-1 py-0.5 rounded bg-outline/20 text-outline uppercase tracking-wide">Illustrative</span>
<span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-accent-surface border border-hairline">AR-B</span>
</div>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface-variant">Autonomous Logistics</td>
<td className="py-3.5 px-4">
<span className="px-2 py-0.5 rounded bg-accent-surface border border-hairline text-[11px] text-on-surface">Series B</span>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface">Marcus Vance</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-dark border border-secondary/30 text-secondary text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 79% PENDING
                    </span>
</td>
<td className="py-3.5 px-4 text-secondary">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">help</span>
<span>1 Minor</span>
</span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className="w-20 h-1.5 rounded-full bg-accent-surface overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ width: "70%" }}></div>
</div>
<span className="text-[11px] text-on-surface-variant">19 Docs</span>
</div>
</td>
<td className="py-3.5 px-4 text-right text-on-surface-variant">2026-08-20</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 rounded bg-accent-surface hover:bg-secondary hover:text-secondary-dark text-on-surface font-body text-xs transition-colors inline-flex items-center gap-1">
<span>Workspace</span>
<span className="material-symbols-outlined text-[13px]">arrow_forward</span>
</button>
</td>
</tr>
{/*  ROW 4: VEDA FINANCIAL (VERIFIED)  */}
<tr className="opacity-40 grayscale-[0.4] pointer-events-none deal-row" data-company="Veda Financial" aria-disabled="true">
<td className="py-3.5 px-4 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="font-body font-semibold text-on-surface text-sm flex items-center gap-2">
<span>Veda Financial</span><span className="font-mono text-[8px] px-1 py-0.5 rounded bg-outline/20 text-outline uppercase tracking-wide">Illustrative</span>
<span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-accent-surface border border-hairline">VF-IP</span>
</div>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface-variant">Trade Infrastructure</td>
<td className="py-3.5 px-4">
<span className="px-2 py-0.5 rounded bg-accent-surface border border-hairline text-[11px] text-on-surface">Pre-IPO</span>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface">Elena Rostova</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary-dark border border-tertiary/30 text-tertiary text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 88% VERIFIED
                    </span>
</td>
<td className="py-3.5 px-4 text-tertiary">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span>0 Active</span>
</span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className="w-20 h-1.5 rounded-full bg-accent-surface overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{ width: "85%" }}></div>
</div>
<span className="text-[11px] text-on-surface-variant">64 Docs</span>
</div>
</td>
<td className="py-3.5 px-4 text-right text-on-surface-variant">2026-09-05</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 rounded bg-accent-surface hover:border-secondary text-secondary font-body text-xs transition-colors inline-flex items-center gap-1 border border-hairline">
<span>Report</span>
<span className="material-symbols-outlined text-[13px]">description</span>
</button>
</td>
</tr>
{/*  ROW 5: HELIOS COMPUTE (ALERT)  */}
<tr className="opacity-40 grayscale-[0.4] pointer-events-none deal-row" data-company="Helios Compute" aria-disabled="true">
<td className="py-3.5 px-4 text-center">
<input className="w-3.5 h-3.5 bg-card-bg border border-accent-border rounded cursor-pointer accent-secondary" type="checkbox"/>
</td>
<td className="py-3.5 px-4">
<div className="font-body font-semibold text-on-surface text-sm flex items-center gap-2">
<span>Helios Compute</span><span className="font-mono text-[8px] px-1 py-0.5 rounded bg-outline/20 text-outline uppercase tracking-wide">Illustrative</span>
<span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-accent-surface border border-hairline">HC-A</span>
</div>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface-variant">Semiconductor AI</td>
<td className="py-3.5 px-4">
<span className="px-2 py-0.5 rounded bg-accent-surface border border-hairline text-[11px] text-on-surface">Series A</span>
</td>
<td className="py-3.5 px-4 font-body text-xs text-on-surface">Sarah Jenkins</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error-dark border border-error/30 text-error text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span> 61% ALERT
                    </span>
</td>
<td className="py-3.5 px-4 text-error">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">warning</span>
<span className="font-semibold">3 Flagged</span>
</span>
</td>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<div className="w-20 h-1.5 rounded-full bg-accent-surface overflow-hidden">
<div className="h-full bg-error rounded-full" style={{ width: "28%" }}></div>
</div>
<span className="text-[11px] text-on-surface-variant">8 Docs</span>
</div>
</td>
<td className="py-3.5 px-4 text-right text-on-surface-variant">2026-08-18</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 rounded bg-error-dark hover:bg-error hover:text-black text-error font-body text-xs transition-colors inline-flex items-center gap-1 border border-error/40">
<span>Investigate</span>
<span className="material-symbols-outlined text-[13px]">gavel</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Bottom Footer Bar  */}
<div className="px-5 py-3 border-t border-hairline flex items-center justify-between font-mono text-xs text-on-surface-variant flex-wrap gap-2 bg-accent-surface/20">
<div className="flex items-center gap-3">
<span>BATCH VERIFIER: <strong className="text-tertiary">ECDSA-SHA256 VALID</strong></span>
<span className="text-outline">|</span>
<span>PROOF BLOCK #8,491,209</span>
</div>
<div className="flex items-center gap-3">
<span className="text-outline">Selection: 0 mandates</span>
<button className="px-3 py-1 rounded bg-accent-surface border border-hairline hover:border-hairline-light text-on-surface text-xs font-mono transition-colors">
                Bulk Veracity Check
              </button>
</div>
</div>
{/*  INSPECTION PREVIEW DRAWER (BREATHING ROOM & STEPPING)  */}
<div className="p-5 border-t border-hairline bg-accent-surface/30 space-y-3">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[17px]">biotech</span>
<span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Active Target Forensic Inspection</span>
<span className="text-on-surface font-semibold text-xs ml-1">Helios Compute (HC-A)</span>
</div>
<span className="font-mono text-[10px] text-outline">RUN_ID: 0x904b...ff22</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
<div className="bg-card-bg rounded-lg p-3.5 border border-hairline hover:border-hairline-light transition-colors">
<div className="font-mono text-[10px] uppercase text-outline">Tax Authority Sync</div>
<div className="mt-1 font-mono text-xs text-error font-semibold">+18.4% Variance</div>
<div className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">Form 1120 reported $3.8M vs Deck $4.5M</div>
</div>
<div className="bg-card-bg rounded-lg p-3.5 border border-hairline hover:border-hairline-light transition-colors">
<div className="font-mono text-[10px] uppercase text-outline">Wafer Allocation Contract</div>
<div className="mt-1 font-mono text-xs text-tertiary font-semibold">VERIFIED: Taiwan Foundries</div>
<div className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">Capacity reservation firm through Q4 2027</div>
</div>
<div className="bg-card-bg rounded-lg p-3.5 border border-hairline hover:border-hairline-light transition-colors">
<div className="font-mono text-[10px] uppercase text-outline">IP Chain of Custody</div>
<div className="mt-1 font-mono text-xs text-secondary font-semibold">PENDING: Founder Assignment</div>
<div className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">Patent US-118942-B awaiting notary deed</div>
</div>
</div>
</div>
</div>
{/*  RIGHT COMPARTMENT: CHRONO FEED & VELOCITY DISTRIBUTION (COL 4)  */}
<div className="xl:col-span-4 space-y-6">
{/*  AUTOMATED AUDIT ALERTS / CHRONO FEED  */}
<div className="bg-card-bg rounded-xl border border-hairline overflow-hidden shadow-sm">
<div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error telemetry-glow"></span>
<span className="font-mono text-xs font-semibold text-on-surface uppercase tracking-wider">Automated Audit Alerts</span>
</div>
<span className="font-mono text-[10px] text-outline">CHRONO FEED</span>
</div>
{/*  Sleek Timeline Items  */}
<div className="divide-y divide-hairline">
{/*  Alert 1  */}
<div className="p-4 hover:bg-accent-surface/40 transition-colors space-y-1.5">
<div className="flex items-center justify-between font-mono text-xs">
<span className="text-error font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                    REVENUE MISMATCH
                  </span>
<span className="text-outline text-[11px]">14:22 UTC</span>
</div>
<p className="text-xs text-on-surface leading-relaxed">
                  Revenue mismatch detected in <strong className="text-primary font-semibold">Helios Compute</strong> Q2 tax ledger vs deck (<span className="text-error font-mono font-semibold">+18.4% variance</span>).
                </p>
<div className="pt-2 flex items-center justify-between font-mono text-[11px] text-outline">
<span>Impact: Material / IC Review</span>
<a className="text-secondary hover:underline flex items-center gap-0.5" href="#">
<span>Inspect Diff</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
</a>
</div>
</div>
{/*  Alert 2  */}
<div className="p-4 hover:bg-accent-surface/40 transition-colors space-y-1.5">
<div className="flex items-center justify-between font-mono text-xs">
<span className="text-tertiary font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">verified</span>
                    CONTRACT RECONCILED
                  </span>
<span className="text-outline text-[11px]">11:05 UTC</span>
</div>
<p className="text-xs text-on-surface leading-relaxed">
<strong className="text-primary font-semibold">Northstar Ops</strong>: MegaCorp churn contract confirmed via May 31 Bank reconciliation. Discrepancy resolved.
                </p>
<div className="pt-2 flex items-center justify-between font-mono text-[11px] text-outline">
<span>Attestation: J.P. Morgan Chase</span>
<span className="text-tertiary">HASH: 0x3f...91c</span>
</div>
</div>
{/*  Alert 3  */}
<div className="p-4 hover:bg-accent-surface/40 transition-colors space-y-1.5">
<div className="flex items-center justify-between font-mono text-xs">
<span className="text-secondary font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">rule</span>
                    LIQUIDATION PREFERENCE
                  </span>
<span className="text-outline text-[11px]">09:40 UTC</span>
</div>
<p className="text-xs text-on-surface leading-relaxed">
                  Series A term sheet liquidation preference verified against shareholder agreement for <strong className="text-primary font-semibold">Kinetix Bio</strong> (1.0x Non-Participating).
                </p>
<div className="pt-2 flex items-center justify-between font-mono text-[11px] text-outline">
<span>Signed: Wilson Sonsini LLP</span>
<span className="text-secondary">PARITY: 100%</span>
</div>
</div>
</div>
<div className="p-3 border-t border-hairline text-center bg-accent-surface/20">
<button className="text-on-surface-variant hover:text-on-surface font-mono text-[11px] uppercase tracking-wider transition-colors">
                View Complete Ingestion Ledger (1,492 Records)
              </button>
</div>
</div>
{/*  CONFIDENCE SPECTRUM & HSM CLUSTER  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 space-y-4 shadow-sm">
<div className="flex items-center justify-between border-b border-hairline pb-2.5">
<span className="font-mono text-xs uppercase tracking-wider text-outline">Confidence Distribution</span>
<span className="font-mono text-xs text-tertiary">RUN_10 AUDITED</span>
</div>
<div>
<div className="flex justify-between font-mono text-xs text-on-surface-variant mb-1.5">
<span>Aggregated Portfolio Confidence</span>
<span className="text-secondary font-semibold">82.4%</span>
</div>
<div className="w-full h-3 rounded-full bg-accent-surface overflow-hidden flex">
<div className="h-full bg-tertiary" style={{ width: "60%" }} title="60% Reconciled"></div>
<div className="h-full bg-secondary" style={{ width: "25%" }} title="25% Active"></div>
<div className="h-full bg-error" style={{ width: "15%" }} title="15% Flagged"></div>
</div>
<div className="flex items-center justify-between font-mono text-[10px] text-outline mt-2">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary"></span> 60% Reconciled</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary"></span> 25% Active</span>
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error"></span> 15% Flagged</span>
</div>
</div>
{/*  Notarization Cluster  */}
<div className="p-3 rounded-lg bg-accent-surface/60 border border-hairline flex items-center justify-between">
<div>
<div className="font-mono text-[9px] uppercase tracking-wider text-outline">Notarization Enclave</div>
<div className="text-xs text-on-surface font-medium mt-0.5">Hardware HSM Cluster (Zurich-01)</div>
</div>
<span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-mono text-[10px] border border-tertiary/30">
                SYNCED
              </span>
</div>
</div>
{/*  SIGNATORY ALLOCATION & WORKLOAD  */}
<div className="bg-card-bg rounded-xl border border-hairline p-5 space-y-3 shadow-sm">
<div className="flex items-center justify-between border-b border-hairline pb-2.5">
<span className="font-mono text-xs uppercase tracking-wider text-outline">Signatory Allocation</span>
<span className="font-mono text-[10px] text-outline">Q3 QUOTA</span>
</div>
<div className="divide-y divide-hairline font-body text-xs">
<div className="flex items-center justify-between py-2">
<span className="text-on-surface font-medium">Sarah Jenkins</span>
<div className="flex items-center gap-3 font-mono text-xs">
<span className="text-error">2 Alerts</span>
<span className="text-outline">5 Deals</span>
</div>
</div>
<div className="flex items-center justify-between py-2">
<span className="text-on-surface font-medium">David Chen</span>
<div className="flex items-center gap-3 font-mono text-xs">
<span className="text-tertiary">0 Alerts</span>
<span className="text-outline">4 Deals</span>
</div>
</div>
<div className="flex items-center justify-between py-2">
<span className="text-on-surface font-medium">Elena Rostova</span>
<div className="flex items-center gap-3 font-mono text-xs">
<span className="text-tertiary">0 Alerts</span>
<span className="text-outline">3 Deals</span>
</div>
</div>
<div className="flex items-center justify-between py-2">
<span className="text-on-surface font-medium">Marcus Vance</span>
<div className="flex items-center gap-3 font-mono text-xs">
<span className="text-secondary">1 Minor</span>
<span className="text-outline">2 Deals</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
    </>
  );
}
