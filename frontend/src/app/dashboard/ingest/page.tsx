import Link from "next/link";

export default function DashboardIngest() {
  return (
    <>
{/*  Evidence & Ingestion Terminal  */}




{/*  Left Navigation Bar  */}
<aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-[#1E3154]">
<div className="flex flex-col">
<div className="h-16 px-space-md flex items-center justify-between border-b border-[#1E3154] bg-surface-container-lowest">
<div className="flex items-center gap-space-sm">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
</span>
<span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Enclave v4.2</span>
</div>
<span className="font-code-sm text-code-sm text-outline px-space-xs py-0.5 bg-surface-container-low border border-[#1E3154] rounded-DEFAULT">TX: 809F</span>
</div>
<div className="p-space-md">
<div className="bg-surface-container-low p-space-sm border border-[#1E3154] rounded-lg">
<div className="font-label-caps text-label-caps text-outline uppercase mb-1 flex items-center justify-between">
<span>Audit Session Reference</span>
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
</div>
<div className="font-code-sm text-code-sm text-tertiary truncate">RUN_10 AUDITED - SECURE</div>
<div className="font-tabular-data text-tabular-data text-on-surface-variant mt-1">0x8F92...B314</div>
</div>
</div>
<nav className="flex flex-col gap-1 px-space-sm">
<a className="flex items-center justify-between px-space-sm py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm rounded-md" data-path="dashboard-queue" href="/dashboard">
<span className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px]">space_dashboard</span>
<span>Queue &amp; Intake</span>
</span>
<span className="font-tabular-data text-tabular-data text-outline">14</span>
</a>
<a className="flex items-center justify-between px-space-sm py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm rounded-md" data-path="due-diligence-workspace" href="/dashboard/workspace">
<span className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px]">account_tree</span>
<span>Diligence Matrix</span>
</span>
<span className="font-code-sm text-code-sm text-tertiary">ACT</span>
</a>
<a className="flex items-center justify-between px-space-sm py-2.5 bg-surface-container text-on-surface border-l-2 border-secondary font-medium font-body-sm text-body-sm rounded-r-md" data-path="evidence-ingestion" href="/dashboard/ingest">
<span className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-secondary">terminal</span>
<span>Evidence Vault</span>
</span>
<span className="font-tabular-data text-tabular-data text-secondary">88GB</span>
</a>
<a className="flex items-center justify-between px-space-sm py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm rounded-md" data-path="investment-report" href="#">
<span className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span>IC Prospectus</span>
</span>
<span className="font-code-sm text-code-sm text-secondary">PR-09</span>
</a>
<a className="flex items-center justify-between px-space-sm py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm rounded-md" data-path="audits" href="#">
<span className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Cryptographic Audits</span>
</span>
<span className="font-tabular-data text-tabular-data text-outline">99.98%</span>
</a>
</nav>
</div>
<div className="p-space-md border-t border-[#1E3154] bg-surface-container-lowest">
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Enclave Integrity</span>
<span className="font-tabular-data text-tabular-data text-tertiary font-medium">ZERO FAULT POSITIVE</span>
</div>
<div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center border border-[#1E3154]">
<span className="material-symbols-outlined text-tertiary text-[15px]">lock</span>
</div>
</div>
</div>
</aside>
{/*  Main View Frame  */}
<div className="pl-72">
{/*  Header  */}
<header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/85 backdrop-blur-md z-40 border-b border-[#1E3154] flex items-center justify-between px-gutter-desktop">
<div className="flex items-center gap-space-md">
<img alt="Chrimata Primary Horizontal Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VNs73aXMcjADJPNn2zFyJxI4CR17WPW8hCFunb_2coRnVRSU4CKX50GmZB4Kq63t78VlDe_2to9JJNaiNanUPqmJGNLdfDCkRtBB_BWXtYsrpjOQBxqBog3nKAqK22C6xy3U3TBSqBHMTTUMBRXc3LPZiWETFqGId-nNa40jSEeLWzsm8RAI6mCafy7WPus_WcYBhBNblKwQVlSuq2seJk5ZCrzhT4yTxbiFT70Jup9Rfljw3WbMnj0Fk"/>
<span className="font-headline-md text-headline-md tracking-tight text-on-surface hidden xl:inline">Chrimata Institutional Terminal</span>
<div className="h-4 w-[1px] bg-[#1E3154] hidden md:block"></div>
<div className="hidden md:flex items-center gap-space-xs px-2.5 py-1 bg-surface-container-low border border-[#1E3154] rounded-md">
<span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
<span className="font-label-caps text-label-caps text-tertiary uppercase">RUN_10 AUDITED - SECURE ENCLAVE</span>
</div>
</div>
<div className="flex items-center gap-space-lg">
<div className="hidden lg:flex items-center gap-space-md font-tabular-data text-tabular-data border-r border-[#1E3154] pr-space-lg">
<div className="flex items-center gap-space-xs">
<span className="text-outline font-label-caps text-label-caps">UTC</span>
<span className="text-on-surface font-medium">14:32:08</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="text-outline font-label-caps text-label-caps">EST</span>
<span className="text-on-surface font-medium">09:32:08</span>
</div>
</div>
<div className="flex items-center gap-space-sm pl-space-xs">
<div className="flex flex-col text-right hidden sm:flex">
<span className="font-title-sm text-title-sm text-on-surface leading-tight">E. Vane-Tempest</span>
<span className="font-code-sm text-code-sm text-outline">Lead Diligence Partner</span>
</div>
<div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-medium shadow-inner">
<span className="material-symbols-outlined text-[18px]">person</span>
</div>
</div>
</div>
</header>
{/*  Main Workspace Area  */}
<main className="relative pt-20 bg-background min-h-screen w-full px-gutter-desktop py-space-lg pb-16">
<div className="max-w-[1600px] mx-auto flex flex-col gap-6">
{/*  Top Session Telemetry & Attestation Bar  */}
<div className="w-full bg-surface-container-lowest/80 border border-[#1E3154] rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md backdrop-blur-sm">
<div className="flex flex-wrap items-center gap-space-md sm:gap-space-lg">
<div className="flex items-center gap-2">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
</span>
<span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">Enclave Telemetry</span>
</div>
<div className="h-3.5 w-px bg-[#1E3154] hidden sm:block"></div>
<div className="flex items-center gap-1.5 font-code-sm text-code-sm">
<span className="text-outline uppercase">Session:</span>
<span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded border border-[#1E3154]">RUN_10_INGEST</span>
</div>
<div className="flex items-center gap-1.5 font-code-sm text-code-sm">
<span className="text-outline uppercase">Protocol:</span>
<span className="text-tertiary">Zero-Knowledge Verification</span>
</div>
<div className="flex items-center gap-1.5 font-code-sm text-code-sm">
<span className="text-outline uppercase">Enclave:</span>
<span className="text-secondary font-medium">AWS Nitro HSM [us-east-1a]</span>
</div>
</div>
<div className="flex items-center gap-space-sm font-tabular-data text-tabular-data">
<div className="px-3 py-1.5 bg-surface-container-low rounded-lg border border-[#1E3154] text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-[16px]">shield_lock</span>
<span className="text-xs">AES-256-GCM EPI</span>
</div>
<div className="px-3 py-1.5 bg-surface-container-low rounded-lg border border-[#1E3154] text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[16px]">memory</span>
<span className="text-xs">Ephemeral RAM: <strong className="text-on-surface">18.4%</strong></span>
</div>
</div>
</div>
{/*  Primary Ingestion & Parsing Workstation Bento Grid  */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
{/*  Left Column: Upload Dropzone & Optical Signature (7 cols)  */}
<div className="xl:col-span-7 flex flex-col gap-6">
{/*  Ingestion Portal Box  */}
<div className="bg-surface-container-lowest border border-[#1E3154] rounded-2xl p-space-lg shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:border-[#2A4575]">
<div className="flex items-center justify-between mb-5">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center border border-[#1E3154] text-secondary">
<span className="material-symbols-outlined text-[19px]">file_upload</span>
</div>
<div>
<h2 className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Institutional Evidence Intake</h2>
<p className="font-body-sm text-body-sm text-outline">Direct ephemeral memory pipeline</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center px-2.5 py-1 rounded font-code-sm text-code-sm bg-surface-container text-outline border border-[#1E3154]">
                    SLOT_04 // AIR-GAPPED
                  </span>
</div>
</div>
{/*  Refined Drag & Drop Interactive Zone  */}
<div className="w-full bg-surface-container-low/60 border border-dashed border-[#2A4575] hover:border-secondary/70 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group/drop hover:bg-surface-container-low" id="drop-target">
{/*  Ambient Scanning Line Effect  */}
<div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
<div className="w-full h-12 bg-gradient-to-b from-transparent via-tertiary/10 to-transparent animate-scanbeam"></div>
</div>
<div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mb-4 text-secondary border border-[#1E3154] group-hover/drop:scale-105 group-hover/drop:border-secondary/40 transition-all duration-300 shadow-sm">
<span className="material-symbols-outlined text-[28px]">cloud_upload</span>
</div>
<p className="font-headline-md text-headline-md text-on-surface mb-1.5 font-normal">Deposit Primary Diligence Asset</p>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-5 leading-relaxed">
                  Drag &amp; drop audited balance sheets, sovereign treasury confirmations, cap table ledgers, or signed deeds.
                </p>
{/*  MIME pill tags  */}
<div className="flex flex-wrap items-center justify-center gap-2 font-label-caps text-label-caps">
<span className="px-2.5 py-1 rounded-md bg-surface-container border border-[#1E3154] text-on-surface-variant hover:text-on-surface transition-colors uppercase">PDF / OCR READY</span>
<span className="px-2.5 py-1 rounded-md bg-surface-container border border-[#1E3154] text-on-surface-variant hover:text-on-surface transition-colors uppercase">XLSX TABULAR</span>
<span className="px-2.5 py-1 rounded-md bg-surface-container border border-[#1E3154] text-on-surface-variant hover:text-on-surface transition-colors uppercase">E-NOTARIZED PKCS#7</span>
<span className="px-2.5 py-1 rounded-md bg-surface-container-high border border-[#1E3154] text-outline uppercase">MAX 512 MB</span>
</div>
<input aria-label="Drop institutional diligence document" className="absolute inset-0 opacity-0 cursor-pointer" type="file"/>
</div>
{/*  Active Cryptographic Receipt & Parsing Telemetry  */}
<div className="mt-6 bg-surface-container-low border border-[#1E3154] rounded-xl p-5">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E3154]">
<div className="flex items-center gap-3.5 min-w-0">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-[#1E3154] text-secondary flex-shrink-0">
<span className="material-symbols-outlined text-[22px]">description</span>
</div>
<div className="min-w-0">
<div className="font-title-sm text-title-sm text-on-surface truncate flex items-center gap-2">
<span>July_Investor_Update_2026.pdf</span>
<span className="text-xs px-2 py-0.5 rounded bg-surface-container border border-[#1E3154] text-outline font-tabular-data">1.4 MB</span>
</div>
<div className="font-code-sm text-code-sm text-outline flex items-center gap-2 mt-1">
<span>MIME: application/pdf</span>
<span>•</span>
<span className="text-tertiary flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          Signed by Principal Officer
                        </span>
</div>
</div>
</div>
<div className="px-3 py-1 bg-tertiary-container border border-tertiary/30 text-tertiary font-label-caps text-label-caps uppercase rounded-md flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span>100% Verified</span>
</div>
</div>
{/*  Cryptographic Hash Ledger Block  */}
<div className="mt-3.5 bg-surface-container-lowest/80 border border-[#1E3154] rounded-lg p-3 font-code-sm text-code-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
<div className="flex items-center gap-2 truncate">
<span className="text-outline uppercase font-label-caps text-label-caps">SHA-256:</span>
<span className="text-secondary font-tabular-data truncate">9f83a4c0291ebb832f0190823485ab92d04f128c894a7e8b610fa2e3bc41</span>
</div>
<button className="text-outline hover:text-on-surface transition-colors font-label-caps text-label-caps uppercase flex items-center gap-1 self-end md:self-auto px-2 py-1 bg-surface-container rounded border border-[#1E3154]">
<span className="material-symbols-outlined text-[14px]">content_copy</span>
<span>Copy Digest</span>
</button>
</div>
{/*  Progress Bar  */}
<div className="w-full bg-surface-container-highest h-1.5 rounded-full my-4 relative overflow-hidden">
<div className="bg-gradient-to-r from-tertiary to-emerald-400 h-full w-full rounded-full transition-all duration-1000"></div>
</div>
{/*  Extraction Metric Cards  */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
<div className="bg-surface-container p-3 rounded-lg border border-[#1E3154] flex flex-col">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">Extracted Tables</span>
<span className="font-tabular-data text-title-sm text-on-surface font-semibold">4 Entities</span>
</div>
<div className="bg-surface-container p-3 rounded-lg border border-[#1E3154] flex flex-col">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">Indexed Claims</span>
<span className="font-tabular-data text-title-sm text-secondary font-semibold">1 Contested</span>
</div>
<div className="bg-surface-container p-3 rounded-lg border border-[#1E3154] flex flex-col">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">OCR Confidence</span>
<span className="font-tabular-data text-title-sm text-tertiary font-semibold">99.84%</span>
</div>
<div className="bg-surface-container p-3 rounded-lg border border-[#1E3154] flex flex-col">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">Time to Proof</span>
<span className="font-tabular-data text-title-sm text-on-surface font-semibold">312 ms</span>
</div>
</div>
</div>
</div>
{/*  Optical Ingestion Signature & Animated Telemetry  */}
<div className="bg-surface-container-lowest border border-[#1E3154] rounded-2xl p-space-lg shadow-sm flex flex-col">
<div className="flex items-center justify-between mb-4">
<div>
<div className="font-label-caps text-label-caps text-outline uppercase tracking-wider flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
<span>Nitro HSM Stream</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mt-0.5">Live Optical Ingestion Signature</h3>
</div>
<div className="text-right">
<span className="font-code-sm text-code-sm text-tertiary font-tabular-data bg-tertiary-container/40 border border-tertiary/20 px-2.5 py-1 rounded-md">
                    CHUNKS: 16/16 SYNCHRONIZED
                  </span>
</div>
</div>
{/*  Animated Telemetry Waveform  */}
<div className="w-full h-20 bg-surface-container-low rounded-xl border border-[#1E3154] relative flex items-center px-4 overflow-hidden mb-3.5">
<svg className="w-full h-14 text-tertiary/75" fill="none" preserveAspectRatio="none" viewBox="0 0 800 60">
{/*  Subtle Background Grid lines  */}
<line stroke="#1E3154" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="30" y2="30" />
{/*  Primary Animated Sine Wave  */}
<path className="animate-wave-flow" d="M0 30 C 50 10, 100 50, 150 30 C 200 10, 250 50, 300 30 C 350 10, 400 50, 450 30 C 500 10, 550 50, 600 30 C 650 10, 700 50, 750 30 C 780 20, 800 30, 800 30" fill="none" stroke="currentColor" strokeWidth="2" />
{/*  Secondary Gold Phase Wave  */}
<path className="text-secondary/65 animate-wave-flow-slow" d="M0 30 C 60 45, 120 15, 180 30 C 240 45, 300 15, 360 30 C 420 45, 480 15, 540 30 C 600 45, 660 15, 720 30 C 760 40, 800 30, 800 30" stroke="currentColor" strokeWidth="1.5" />
</svg>
<div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-surface-container-low to-transparent"></div>
<div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-container-low to-transparent"></div>
</div>
<div className="flex flex-wrap items-center justify-between font-code-sm text-code-sm text-on-surface-variant gap-2 pt-1">
<span className="text-outline flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">data_object</span>
<span>Segment: 0x48A...330</span>
</span>
<span className="text-on-surface flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span>Zero Artifact Leaks Detected</span>
</span>
<span className="text-tertiary font-tabular-data">Entropy: 7.994 bits/byte</span>
</div>
</div>
</div>
{/*  Right Column: Intake Context & Schema (5 cols)  */}
<div className="xl:col-span-5 flex flex-col gap-6">
<div className="bg-surface-container-lowest border border-[#1E3154] rounded-2xl p-space-lg shadow-sm flex flex-col h-full justify-between">
<div>
<div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1E3154]">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center border border-[#1E3154] text-secondary">
<span className="material-symbols-outlined text-[19px]">assignment_turned_in</span>
</div>
<div>
<h2 className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Intake Context &amp; Schema</h2>
<p className="font-body-sm text-body-sm text-outline">Configured validation matrix</p>
</div>
</div>
<span className="font-code-sm text-code-sm text-tertiary px-2.5 py-1 bg-surface-container border border-[#1E3154] rounded">SCHEMA v2.6.4</span>
</div>
{/*  Document Archetype Selector  */}
<div className="mb-5">
<label className="block font-label-caps text-label-caps text-outline uppercase mb-2">
                    Document Archetype <span className="font-code-sm text-code-sm text-secondary">[DOC_TYPE_REF]</span>
</label>
<div className="grid grid-cols-2 gap-2" id="archetype-selector">
<button className="archetype-btn p-3 bg-surface-container border border-secondary text-left transition-all text-on-surface flex items-center justify-between rounded-lg shadow-sm" type="button">
<span className="font-body-md text-body-md font-medium">Investor Deck</span>
<span className="material-symbols-outlined text-[18px] text-secondary">check</span>
</button>
<button className="archetype-btn p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant text-left transition-all text-on-surface-variant flex items-center justify-between rounded-lg" type="button">
<span className="font-body-md text-body-md">Ledger / Bank Record</span>
<span className="material-symbols-outlined text-[18px] opacity-0 text-secondary">check</span>
</button>
<button className="archetype-btn p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant text-left transition-all text-on-surface-variant flex items-center justify-between rounded-lg" type="button">
<span className="font-body-md text-body-md">Contract / Cap Table</span>
<span className="material-symbols-outlined text-[18px] opacity-0 text-secondary">check</span>
</button>
<button className="archetype-btn p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant text-left transition-all text-on-surface-variant flex items-center justify-between rounded-lg" type="button">
<span className="font-body-md text-body-md">Board Minutes</span>
<span className="material-symbols-outlined text-[18px] opacity-0 text-secondary">check</span>
</button>
</div>
</div>
{/*  Effective Date Selection  */}
<div className="mb-5">
<label className="block font-label-caps text-label-caps text-outline uppercase mb-2">
                    Effective Audit Horizon Date <span className="font-code-sm text-code-sm text-secondary">[ISO 8601]</span>
</label>
<div className="relative">
<input className="w-full bg-surface-container-low border border-[#1E3154] rounded-lg text-on-surface font-tabular-data text-body-md px-3.5 py-2.5 outline-none focus:border-secondary transition-colors" type="text" defaultValue="2026-07-01"/>
<span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">calendar_today</span>
</div>
</div>
{/*  Declared Claim vs Ground Truth Flag Switch  */}
<div className="mb-5 p-4 bg-surface-container-low border border-[#1E3154] rounded-xl">
<div className="flex items-center justify-between mb-2">
<span className="font-label-caps text-label-caps text-outline uppercase">Epistemic Classification</span>
<span className="font-code-sm text-code-sm text-secondary uppercase font-semibold bg-surface-container px-2 py-0.5 rounded border border-[#1E3154]">Flag: Contested Deck</span>
</div>
<div className="flex items-start justify-between gap-4">
<div>
<div className="font-title-sm text-title-sm text-on-surface">Declared Claim vs. Ground Truth</div>
<div className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                        Numerical assertions within this asset are routed to adversarial cross-audit rather than canonical balance registries.
                      </div>
</div>
<label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
<input defaultChecked={true} className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
</label>
</div>
</div>
{/*  Diligence Extraction Targets (Multi-select)  */}
<div className="mb-6">
<label className="block font-label-caps text-label-caps text-outline uppercase mb-2">
                    Target Matrix Extraction Filters <span className="font-code-sm text-code-sm text-secondary">[VECTORS]</span>
</label>
<div className="grid grid-cols-2 gap-2">
<label className="flex items-center gap-2.5 p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant rounded-lg cursor-pointer select-none transition-colors">
<input defaultChecked={true} className="w-4 h-4 rounded text-secondary focus:ring-0 focus:ring-offset-0 bg-surface-container-lowest border-[#1E3154]" type="checkbox"/>
<span className="font-tabular-data text-body-md text-on-surface">MRR / ARR Dynamics</span>
</label>
<label className="flex items-center gap-2.5 p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant rounded-lg cursor-pointer select-none transition-colors">
<input defaultChecked={true} className="w-4 h-4 rounded text-secondary focus:ring-0 focus:ring-offset-0 bg-surface-container-lowest border-[#1E3154]" type="checkbox"/>
<span className="font-tabular-data text-body-md text-on-surface">Burn / Runway</span>
</label>
<label className="flex items-center gap-2.5 p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant rounded-lg cursor-pointer select-none transition-colors">
<input className="w-4 h-4 rounded text-secondary focus:ring-0 focus:ring-offset-0 bg-surface-container-lowest border-[#1E3154]" type="checkbox"/>
<span className="font-tabular-data text-body-md text-on-surface-variant">Cap Table / Prefs</span>
</label>
<label className="flex items-center gap-2.5 p-3 bg-surface-container-low border border-[#1E3154] hover:border-outline-variant rounded-lg cursor-pointer select-none transition-colors">
<input defaultChecked={true} className="w-4 h-4 rounded text-secondary focus:ring-0 focus:ring-offset-0 bg-surface-container-lowest border-[#1E3154]" type="checkbox"/>
<span className="font-tabular-data text-body-md text-on-surface">Headcount / Payroll</span>
</label>
</div>
</div>
</div>
{/*  Action Confirmation Area  */}
<div className="pt-4 border-t border-[#1E3154] flex flex-col gap-3">
<button className="w-full bg-secondary text-on-secondary font-title-sm text-title-sm py-3 px-4 rounded-xl uppercase tracking-wider font-semibold hover:bg-[#edd0a8] transition-colors flex items-center justify-center gap-2 shadow-md">
<span className="material-symbols-outlined text-[20px]">lock_clock</span>
<span>Seal Ledger Proof &amp; Ingest Claims</span>
</button>
<div className="flex items-center justify-between font-code-sm text-code-sm text-outline px-1">
<span>Transaction: 0x90B...4F1</span>
<span>Notary: Enclave Ephemeral Keyring</span>
</div>
</div>
</div>
</div>
</div>
{/*  Secondary Section: Institutional Batch Intake Pipeline & Security Callout  */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
{/*  Historical Pipeline Table (8 cols)  */}
<div className="xl:col-span-8 bg-surface-container-lowest border border-[#1E3154] rounded-2xl p-space-lg shadow-sm flex flex-col">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1E3154] gap-2">
<div>
<div className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Historical Pipeline</div>
<h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">Secure Intake Audit Stream</h2>
</div>
<div className="flex items-center gap-2 font-label-caps text-label-caps">
<span className="px-2.5 py-1 bg-surface-container border border-[#1E3154] rounded text-tertiary">SYNCED WITH RUN_10</span>
<span className="px-2.5 py-1 bg-surface-container border border-[#1E3154] rounded text-outline font-tabular-data">5 ARTIFACTS</span>
</div>
</div>
{/*  Table  */}
<div className="overflow-x-auto w-full">
<table className="w-full text-left font-tabular-data text-tabular-data">
<thead>
<tr className="border-b border-[#1E3154] text-outline font-label-caps text-label-caps">
<th className="py-3 px-4 uppercase">Evidence Asset</th>
<th className="py-3 px-4 uppercase">Archetype</th>
<th className="py-3 px-4 uppercase text-right">Size</th>
<th className="py-3 px-4 uppercase text-right">Extracted Units</th>
<th className="py-3 px-4 uppercase text-right">Status State</th>
</tr>
</thead>
<tbody className="divide-y divide-[#1E3154]/60 text-on-surface">
{/*  Row 1  */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<div className="font-body-md text-body-md font-medium text-on-surface truncate">Silicon_Valley_Bank_Statement_Q2_2026.pdf</div>
</div>
<div className="font-code-sm text-code-sm text-outline pl-4.5">SHA-256: 0x4811...ba28</div>
</td>
<td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">Ledger / Bank Record</td>
<td className="py-3.5 px-4 text-right text-outline">4.2 MB</td>
<td className="py-3.5 px-4 text-right text-on-surface font-semibold">1,248 Transactions</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary-container border border-tertiary/30 text-tertiary font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px]">verified</span>
<span>Parsed &amp; Verified</span>
</span>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<div className="font-body-md text-body-md font-medium text-on-surface truncate">Amended_Restated_Articles_of_Incorp.pdf</div>
</div>
<div className="font-code-sm text-code-sm text-outline pl-4.5">SHA-256: 0x12f9...7a91</div>
</td>
<td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">Contract / Cap Table</td>
<td className="py-3.5 px-4 text-right text-outline">18.9 MB</td>
<td className="py-3.5 px-4 text-right text-on-surface font-semibold">8 Classes Indexed</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container border border-secondary/30 text-secondary font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
<span>Verifying Signatures</span>
</span>
</td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<div className="font-body-md text-body-md font-medium text-on-surface truncate">Carta_CapTable_Export_Series_B.xlsx</div>
</div>
<div className="font-code-sm text-code-sm text-outline pl-4.5">SHA-256: 0x738d...cce0</div>
</td>
<td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">Contract / Cap Table</td>
<td className="py-3.5 px-4 text-right text-outline">892 KB</td>
<td className="py-3.5 px-4 text-right text-on-surface font-semibold">12 Entities Extracted</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary-container border border-tertiary/30 text-tertiary font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px]">done_all</span>
<span>Parsed</span>
</span>
</td>
</tr>
{/*  Row 4  */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-error"></span>
<div className="font-body-md text-body-md font-medium text-on-surface truncate">Q1_Q2_Board_Deck_Confidential_Redacted.pdf</div>
</div>
<div className="font-code-sm text-code-sm text-outline pl-4.5">SHA-256: 0x90a1...8011</div>
</td>
<td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">Board Minutes</td>
<td className="py-3.5 px-4 text-right text-outline">6.1 MB</td>
<td className="py-3.5 px-4 text-right text-error font-semibold">Variance Flagged</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container border border-error/30 text-error font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px]">warning</span>
<span>Claim Dispute</span>
</span>
</td>
</tr>
{/*  Row 5  */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<div className="font-body-md text-body-md font-medium text-on-surface truncate">Payroll_ADP_Summary_Jan_Jun_2026.csv</div>
</div>
<div className="font-code-sm text-code-sm text-outline pl-4.5">SHA-256: 0x334f...012a</div>
</td>
<td className="py-3.5 px-4 font-body-sm text-body-sm text-on-surface-variant">Ledger / Bank Record</td>
<td className="py-3.5 px-4 text-right text-outline">310 KB</td>
<td className="py-3.5 px-4 text-right text-on-surface font-semibold">142 Payees Reconciled</td>
<td className="py-3.5 px-4 text-right">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary-container border border-tertiary/30 text-tertiary font-label-caps text-label-caps uppercase">
<span className="material-symbols-outlined text-[13px]">check_circle</span>
<span>Extracted</span>
</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/*  Security & Compliance Assurance Panel (4 cols)  */}
<div className="xl:col-span-4 flex flex-col gap-6">
<div className="bg-surface-container-lowest border border-[#1E3154] rounded-2xl p-space-lg shadow-sm flex flex-col justify-between h-full">
<div>
<div className="flex items-center gap-2 text-tertiary mb-2">
<span className="material-symbols-outlined text-[20px]">verified_user</span>
<span className="font-label-caps text-label-caps uppercase tracking-widest text-outline">Institutional Safeguards</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-3">Client-Side Zero-Knowledge Encryption</h3>
<div className="p-4 bg-surface-container-low border border-[#1E3154] rounded-xl mb-4">
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Documents parsed strictly in ephemeral memory and discarded post-verification. Raw underlying file bytes are never written to persistent cold storage unless explicitly committed to the sovereign vault escrow.
                  </p>
</div>
<div className="flex flex-col gap-2 font-code-sm text-code-sm">
<div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-low/50 border border-[#1E3154]/50 text-on-surface-variant">
<span className="text-outline">ZK Prover Model:</span>
<span className="text-on-surface font-medium">Groth16 SNARK</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-low/50 border border-[#1E3154]/50 text-on-surface-variant">
<span className="text-outline">Enclave Attestation:</span>
<span className="text-tertiary font-medium">VALIDATED (0x8F92...B314)</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-low/50 border border-[#1E3154]/50 text-on-surface-variant">
<span className="text-outline">Data Retention:</span>
<span className="text-secondary font-medium">0s Residual Byte Leaks</span>
</div>
<div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-container-low/50 border border-[#1E3154]/50 text-on-surface-variant">
<span className="text-outline">Cross-Audit Ledger:</span>
<span className="text-on-surface font-tabular-data">Enclave-Signed Proof</span>
</div>
</div>
</div>
{/*  Custody Badge Block  */}
<div className="mt-6 pt-4 border-t border-[#1E3154] flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-[#1E3154]">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary border border-[#1E3154]">
<span className="material-symbols-outlined text-[18px]">key</span>
</div>
<div>
<div className="font-label-caps text-label-caps text-outline uppercase">Custody Standard</div>
<div className="font-code-sm text-code-sm text-on-surface">SOC 2 Type II / ISO-27001 Enclave</div>
</div>
</div>
<span className="material-symbols-outlined text-tertiary text-[20px]">lock</span>
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
