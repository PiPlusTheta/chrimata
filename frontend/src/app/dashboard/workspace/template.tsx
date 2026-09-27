import Link from "next/link";

export default function DashboardWorkspaceTemplate() {
  return (
    <>
{/*  Due Diligence Workspace — Northstar Ops  */}




{/*  Global Topbar (Replicated from Queue View for continuity)  */}
<header className="h-16 bg-[#070c14]/90 backdrop-blur-md border-b border-[#19263f] flex items-center justify-between px-6 z-40 fixed top-0 w-full">
<div className="flex items-center gap-4">
<div className="flex items-center gap-3">
{/*  Optional: Add real logo here, using text placeholder for now  */}
<span className="font-headline text-lg tracking-tight text-on-surface font-light">Chrimata</span>
<span className="h-4 w-[1px] bg-[#19263f]"></span>
<span className="font-mono text-[11px] font-semibold text-secondary tracking-wider uppercase">Diligence Workspace</span>
</div>
<div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0b1220] border border-[#19263f]">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="font-mono text-[10px] text-on-surface-variant font-medium tracking-wide">SECURE ENCLAVE ACTIVE</span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-3">
<div className="text-right hidden sm:block">
<div className="text-xs font-semibold text-on-surface leading-snug">E. Vane-Tempest</div>
<div className="font-mono text-[10px] text-on-surface-variant">Lead Diligence Partner</div>
</div>
<div className="w-8 h-8 rounded-full bg-[#101a2e] border border-[#19263f] flex items-center justify-center text-secondary shadow-sm">
<span className="material-symbols-outlined text-[17px]">shield_person</span>
</div>
</div>
</div>
</header>
<div className="flex flex-1 pt-16 h-screen overflow-hidden">
{/*  Left Sidebar (Collapsible Context Menu)  */}
<aside className="w-16 hover:w-64 group bg-[#0b1220] border-r border-[#19263f] flex flex-col justify-between transition-all duration-300 z-30 absolute md:relative h-full">
<div className="flex flex-col py-4 overflow-hidden">
<nav className="flex flex-col gap-2 px-2">
<a className="flex items-center px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-[#101a2e] hover:text-on-surface transition-all" href="/dashboard" title="Queue &amp; Intake">
<span className="material-symbols-outlined text-[20px] min-w-[24px]">space_dashboard</span>
<span className="ml-3 font-medium text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Queue &amp; Intake</span>
</a>
<a className="flex items-center px-3 py-2.5 rounded-lg bg-[#101a2e] text-secondary border border-[#19263f] transition-all" href="/dashboard/workspace" title="Diligence Matrix">
<span className="material-symbols-outlined text-[20px] min-w-[24px]">account_tree</span>
<span className="ml-3 font-medium text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Diligence Matrix</span>
</a>
<a className="flex items-center px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-[#101a2e] hover:text-on-surface transition-all" href="/dashboard/ingest" title="Evidence Vault">
<span className="material-symbols-outlined text-[20px] min-w-[24px]">terminal</span>
<span className="ml-3 font-medium text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Evidence Vault</span>
</a>
</nav>
</div>
<div className="p-4 border-t border-[#19263f] overflow-hidden whitespace-nowrap">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-[#101a2e] flex items-center justify-center text-outline flex-shrink-0">
<span className="material-symbols-outlined text-[16px]">lock</span>
</div>
<div className="opacity-0 group-hover:opacity-100 transition-opacity">
<div className="font-mono text-[9px] uppercase tracking-wider text-outline">Enclave Integrity</div>
<div className="font-mono text-[11px] text-tertiary font-medium">Verified</div>
</div>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="flex-1 flex flex-col overflow-y-auto bg-[#070c14] relative">
{/*  Workspace Header: Target Company Context  */}
<div className="px-8 py-6 border-b border-[#19263f] bg-[#0b1220]/50 sticky top-0 z-20 backdrop-blur-md flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-outline mb-1.5">
<span>Target Verification Profile</span>
<span className="text-[#19263f]">/</span>
<span className="text-error font-semibold">Active Discrepancy (68%)</span>
</div>
<h1 className="font-headline text-3xl md:text-4xl text-on-surface font-light tracking-tight flex items-center gap-3">
          Northstar Ops
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#101a2e] border border-[#19263f] text-on-surface-variant uppercase tracking-widest align-middle mt-1">Series A</span>
</h1>
<p className="text-xs md:text-sm text-on-surface-variant max-w-2xl mt-2 leading-relaxed">
          Enterprise B2B SaaS • Lead: Sarah Jenkins • Target Close: 2026-08-15
        </p>
</div>
<div className="flex items-center gap-3 font-mono text-xs">
<div className="px-3 py-1.5 rounded bg-error-container/20 border border-error/30 text-error flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
<span>2 Material Flags</span>
</div>
<button className="px-4 py-1.5 rounded bg-secondary text-secondary-dark font-medium hover:brightness-110 transition-colors flex items-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          Generate IC Memo
        </button>
</div>
</div>
<div className="p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-8">
{/*  LEFT COLUMN: Metrics & Veracity Investigation (8 cols)  */}
<div className="xl:col-span-8 flex flex-col gap-8">
{/*  Metrics Overview  */}
<section>
<div className="flex items-center justify-between mb-4">
<h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">monitoring</span>
              Calculated Metrics Over Time
            </h2>
<span className="font-mono text-[10px] text-outline">RUN_10</span>
</div>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
{/*  Metric 1: ARR  */}
<div className="bg-[#0b1220] rounded-xl border border-[#19263f] p-4 relative group hover:border-[#233555] transition-colors cursor-pointer">
<div className="text-xs text-outline font-mono mb-1">Live Annualised ARR</div>
<div className="font-headline text-2xl text-on-surface mb-2">₹1.44 Cr</div>
<div className="flex items-center gap-1.5 mt-auto">
<span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary border border-tertiary/20">VERIFIED</span>
<span className="material-symbols-outlined text-[12px] text-outline group-hover:text-primary transition-colors">expand_more</span>
</div>
</div>
{/*  Metric 2: Cash Runway  */}
<div className="bg-[#0b1220] rounded-xl border border-[#19263f] p-4 relative group hover:border-[#233555] transition-colors cursor-pointer">
<div className="text-xs text-outline font-mono mb-1">Simple Cash Runway</div>
<div className="font-headline text-2xl text-on-surface mb-2">3.7 mo</div>
<div className="flex items-center gap-1.5 mt-auto">
<span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary border border-tertiary/20">VERIFIED</span>
<span className="material-symbols-outlined text-[12px] text-outline group-hover:text-primary transition-colors">expand_more</span>
</div>
</div>
{/*  Metric 3: Conditional Runway  */}
<div className="bg-[#0b1220] rounded-xl border border-[#19263f] p-4 relative group hover:border-error/50 transition-colors cursor-pointer">
<div className="text-xs text-outline font-mono mb-1">Conditional Runway</div>
<div className="font-headline text-2xl text-on-surface mb-2">12.2 mo</div>
<div className="flex items-center gap-1.5 mt-auto">
<span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-error-container/30 text-error border border-error/20">CONTESTED</span>
<span className="material-symbols-outlined text-[12px] text-outline group-hover:text-error transition-colors">expand_more</span>
</div>
{/*  Expanded Detail (Simulated active state for one metric)  */}
<div className="absolute top-full left-0 w-full mt-2 bg-[#101a2e] border border-[#19263f] rounded-lg p-3 z-10 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
<div className="font-mono text-[10px] text-on-surface-variant mb-2 leading-relaxed">
<span className="text-outline">Formula:</span> <code className="text-primary bg-[#070c14] px-1 rounded">cash_balance / (avg_burn - pipeline_revenue)</code>
</div>
<div className="space-y-1 mb-2 font-body text-xs text-on-surface">
<div className="flex items-start gap-1">
<span className="text-outline mt-0.5">•</span>
<span>Assumes pipeline converts at 100% within 30 days.</span>
</div>
<div className="flex items-start gap-1">
<span className="text-outline mt-0.5">•</span>
<span className="text-error font-medium">Contested assumption: historical win rate is 42%.</span>
</div>
</div>
<div className="pt-2 border-t border-[#19263f] flex flex-wrap gap-1.5">
<button className="font-mono text-[9px] flex items-center gap-1 px-1.5 py-0.5 bg-[#0b1220] border border-[#19263f] rounded text-primary hover:bg-[#19263f] transition-colors">
<span className="material-symbols-outlined text-[11px]">link</span> March_Deck.pdf
                  </button>
<button className="font-mono text-[9px] flex items-center gap-1 px-1.5 py-0.5 bg-[#0b1220] border border-[#19263f] rounded text-primary hover:bg-[#19263f] transition-colors">
<span className="material-symbols-outlined text-[11px]">link</span> Bank_Ledger_May.xlsx
                  </button>
</div>
</div>
</div>
{/*  Metric 4: Adjusted MRR  */}
<div className="bg-[#0b1220] rounded-xl border border-[#19263f] p-4 relative group hover:border-[#233555] transition-colors cursor-pointer">
<div className="text-xs text-outline font-mono mb-1">Post-Churn Adjusted MRR</div>
<div className="font-headline text-2xl text-on-surface mb-2">₹1.3 Cr</div>
<div className="flex items-center gap-1.5 mt-auto">
<span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-secondary-container/30 text-secondary border border-secondary/20">INFERRED</span>
<span className="material-symbols-outlined text-[12px] text-outline group-hover:text-primary transition-colors">expand_more</span>
</div>
</div>
</div>
</section>
{/*  Visual Telemetry: Financial Discrepancy Chart  */}
<section className="bg-[#0b1220] rounded-xl border border-[#19263f] p-5 shadow-sm">
<div className="flex items-center justify-between mb-4 border-b border-[#19263f] pb-3">
<div>
<h3 className="font-headline text-lg text-on-surface">ARR Trajectory &amp; Forensic Variance Model</h3>
<p className="font-mono text-[10px] text-outline mt-1">Comparing declared metrics vs ledger ground truth (trailing 6 months)</p>
</div>
<div className="flex items-center gap-3 font-mono text-[10px]">
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-0.5 bg-tertiary inline-block"></span>
<span>Ledger Verified</span>
</div>
<div className="flex items-center gap-1.5 text-on-surface-variant">
<span className="w-2.5 h-0.5 bg-error inline-block border-t border-dashed border-error"></span>
<span>Deck Declared (Contested)</span>
</div>
</div>
</div>
{/*  Minimalist SVG Chart  */}
<div className="relative w-full h-48 mt-2 select-none">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 160">
<defs>
<linearGradient id="gradLedger" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#9dd3aa" stopOpacity="0.15" />
<stop offset="100%" stopColor="#9dd3aa" stopOpacity="0" />
</linearGradient>
</defs>
{/*  Grid Lines (Y-Axis)  */}
<line stroke="#19263f" strokeWidth="1" x1="0" x2="800" y1="20" y2="20" />
<line stroke="#19263f" strokeWidth="1" x1="0" x2="800" y1="70" y2="70" />
<line stroke="#19263f" strokeWidth="1" x1="0" x2="800" y1="120" y2="120" />
{/*  Y-Axis Labels  */}
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="0" y="16">₹2.5 Cr</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="0" y="66">₹1.5 Cr</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="0" y="116">₹0.5 Cr</text>
{/*  X-Axis Labels  */}
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="100" y="150">Jan</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="250" y="150">Feb</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="400" y="150">Mar</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="550" y="150">Apr</text>
<text fill="#606d84" fontFamily="JetBrains Mono" fontSize="10" x="700" y="150">May</text>
{/*  Area Fill for Ledger  */}
<path d="M 100 100 L 250 85 L 400 90 L 550 75 L 700 80 L 700 120 L 100 120 Z" fill="url(#gradLedger)" />
{/*  Line: Ledger Verified (Tertiary)  */}
<path className="animate-line" d="M 100 100 L 250 85 L 400 90 L 550 75 L 700 80" fill="none" stroke="#9dd3aa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
{/*  Data Points: Ledger  */}
<circle cx="100" cy="100" fill="#9dd3aa" r="3" />
<circle cx="250" cy="85" fill="#9dd3aa" r="3" />
<circle cx="400" cy="90" fill="#9dd3aa" r="3" />
<circle cx="550" cy="75" fill="#9dd3aa" r="3" />
<circle cx="700" cy="80" fill="#9dd3aa" r="3" />
{/*  Line: Deck Declared (Error/Contested)  */}
<path className="animate-line" d="M 100 100 L 250 85 L 400 30 L 550 25" fill="none" stroke="#fb7185" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
{/*  Data Points: Deck  */}
<circle cx="400" cy="30" fill="#fb7185" r="4" />
<circle cx="550" cy="25" fill="#fb7185" r="4" />
{/*  Variance Highlight Zone  */}
<path d="M 400 90 L 400 30 L 550 25 L 550 75 Z" fill="#fb7185" fillOpacity="0.05" stroke="none" />
<line stroke="#fb7185" strokeDasharray="2 2" strokeWidth="1" x1="400" x2="400" y1="30" y2="90" />
{/*  Annotation  */}
<g transform="translate(420, 50)">
<rect fill="#3d0e12" height="24" rx="4" stroke="#fb7185" strokeOpacity="0.3" width="90" />
<text fill="#fb7185" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" x="8" y="15">Δ +₹1.5 Cr</text>
</g>
</svg>
{/*  Scanning effect  */}
<div className="absolute inset-0 pointer-events-none rounded overflow-hidden">
<div className="w-full h-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scanbeam"></div>
</div>
</div>
</section>
{/*  Claim Veracity Investigation (Issues List)  */}
<section>
<div className="flex items-center justify-between mb-4">
<h2 className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-error">gavel</span>
              Claim Veracity Investigation
            </h2>
</div>
<div className="flex flex-col gap-4">
{/*  Issue 1: Unresolved Variance  */}
<div className="bg-[#0b1220] border border-[#19263f] rounded-xl p-5 shadow-sm relative overflow-hidden">
{/*  Alert Accent Line  */}
<div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
<div className="flex justify-between items-start mb-3">
<div className="flex-1 pl-3">
<div className="flex items-center gap-2 mb-1.5">
<h3 className="font-headline text-xl text-on-surface">March ARR Discrepancy</h3>
<span className="px-2 py-0.5 text-[9px] font-mono rounded-full whitespace-nowrap bg-error-container/40 border border-error/30 text-error uppercase">
                    open issue
                  </span>
</div>
<div className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Claim: <span className="text-on-surface italic">"March ARR was ₹2.4 Cr"</span> (As of 2026-03-31)
                </div>
</div>
</div>
{/*  Source Click-Through Pills  */}
<div className="pl-3 flex flex-wrap gap-2 mt-3 border-t border-[#19263f] pt-3">
<span className="text-[10px] font-mono text-outline uppercase self-center mr-2">Evidence Trail:</span>
<button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono bg-[#101a2e] border border-[#19263f] text-on-surface-variant rounded hover:bg-[#19263f] hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-[13px]">link</span> March_Deck.pdf
                </button>
<button className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono bg-error-container/20 border border-error/20 text-error rounded hover:bg-error-container/40 transition-colors">
<span className="material-symbols-outlined text-[13px]">link</span> against: Bank_Ledger_May.xlsx
                </button>
</div>
{/*  Analyst Review Form  */}
<div className="mt-4 pt-4 border-t border-[#19263f] pl-3">
<h4 className="font-mono text-[10px] uppercase text-outline mb-2">Analyst Judgment</h4>
<div className="flex flex-col sm:flex-row gap-2">
<select className="bg-[#101a2e] border border-[#19263f] rounded-md px-3 py-2 text-sm font-body text-on-surface focus:border-secondary outline-none appearance-none cursor-pointer sm:w-48">
<option defaultValue="request_evidence">Request Evidence</option>
<option defaultValue="dispute">Dispute</option>
<option defaultValue="accept_explanation">Accept Explanation</option>
<option defaultValue="resolve">Resolve</option>
</select>
<input className="flex-1 bg-[#101a2e] border border-[#19263f] rounded-md px-3 py-2 text-sm font-body text-on-surface placeholder:text-outline focus:border-secondary outline-none" placeholder="Provide forensic rationale..." type="text" defaultValue="Awaiting Q2 finalized GST filings to cross-reference MRR."/>
<button className="bg-secondary text-secondary-dark hover:brightness-110 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">save</span> Save
                </button>
</div>
</div>
</div>
{/*  Issue 2: Resolved  */}
<div className="bg-[#0b1220]/60 border border-[#19263f]/60 rounded-xl p-5 shadow-sm relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
<div className="flex justify-between items-start mb-3">
<div className="flex-1 pl-3">
<div className="flex items-center gap-2 mb-1.5">
<h3 className="font-headline text-lg text-on-surface">MegaCorp Contract Churn</h3>
<span className="px-2 py-0.5 text-[9px] font-mono rounded-full whitespace-nowrap bg-tertiary-container/30 border border-tertiary/20 text-tertiary uppercase">
                    resolved
                  </span>
</div>
<div className="text-sm font-body text-on-surface-variant">
                  Claim: <span className="text-on-surface italic">"July churn of ₹40 lakh/month"</span> (As of 2026-07-15)
                </div>
</div>
</div>
<div className="pl-3 mt-3 border-t border-[#19263f]/60 pt-3 flex items-center gap-3">
<div className="font-mono text-[10px] text-tertiary flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">verified</span> Analyst: Accepted via July ledger sync.
                </div>
</div>
</div>
</div>
</section>
</div>
{/*  RIGHT COLUMN: Evidence Ledger & Agent Console (4 cols)  */}
<div className="xl:col-span-4 flex flex-col gap-6">
{/*  Hindsight Agent Console  */}
<section className="flex-1 bg-[#0b1220] border border-[#19263f] rounded-xl flex flex-col h-[600px] xl:h-[calc(100vh-160px)] xl:sticky top-[100px] shadow-xl overflow-hidden relative">
{/*  Agent Header  */}
<div className="px-4 py-3 border-b border-[#19263f] bg-[#0b1220] flex justify-between items-center z-10">
<h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">smart_toy</span>
              Hindsight Cognitive Agent
            </h2>
<div className="flex gap-1.5">
<button className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 bg-[#101a2e] hover:bg-[#19263f] border border-[#19263f] text-on-surface rounded transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">analytics</span> Analyze
              </button>
<button className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 bg-[#2b1836] hover:bg-[#3d234d] border border-[#4d2d60] text-[#d8a8f5] rounded transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">auto_awesome</span> Reflect
              </button>
</div>
</div>
{/*  Chat Feed  */}
<div className="flex-1 overflow-y-auto p-4 space-y-4 font-body text-sm bg-gradient-to-b from-[#0b1220] to-[#070c14]">
{/*  Example Message: User  */}
<div className="flex flex-col items-end">
<div className="max-w-[85%] px-3.5 py-2.5 rounded-xl rounded-tr-sm bg-[#101a2e] border border-[#19263f] text-on-surface shadow-sm">
                what is live annualised arr based on latest ledger?
              </div>
</div>
{/*  Example Message: Agent  */}
<div className="flex flex-col items-start">
<div className="max-w-[90%] px-3.5 py-3 rounded-xl rounded-tl-sm bg-surface-container-highest border border-[#19263f] text-on-surface shadow-sm leading-relaxed">
<p className="mb-2">The live annualised ARR is <strong className="text-primary font-mono text-xs font-semibold bg-[#070c14] px-1 rounded">₹1.44 crore</strong> as of 2026-04-01.</p>
<p className="text-on-surface-variant text-xs">This is derived from active MRR of ₹1.2 crore multiplied by 12, per the April ledger. Note that a March deck claimed ₹2.4 crore ARR (now contested).</p>
</div>
{/*  Recalled Memory Context  */}
<div className="mt-2 text-xs bg-primary-container/20 border border-primary/20 p-2.5 rounded-lg max-w-[90%] font-mono">
<div className="font-semibold text-primary mb-1.5 flex items-center gap-1.5 text-[10px] uppercase">
<span className="material-symbols-outlined text-[13px]">memory</span> Context Retrieved
                </div>
<div className="text-primary-fixed-dim/80 leading-snug pl-2 border-l border-primary/30">
                  "Calculated metric calc-live-arr-apr indicates ₹1.44 crore derived from April ledger."
                </div>
</div>
</div>
</div>
{/*  Agent Input Area  */}
<div className="p-3 border-t border-[#19263f] bg-[#0b1220] z-10 relative">
<div className="flex gap-2 items-center bg-[#070c14] border border-[#19263f] rounded-lg px-3 py-1 focus-within:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-outline text-[18px]">terminal</span>
<input className="flex-1 bg-transparent border-none px-1 py-2 text-sm text-on-surface placeholder:text-outline focus:ring-0 outline-none font-mono" placeholder="Query enclave memory..." type="text"/>
<button className="w-8 h-8 rounded bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
<span className="material-symbols-outlined text-[16px]">send</span>
</button>
</div>
</div>
</section>
{/*  Evidence Ledger (Miniature Timeline)  */}
<section className="bg-[#0b1220] border border-[#19263f] rounded-xl p-4 shadow-sm">
<div className="flex items-center justify-between mb-3 border-b border-[#19263f] pb-2">
<h2 className="font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">library_books</span>
              Evidence Ledger
            </h2>
<span className="font-mono text-[9px] text-outline">5 DOCS</span>
</div>
<div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
{/*  Doc Item 1  */}
<button className="text-left flex gap-3 items-center bg-[#070c14] p-2.5 rounded border border-[#19263f] hover:border-outline-variant transition-colors group">
<div className="w-8 h-8 rounded bg-[#101a2e] flex items-center justify-center flex-shrink-0 text-outline group-hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">description</span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline mb-0.5">
<span className="text-xs font-medium text-on-surface truncate">Bank_Ledger_May.xlsx</span>
</div>
<div className="text-[9px] font-mono text-on-surface-variant flex gap-2">
<span>2026-05-01</span>
<span className="text-tertiary">Verified</span>
</div>
</div>
</button>
{/*  Doc Item 2  */}
<button className="text-left flex gap-3 items-center bg-[#070c14] p-2.5 rounded border border-[#19263f] hover:border-outline-variant transition-colors group">
<div className="w-8 h-8 rounded bg-[#101a2e] flex items-center justify-center flex-shrink-0 text-outline group-hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline mb-0.5">
<span className="text-xs font-medium text-on-surface truncate">March_Deck.pdf</span>
</div>
<div className="text-[9px] font-mono text-on-surface-variant flex gap-2">
<span>2026-03-31</span>
<span className="text-error">Contested</span>
</div>
</div>
</button>
{/*  Action Button to Ingestion  */}
<a className="mt-2 w-full font-mono text-[10px] uppercase tracking-wider text-center py-2 bg-[#101a2e] hover:bg-[#19263f] text-on-surface-variant rounded border border-[#19263f] transition-colors block" href="/dashboard/ingest">
            Ingest New Evidence
          </a>
</div>
</section>
</div>
</div>
</main>
</div>
    </>
  );
}
