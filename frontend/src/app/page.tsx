"use client";
import { ROUTES } from "../routes";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrajectoryChart, AmbientGlow } from '../components/TrajectoryChart';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('financials');
  const [metric, setMetric] = useState('time');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const metricData = {
    time: {
      title: 'Velocity Impact Metric',
      desc: 'Compressing closing cycles from weeks to minutes while boosting legal defensibility.',
      stat: '24h vs 35 Days'
    },
    error: {
      title: 'Precision & Evidence Density',
      desc: 'Comprehensive multi-source verification eliminating sampling blindspots.',
      stat: '100% vs ~12% Sample'
    },
    cost: {
      title: 'Escrow & Liability Protection',
      desc: 'Avoidance of post-acquisition disputes, clawbacks, and undisclosed liabilities.',
      stat: 'Zero Undetected Churn'
    }
  }[metric];

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert('Verification complete: Deterministic hash verified across live bank nodes (0x4f128e0bb629). Ledger discrepancies confirmed.');
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  return (
    <>
      <header className="w-full border-b border-outline-dim/60 bg-aegean-dark/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="landing-container py-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <Link className="font-display text-base font-semibold tracking-wide text-text-primary hover:text-bronze transition-colors flex items-center gap-2" href="/">
              <img src="/logo.png" alt="Chrimata Logo" className="h-6 w-auto object-contain" />
              CHRIMATA
            </Link>
            <span className="hidden sm:inline text-outline-soft">/</span>
            <div className="hidden sm:flex items-center gap-2 text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-olive-truth status-pulse"></span>
              <span className="text-[11px] tracking-widest uppercase">Deterministic Enclave Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 text-[11px] text-text-muted">
              <span className="">SHA-256: 9b2d..e817</span>
              <span className="text-outline-soft">|</span>
              <span className="">SOC-2 TYPE II CERTIFIED</span>
            </div>
            <a className="px-3.5 py-1.5 border border-bronze/40 text-bronze hover:border-bronze hover:bg-bronze/10 text-[11px] font-mono tracking-wider uppercase transition-all duration-200" href="#request-access">
              Request Access
            </a>
          </div>
        </div>
      </header>

      <section className="relative flex items-center justify-center py-16 lg:py-20 overflow-hidden">
        <AmbientGlow />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-aegean-dark/30 via-transparent to-aegean-dark"></div>
        <div className="landing-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-bronze/25 bg-aegean-deep/60 backdrop-blur-md mb-6">
              <span className="material-symbols-outlined text-sm text-bronze" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
              <span className="font-mono text-[11px] tracking-ultra text-bronze uppercase">Veracity Architecture for Capital Allocators</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-text-primary leading-[1.12] mb-6 max-w-2xl">
              Due diligence, reconstructed for the <span className="italic font-light text-bronze">intelligence era</span>.
            </h1>
            <p className="font-sans text-base sm:text-lg lg:text-xl text-text-secondary max-w-xl leading-relaxed font-light mb-8">
              High-frequency evidence reconciliation and mathematical veracity verification for investment committees, private equity partners, and corporate strategy teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <a className="w-full sm:w-auto px-8 py-3.5 bg-bronze text-aegean-dark font-sans text-sm font-semibold tracking-wider uppercase hover:bg-bronze-hover transition-all duration-200 shadow-glow-bronze text-center" href="#request-access">
                Request Institutional Access
              </a>
              <Link className="w-full sm:w-auto px-8 py-3.5 bg-aegean-surface/80 border border-outline-soft/60 hover:border-bronze/40 text-text-primary font-sans text-sm font-medium tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 text-center" href={ROUTES.queue("northstar")}>
                <span className="material-symbols-outlined text-base text-bronze">terminal</span>
                <span className="">Inspect Verification Terminal</span>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-truth status-pulse"></span> Zero Ambient Drift
              </span>
              <span className="text-outline-soft">•</span>
              <span className="">Hardware Enclave Execution (AWS Nitro / SGX)</span>
            </div>
          </div>
          <div className="lg:col-span-5 w-full">
            <div className="w-full aspect-[520/440] border border-[#1E3154] bg-[#070C14] rounded-lg shadow-2xl overflow-hidden relative group hover-glow">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-bronze/10 via-transparent to-olive-truth/10 pointer-events-none rounded-lg"></div>
              <svg className="w-full h-full object-cover block relative z-10" fill="none" viewBox="0 0 520 440" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="headerGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#0F182A" stopOpacity="0.95"></stop>
                    <stop offset="100%" stopColor="#16223B" stopOpacity="0.9"></stop>
                  </linearGradient>
                  <linearGradient id="gridGlow" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#4A7C59" stopOpacity="0.25"></stop>
                    <stop offset="50%" stopColor="#1E3154" stopOpacity="0.1"></stop>
                    <stop offset="100%" stopColor="#070C14" stopOpacity="0.3"></stop>
                  </linearGradient>
                  <linearGradient id="streamGrad1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#C5A880" stopOpacity="0.1"></stop>
                    <stop offset="50%" stopColor="#E5C79E" stopOpacity="0.9"></stop>
                    <stop offset="100%" stopColor="#C5A880" stopOpacity="0.2"></stop>
                  </linearGradient>
                  <linearGradient id="streamGrad2" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#4A7C59" stopOpacity="0.1"></stop>
                    <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.95"></stop>
                    <stop offset="100%" stopColor="#4A7C59" stopOpacity="0.2"></stop>
                  </linearGradient>
                  <linearGradient id="scanBeam" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#4A7C59" stopOpacity="0"></stop>
                    <stop offset="50%" stopColor="#4A7C59" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#4A7C59" stopOpacity="0.0"></stop>
                  </linearGradient>
                  <filter height="140%" id="vectorGlow" width="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="blur" stdDeviation="3.5"></feGaussianBlur>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                  </filter>
                </defs>
                <style>{`
                  @keyframes pulseLed { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.85); } } 
                  @keyframes sweepLine { 0% { transform: translateY(0px); opacity: 0.1; } 50% { opacity: 0.8; } 100% { transform: translateY(170px); opacity: 0.1; } } 
                  @keyframes drawWaveA { 0% { stroke-dashoffset: 400; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -400; } } 
                  @keyframes drawWaveB { 0% { stroke-dashoffset: -400; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 400; } } 
                  @keyframes radarRing { 0% { r: 6px; opacity: 0.9; stroke-width: 2px; } 100% { r: 38px; opacity: 0; stroke-width: 0.5px; } } 
                  @keyframes hashGlitch { 0%, 100% { opacity: 0.85; } 92% { opacity: 0.85; } 94% { opacity: 0.3; } 96% { opacity: 0.95; } 98% { opacity: 0.5; } } 
                  @keyframes telemetryPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } } 
                  .pulse-status { animation: pulseLed 2s ease-in-out infinite; transform-origin: 432px 28px; } 
                  .scan-beam { animation: sweepLine 3.2s ease-in-out infinite alternate; } 
                  .vector-wave-1 { stroke-dasharray: 200 40; animation: drawWaveA 6s linear infinite; } 
                  .vector-wave-2 { stroke-dasharray: 220 50; animation: drawWaveB 7s linear infinite; } 
                  .radar-pulse-ring { animation: radarRing 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; transform-origin: 260px 145px; } 
                  .glitch-code { animation: hashGlitch 4s infinite; } 
                  .proof-pulse { animation: telemetryPulse 3s ease-in-out infinite; transform-origin: 390px 410px; }
                `}</style>
                <rect fill="#090E17" height="440" rx="3" stroke="#1E3154" strokeWidth="1.2" width="520" x="0" y="0"></rect>
                <rect fill="url(#headerGrad)" height="46" rx="3" width="520" x="0" y="0"></rect>
                <line stroke="#1E3154" strokeWidth="1" x1="0" x2="520" y1="46" y2="46"></line>
                <rect fill="#C5A880" height="7" opacity="0.8" rx="1" width="7" x="18" y="19"></rect>
                <rect fill="#1E3154" height="7" rx="1" width="7" x="29" y="19"></rect>
                <text fill="#CED4DA" fontFamily="'IBM Plex Mono', monospace" fontSize="10.5" fontWeight="600" letterSpacing="0.1em" x="44" y="27">NITRO-SGX-ENCLAVE</text>
                <text fill="#6C757D" fontFamily="'IBM Plex Mono', monospace" fontSize="10.5" letterSpacing="0.08em" x="184" y="27">{"// SECURE KERNEL v4.12"}</text>
                <g transform="translate(390, 16)">
                  <rect fill="#070C14" height="22" rx="2" stroke="#4A7C59" strokeWidth="0.8" width="114" x="0" y="0"></rect>
                  <circle className="pulse-status" cx="12" cy="11" fill="#4A7C59" r="3.5"></circle>
                  <text fill="#4A7C59" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="700" letterSpacing="0.08em" x="22" y="14.5">ENCLAVE ACTIVE</text>
                </g>
                <g transform="translate(18, 58)">
                  <rect fill="#060A10" height="175" rx="2" stroke="#17243B" strokeWidth="1" width="484" x="0" y="0"></rect>
                  <rect fill="url(#gridGlow)" height="175" rx="2" width="484" x="0" y="0"></rect>
                  <rect className="scan-beam" fill="url(#scanBeam)" height="25" pointerEvents="none" width="484" x="0" y="0"></rect>
                  <line stroke="#121F36" strokeDasharray="2 3" strokeWidth="0.8" x1="0" x2="484" y1="44" y2="44"></line>
                  <line stroke="#172642" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="484" y1="88" y2="88"></line>
                  <line stroke="#121F36" strokeDasharray="2 3" strokeWidth="0.8" x1="0" x2="484" y1="132" y2="132"></line>
                  <line stroke="#121F36" strokeDasharray="2 3" strokeWidth="0.8" x1="121" x2="121" y1="0" y2="175"></line>
                  <line stroke="#172642" strokeDasharray="4 4" strokeWidth="1" x1="242" x2="242" y1="0" y2="175"></line>
                  <line stroke="#121F36" strokeDasharray="2 3" strokeWidth="0.8" x1="363" x2="363" y1="0" y2="175"></line>
                  <circle cx="242" cy="88" fill="none" r="70" stroke="#162744" strokeDasharray="3 4" strokeWidth="0.8"></circle>
                  <circle cx="242" cy="88" fill="none" r="45" stroke="#1A3054" strokeWidth="0.9"></circle>
                  <circle cx="242" cy="88" fill="none" r="22" stroke="#284270" strokeWidth="1"></circle>
                  <circle className="radar-pulse-ring" cx="242" cy="88" fill="none" r="6" stroke="#4A7C59"></circle>
                  <circle cx="242" cy="88" fill="#4A7C59" filter="url(#vectorGlow)" r="3.5"></circle>
                  <path className="vector-wave-1" d="M 12 142 C 90 135, 160 110, 242 88 C 320 68, 410 42, 472 32" fill="none" filter="url(#vectorGlow)" stroke="url(#streamGrad1)" strokeLinecap="round" strokeWidth="2.5"></path>
                  <path className="vector-wave-2" d="M 12 36 C 85 55, 170 78, 242 88 C 310 98, 395 125, 472 140" fill="none" filter="url(#vectorGlow)" stroke="url(#streamGrad2)" strokeLinecap="round" strokeWidth="2.5"></path>
                  <line stroke="#F8F9FA" strokeWidth="1.2" x1="234" x2="250" y1="88" y2="88"></line>
                  <line stroke="#F8F9FA" strokeWidth="1.2" x1="242" x2="242" y1="80" y2="96"></line>
                  <g transform="translate(18, 16)">
                    <rect fill="#0B1220" height="18" opacity="0.9" rx="2" stroke="#C5A880" strokeWidth="0.8" width="96" x="0" y="0"></rect>
                    <circle cx="8" cy="9" fill="#C5A880" r="2.5"></circle>
                    <text fill="#C5A880" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" fontWeight="600" x="16" y="12.5">V_INIT [CLAIM]</text>
                  </g>
                  <g transform="translate(170, 114)">
                    <rect fill="#0B1220" height="20" rx="2" stroke="#4A7C59" strokeWidth="1" width="144" x="0" y="0"></rect>
                    <circle cx="10" cy="10" fill="#4A7C59" r="3"></circle>
                    <text fill="#6EE7B7" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="700" x="18" y="14">GROUND_TRUTH_CONVERGE</text>
                  </g>
                  <g transform="translate(348, 16)">
                    <rect fill="#0B1220" height="18" rx="2" stroke="#1E3154" strokeWidth="0.8" width="120" x="0" y="0"></rect>
                    <text fill="#E9ECEF" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" fontWeight="600" x="8" y="12.5">EBITDA VECTOR (+0.00)</text>
                  </g>
                  <text fill="#4E5D78" fontFamily="'IBM Plex Mono', monospace" fontSize="8" x="8" y="166">SIG_STRENGTH: -48dBm</text>
                  <text fill="#4E5D78" fontFamily="'IBM Plex Mono', monospace" fontSize="8" x="210" y="166">EPOCH: 0x8F92...B314</text>
                  <text fill="#4E5D78" fontFamily="'IBM Plex Mono', monospace" fontSize="8" x="408" y="166">Z-SCORE: 0.001</text>
                </g>
                <g transform="translate(18, 248)">
                  <line stroke="#16223B" strokeWidth="1" x1="0" x2="484" y1="36" y2="36"></line>
                  <text fill="#CED4DA" fontFamily="'IBM Plex Sans', sans-serif" fontSize="12" fontWeight="500" x="0" y="24">Invariance Vector:</text>
                  <text fill="#6EE7B7" fontFamily="'IBM Plex Mono', monospace" fontSize="13" fontWeight="700" letterSpacing="0.02em" textAnchor="end" x="484" y="24">99.984% Deterministic</text>
                  <line stroke="#16223B" strokeWidth="1" x1="0" x2="484" y1="74" y2="74"></line>
                  <text fill="#CED4DA" fontFamily="'IBM Plex Sans', sans-serif" fontSize="12" fontWeight="500" x="0" y="61">Verification Latency:</text>
                  <text fill="#F8F9FA" fontFamily="'IBM Plex Mono', monospace" fontSize="13" fontWeight="600" textAnchor="end" x="484" y="61">0.18ms</text>
                  <line stroke="#16223B" strokeWidth="1" x1="0" x2="484" y1="112" y2="112"></line>
                  <text fill="#CED4DA" fontFamily="'IBM Plex Sans', sans-serif" fontSize="12" fontWeight="500" x="0" y="99">Unreconciled Artifacts:</text>
                  <text fill="#C5A880" fontFamily="'IBM Plex Mono', monospace" fontSize="13" fontWeight="700" textAnchor="end" x="484" y="99">0.00% Zero Ambient Drift</text>
                </g>
                <g transform="translate(18, 382)">
                  <rect fill="#0B1220" height="38" rx="2" stroke="#1A2D4C" strokeWidth="1" width="484" x="0" y="0"></rect>
                  <g className="glitch-code" transform="translate(14, 23)">
                    <circle cx="0" cy="-4" fill="#4A7C59" r="3"></circle>
                    <text fill="#6C757D" fontFamily="'IBM Plex Mono', monospace" fontSize="10.5" x="10" y="0">SHA-256:</text>
                    <text fill="#CED4DA" fontFamily="'IBM Plex Mono', monospace" fontSize="10.5" fontWeight="600" x="70" y="0">0x9b2d...e017</text>
                  </g>
                  <g className="proof-pulse" transform="translate(296, 8)">
                    <rect fill="#0F182A" height="22" rx="2" stroke="#C5A880" strokeWidth="0.8" width="176" x="0" y="0"></rect>
                    <path d="M 12 11 L 12 9.5 C 12 7.5 13.5 6 15.5 6 C 17.5 6 19 7.5 19 9.5 L 19 11 M 10 11 L 21 11 L 21 17 L 10 17 Z" fill="none" stroke="#C5A880" strokeLinejoin="round" strokeWidth="1"></path>
                    <text fill="#E5C79E" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="700" letterSpacing="0.08em" x="26" y="14.5">MATHEMATICAL PROOF SEALED</text>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-y border-outline-dim/60 bg-aegean-deep/40 py-12">
        <div className="landing-container flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="font-mono text-[11px] tracking-ultra text-bronze-muted uppercase">Architected for Sovereign Funds &amp; Institutional Allocation Committees</span>
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Sample Reference Standards</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-sm hover-glow group cursor-default">
              <span className="font-display text-xl sm:text-2xl tracking-widest text-text-secondary group-hover:text-bronze transition-colors">CARLYLE</span>
              <span className="font-mono text-[9px] text-text-muted mt-2 tracking-widest uppercase">Benchmark Cohort</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-sm hover-glow group cursor-default">
              <span className="font-display text-xl sm:text-2xl tracking-widest text-text-secondary group-hover:text-bronze transition-colors">SEQUOIA</span>
              <span className="font-mono text-[9px] text-text-muted mt-2 tracking-widest uppercase">Growth Heritage</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-sm hover-glow group cursor-default">
              <span className="font-display text-xl sm:text-2xl tracking-widest text-text-secondary group-hover:text-bronze transition-colors">TEMASEK</span>
              <span className="font-mono text-[9px] text-text-muted mt-2 tracking-widest uppercase">Sovereign Standard</span>
            </div>
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-sm hover-glow group cursor-default">
              <span className="font-display text-xl sm:text-2xl tracking-widest text-text-secondary group-hover:text-bronze transition-colors">WARBURG</span>
              <span className="font-mono text-[9px] text-text-muted mt-2 tracking-widest uppercase">Institutional PE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 lg:py-20 relative" id="terminal-sandbox">
        <div className="landing-container flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="font-mono text-xs tracking-ultra text-bronze uppercase">Deterministic Proof Terminal</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-text-primary">Live Reconciliation Sandbox</h2>
            <p className="font-sans text-base text-text-secondary font-light">Simulate real-time ingestion of confidential data rooms matched directly against verified bank ledgers and merchant clearance rails.</p>
          </div>
          <div className="glass-panel rounded-sm border border-outline-dim shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-aegean-deep/90 border-b border-outline-dim px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-terra-alert"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-bronze"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-olive-truth"></span>
                <span className="font-mono text-xs text-text-secondary ml-3 tracking-wide">CHR-AUDIT-2026-9042 // TARGET: PROXIMA GLOBAL LOGISTICS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-terra-alert/15 border border-terra-alert/30 font-mono text-[10px] text-terra-light font-medium tracking-wider uppercase">Delta Detected: -₹96,00,000 Run-Rate</span>
              </div>
            </div>
            <div className="bg-aegean-dark/70 px-6 py-3 border-b border-outline-dim/70 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <button 
                  className={`font-mono text-xs pb-1 transition-all ${activeTab === 'financials' ? 'text-bronze border-b-2 border-bronze' : 'text-text-muted hover:text-text-secondary'}`}
                  onClick={() => setActiveTab('financials')}
                >
                  01. FINANCIAL_INVARIANCE
                </button>
                <button 
                  className={`font-mono text-xs pb-1 transition-all ${activeTab === 'ledger' ? 'text-bronze border-b-2 border-bronze' : 'text-text-muted hover:text-text-secondary'}`}
                  onClick={() => setActiveTab('ledger')}
                >
                  02. LEDGER_CROSSCHECK_HASH
                </button>
                <button 
                  className={`font-mono text-xs pb-1 transition-all ${activeTab === 'legal' ? 'text-bronze border-b-2 border-bronze' : 'text-text-muted hover:text-text-secondary'}`}
                  onClick={() => setActiveTab('legal')}
                >
                  03. CONTRACT_AFFIDAVITS
                </button>
              </div>
              <span className="font-mono text-[11px] text-text-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-olive-truth rounded-full"></span>PROOF LATENCY: 0.18ms | DETERMINISTIC ENCLAVE
              </span>
            </div>
            <div className="p-6 lg:p-8 bg-aegean-deep/40 border-b border-outline-dim">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <span className="font-mono text-xs tracking-wider text-text-secondary uppercase">ARR Trajectory Discrepancy Map (Reported Deck Claim vs. Reconciled Bank Stream)</span>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-terra-light">
                    <span className="w-2.5 h-0.5 bg-terra-alert"></span> Deck Assertion
                  </span>
                  <span className="flex items-center gap-1.5 text-olive-light">
                    <span className="w-2.5 h-0.5 bg-olive-truth"></span> Reconciled Ground Truth
                  </span>
                </div>
              </div>
              <div className="w-full">
                <TrajectoryChart
                  height={256}
                  yLabels={["₹0.5 Cr", "₹1.5 Cr", "₹2.5 Cr"]}
                  xLabels={["Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
                  series={[
                    { label: "Deck Assertion", color: "#B85D3B", dashed: true, points: [2.1, 2.4, 2.5, 2.6, 2.7, 2.8] },
                    { label: "Reconciled Ground Truth", color: "#4A7C59", points: [1.1, 1.2, 1.44, 1.5, 1.55, 1.6] },
                  ]}
                />
              </div>
            </div>
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-aegean-dark/50" style={{ opacity: isVerifying ? 0.35 : 1, transition: 'opacity 0.3s' }}>
              <div className="glass-panel p-6 rounded-sm border border-outline-dim flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-dim">
                    <div className="flex items-center gap-2 text-terra-light font-mono text-xs tracking-wider uppercase">
                      <span className="material-symbols-outlined text-base">description</span>
                      <span className="">Pitch Deck Claims [Series B Pack]</span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted uppercase">Page 14 // Unverified</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-aegean-deep/70 border border-outline-dim/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-muted font-sans">Claimed Annual Recurring Revenue (ARR)</div>
                        <div className="text-2xl font-mono font-medium text-text-primary mt-1">₹ 2,40,00,000</div>
                      </div>
                      <span className="px-2 py-1 bg-terra-alert/20 border border-terra-alert/30 text-terra-light font-mono text-[10px] tracking-wider uppercase">Unsupported</span>
                    </div>
                    <div className="p-4 bg-aegean-deep/70 border border-outline-dim/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-muted font-sans">July Recognized Monthly Run-Rate</div>
                        <div className="text-2xl font-mono font-medium text-text-primary mt-1">₹ 17,00,000</div>
                      </div>
                      <span className="px-2 py-1 bg-terra-alert/20 border border-terra-alert/30 text-terra-light font-mono text-[10px] tracking-wider uppercase">Variance +30.7%</span>
                    </div>
                    <div className="p-4 bg-aegean-deep/70 border border-outline-dim/60">
                      <div className="text-xs text-text-muted font-sans">Reported Net Revenue Retention (NRR)</div>
                      <div className="text-base font-mono text-text-primary mt-1">128.4% (Zero Reported Enterprise Churn)</div>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-text-muted border-t border-outline-dim/60 pt-3">
                  Source digest: Deck_Final_Exec.pdf (MD5: 39a441e8c0) parsed through deterministic parser.
                </div>
              </div>
              <div className="glass-panel p-6 rounded-sm border border-olive-truth/30 bg-aegean-card/40 flex flex-col justify-between gap-6 shadow-glow-olive">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-olive-truth/20">
                    <div className="flex items-center gap-2 text-olive-light font-mono text-xs tracking-wider uppercase">
                      <span className="material-symbols-outlined text-base">account_balance</span>
                      <span className="">Chrimata Invariance Ledger</span>
                    </div>
                    <span className="font-mono text-[10px] text-olive-truth bg-olive-truth/10 border border-olive-truth/20 px-2 py-0.5 uppercase">Direct Multi-Sig API Feed</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-aegean-dark/60 border border-olive-truth/20 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-muted font-sans">Reconciled Actual Invoiced ARR</div>
                        <div className="text-2xl font-mono font-semibold text-bronze mt-1">₹ 1,44,00,000</div>
                      </div>
                      <span className="px-2 py-1 bg-terra-alert/20 text-terra-light font-mono text-[10px] tracking-wider uppercase font-semibold">Delta: -₹96L</span>
                    </div>
                    <div className="p-4 bg-aegean-dark/60 border border-olive-truth/20 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-muted font-sans">July Actual Inflows (Receipts Net of GST)</div>
                        <div className="text-2xl font-mono font-semibold text-bronze mt-1">₹ 13,00,000</div>
                      </div>
                      <span className="px-2 py-1 bg-terra-alert/20 text-terra-light font-mono text-[10px] tracking-wider uppercase">Churn: ₹4,00,000</span>
                    </div>
                    <div className="p-4 bg-aegean-dark/60 border border-olive-truth/20">
                      <div className="text-xs text-text-muted font-sans">Deterministic Forensic Flag</div>
                      <div className="text-sm font-mono text-text-primary mt-1">Enterprise account #8812 (Titan Freight) terminated June 28. Revenue claimed without clearing escrow.</div>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-olive-truth flex items-center gap-2 border-t border-olive-truth/20 pt-3">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="">Cryptographic Proof: 0x4f128e0bb629... Verified via Institutional Multi-Sig Rail</span>
                </div>
              </div>
            </div>
            <div className="bg-aegean-deep/90 border-t border-outline-dim px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 font-mono text-xs text-text-secondary">
                <span className="material-symbols-outlined text-bronze text-base">balance</span>
                <span className="">AUDIT STATUS: <strong className="text-terra-light font-normal">MATERIAL DISCREPANCY VERIFIED</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 border border-outline-soft/80 text-text-secondary hover:text-text-primary hover:border-bronze/50 font-mono text-xs tracking-wider uppercase transition-all" onClick={() => alert('Exporting forensic audit dossier in PDF/A-3 and cryptographic ledger bundle.')}>
                  Export Dossier (PDF/A-3)
                </button>
                <button className="px-4 py-2 bg-bronze text-aegean-dark hover:bg-bronze-hover font-mono text-xs font-semibold tracking-wider uppercase transition-all shadow-glow-bronze" onClick={handleVerify}>
                  Re-Verify Cryptographic Hash
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-14 lg:py-16 border-t border-outline-dim/60">
        <div className="landing-container glass-panel p-8 lg:p-12 flex flex-col lg:flex-row gap-10 items-center justify-between rounded-sm border border-outline-dim/70 shadow-2xl">
          <div className="flex flex-col gap-4 max-w-xl">
            <span className="font-mono text-xs tracking-ultra text-bronze uppercase">Zero-Drift Architecture</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary leading-tight">
              Absolute zero-trust execution. <span className="italic text-bronze font-light">No hallucinated EBITDA</span>.
            </h2>
            <p className="font-sans text-base text-text-secondary leading-relaxed font-light">
              Traditional diligence requires 4 to 6 weeks, relying on curated data rooms and self-reported spreadsheets. Chrimata replaces blind optimism with deterministic mathematical validation directly against bank rails, API logs, and legal notary registers.
            </p>
            <div className="pt-2 flex items-center gap-6 font-mono text-xs text-text-muted">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-olive-truth rounded-full"></span> 100% Invariant
              </span>
              <span className="">•</span>
              <span className="">Zero Training Weight Retention</span>
            </div>
          </div>
          <div className="w-full lg:w-[440px] shrink-0 relative p-1.5 rounded bg-aegean-dark/90 border border-outline-dim/70 shadow-2xl hover-glow">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-bronze/10 via-transparent to-olive-truth/10 rounded pointer-events-none"></div>
            <div className="relative overflow-hidden rounded bg-[#070C14]">
              <div className="w-full aspect-[520/440] bg-[#070C14] p-6 sm:p-8 flex flex-col justify-between font-mono relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-outline-dim pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-olive-truth status-pulse"></span>
                    <span className="text-[11px] text-bronze uppercase tracking-wider font-semibold">HARDWARE ENCLAVE ATTESTATION</span>
                  </div>
                  <span className="text-[10px] text-text-muted">ISOLATION: HW-SEC-V2</span>
                </div>
                <div className="my-auto space-y-4">
                  <div className="p-3.5 bg-aegean-deep/80 border border-outline-dim/70 rounded flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase">Nitro Secure Enclave</div>
                      <div className="text-xs text-text-primary mt-0.5 font-semibold">PCR0: e837...4901b0</div>
                    </div>
                    <span className="text-olive-light text-[10px] px-2 py-0.5 bg-olive-truth/10 border border-olive-truth/20 rounded">SEALED</span>
                  </div>
                  <div className="p-3.5 bg-aegean-deep/80 border border-outline-dim/70 rounded flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase">Deterministic Reconciliation</div>
                      <div className="text-xs text-text-primary mt-0.5 font-semibold">Memory Isolation Active</div>
                    </div>
                    <span className="text-bronze text-[10px] px-2 py-0.5 bg-bronze/10 border border-bronze/25 rounded">0.00% DRIFT</span>
                  </div>
                  <div className="p-3.5 bg-aegean-deep/80 border border-outline-dim/70 rounded flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase">Cryptographic Hash State</div>
                      <div className="text-xs text-text-primary mt-0.5 font-semibold">SHA-256 Verified</div>
                    </div>
                    <span className="text-olive-light text-[10px] px-2 py-0.5 bg-olive-truth/10 border border-olive-truth/20 rounded">INVARIANT</span>
                  </div>
                </div>
                <div className="border-t border-outline-dim pt-3 flex items-center justify-between text-[10px] text-text-muted">
                  <span className="">ZERO AMBIENT LEAKAGE</span>
                  <span className="text-olive-truth flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span> ATTESTED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 lg:py-20 bg-aegean-dark/40">
        <div className="landing-container flex flex-col gap-10">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="font-mono text-xs tracking-ultra text-bronze uppercase">Fiduciary Pillars</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary">The Veracity Triad</h2>
            <p className="font-sans text-base text-text-secondary font-light">Three non-negotiable security layers ensuring no unverified narrative enters the investment committee memorandum.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="glass-panel p-6 lg:p-8 rounded-sm hover-glow flex flex-col justify-between gap-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-sm bg-aegean-surface border border-outline-dim flex items-center justify-center text-bronze group-hover:border-bronze/50 transition-colors">
                  <span className="material-symbols-outlined text-2xl">account_tree</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-bronze-muted tracking-widest uppercase">Pillar 01</span>
                  <h3 className="font-display text-xl text-text-primary mt-1 group-hover:text-bronze transition-colors">Real-Time Claim Invariance</h3>
                </div>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">Every sentence in an investment deck is atomized into standalone assertions. Each claim is cryptographically bound and reconciled against historical filings to isolate narrative drift.</p>
              </div>
              <div className="p-3.5 bg-aegean-dark border border-outline-dim font-mono text-[11px] space-y-1.5 text-text-muted">
                <div className="text-olive-light">HASH // e3b0c44298fc1c...</div>
                <div className="text-text-secondary">CLAIM: ₹2.40 Cr ARR [DECL-P14]</div>
                <div className="text-terra-light font-medium">INVARIANCE: FAILED (-₹96L)</div>
              </div>
            </div>
            <div className="glass-panel p-6 lg:p-8 rounded-sm hover-glow flex flex-col justify-between gap-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-sm bg-aegean-surface border border-outline-dim flex items-center justify-center text-bronze group-hover:border-bronze/50 transition-colors">
                  <span className="material-symbols-outlined text-2xl">sync_alt</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-bronze-muted tracking-widest uppercase">Pillar 02</span>
                  <h3 className="font-display text-xl text-text-primary mt-1 group-hover:text-bronze transition-colors">Continuous Ledger Reconciliation</h3>
                </div>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">Automated deterministic cross-check between payment processors, multi-currency banking feeds, GST e-invoices, and management accounts. Identifies hidden churn and phantom revenue.</p>
              </div>
              <div className="p-3.5 bg-aegean-dark border border-outline-dim font-mono text-[11px] space-y-1.5 text-text-muted">
                <div className="flex justify-between text-text-secondary">
                  <span className="">DISCREPANCY HISTOGRAM</span>
                  <span className="text-terra-light">-40.0%</span>
                </div>
                <div className="h-2 w-full bg-aegean-surface overflow-hidden flex">
                  <div className="h-full bg-terra-alert w-[40%]"></div>
                  <div className="h-full bg-olive-truth w-[60%]"></div>
                </div>
                <div className="flex justify-between text-[9px] text-text-muted pt-1">
                  <span className="">UNVERIFIED CLAIM</span>
                  <span className="text-olive-light">AUDITED REALITY</span>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 lg:p-8 rounded-sm hover-glow flex flex-col justify-between gap-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-sm bg-aegean-surface border border-outline-dim flex items-center justify-center text-bronze group-hover:border-bronze/50 transition-colors">
                  <span className="material-symbols-outlined text-2xl">security</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-bronze-muted tracking-widest uppercase">Pillar 03</span>
                  <h3 className="font-display text-xl text-text-primary mt-1 group-hover:text-bronze transition-colors">Air-Gapped Sovereign Enclaves</h3>
                </div>
                <p className="font-sans text-sm text-text-secondary leading-relaxed font-light">Zero public foundation model training. Analysis runs inside cryptographic hardware enclaves (AWS Nitro / Intel SGX) with strict physical and sovereign data segregation.</p>
              </div>
              <div className="p-3.5 bg-aegean-dark border border-outline-dim font-mono text-[11px] space-y-1.5 text-text-muted">
                <div className="flex justify-between">
                  <span className="">SOC-2 TYPE II:</span>
                  <span className="text-olive-light">VERIFIED</span>
                </div>
                <div className="flex justify-between">
                  <span className="">WEIGHT RETENTION:</span>
                  <span className="text-bronze">0.00% (STRICT)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 lg:py-20 border-t border-outline-dim/60 bg-aegean-deep/30">
        <div className="landing-container flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs tracking-ultra text-bronze uppercase">Diagnostic Comparison</span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary">Traditional Diligence vs. Chrimata</h2>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-aegean-dark border border-outline-dim rounded-sm">
              <button className={`px-4 py-2 font-mono text-xs transition-all ${metric === 'time' ? 'text-aegean-dark bg-bronze font-medium' : 'text-text-secondary hover:text-text-primary'}`} onClick={() => setMetric('time')}>
                VELOCITY
              </button>
              <button className={`px-4 py-2 font-mono text-xs transition-all ${metric === 'error' ? 'text-aegean-dark bg-bronze font-medium' : 'text-text-secondary hover:text-text-primary'}`} onClick={() => setMetric('error')}>
                PRECISION
              </button>
              <button className={`px-4 py-2 font-mono text-xs transition-all ${metric === 'cost' ? 'text-aegean-dark bg-bronze font-medium' : 'text-text-secondary hover:text-text-primary'}`} onClick={() => setMetric('cost')}>
                LIABILITY
              </button>
            </div>
          </div>
          <div className="glass-panel overflow-hidden border border-outline-dim rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-aegean-deep/80 border-b border-outline-dim font-mono text-[11px] text-text-muted uppercase tracking-wider">
                    <th className="p-5 font-normal">Diligence Dimension</th>
                    <th className="p-5 font-normal text-text-secondary">Traditional Manual Advisory</th>
                    <th className="p-5 font-medium text-bronze bg-aegean-surface/60">Chrimata Deterministic Protocol</th>
                    <th className="p-5 font-normal text-right">Advantage Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-dim/50 text-sm">
                  <tr className="hover:bg-aegean-deep/50 transition-colors">
                    <td className="p-5 font-medium text-text-primary">Financial Ledger Audit</td>
                    <td className="p-5 text-text-secondary font-light">Manual spreadsheet spot-checks; 10-15% sample size over 3 weeks.</td>
                    <td className="p-5 font-mono text-xs text-bronze bg-aegean-surface/40">100% full-corpus deterministic match in &lt; 4 seconds.</td>
                    <td className="p-5 text-right font-mono text-xs text-olive-light font-medium">+100x Coverage</td>
                  </tr>
                  <tr className="hover:bg-aegean-deep/50 transition-colors">
                    <td className="p-5 font-medium text-text-primary">Discrepancy Identification</td>
                    <td className="p-5 text-text-secondary font-light">Subject to curated VDR uploads and qualitative email queries.</td>
                    <td className="p-5 font-mono text-xs text-bronze bg-aegean-surface/40">Immediate contradiction flag across contracts &amp; bank lines.</td>
                    <td className="p-5 text-right font-mono text-xs text-olive-light font-medium">Real-time</td>
                  </tr>
                  <tr className="hover:bg-aegean-deep/50 transition-colors">
                    <td className="p-5 font-medium text-text-primary">IC Auditability &amp; Liability</td>
                    <td className="p-5 text-text-secondary font-light">Static 80-page subjective PDF prone to narrative optimism.</td>
                    <td className="p-5 font-mono text-xs text-bronze bg-aegean-surface/40">Interactive ledger bundle with zero-knowledge math proofs.</td>
                    <td className="p-5 text-right font-mono text-xs text-olive-light font-medium">Zero Ambiguity</td>
                  </tr>
                  <tr className="hover:bg-aegean-deep/50 transition-colors">
                    <td className="p-5 font-medium text-text-primary">Turnaround Latency</td>
                    <td className="p-5 text-text-secondary font-light">28 to 45 business days per corporate transaction.</td>
                    <td className="p-5 font-mono text-xs text-bronze bg-aegean-surface/40">Continuous live feed; provisional verdict in 24 hours.</td>
                    <td className="p-5 text-right font-mono text-xs text-olive-light font-medium">94% Latency Drop</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-sm border border-outline-dim flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-aegean-surface border border-outline-dim flex items-center justify-center text-bronze">
                <span className="material-symbols-outlined text-2xl">speed</span>
              </div>
              <div>
                <div className="font-display text-lg text-text-primary">{metricData?.title}</div>
                <div className="font-sans text-sm text-text-secondary font-light">{metricData?.desc}</div>
              </div>
            </div>
            <div className="font-mono text-2xl lg:text-3xl text-bronze font-semibold">{metricData?.stat}</div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 lg:py-20 border-t border-outline-dim/60">
        <div className="landing-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 h-80 bg-aegean-deep relative rounded-sm overflow-hidden border border-outline-dim shadow-2xl group">
            <Image fill unoptimized sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover mix-blend-luminosity opacity-75 group-hover:scale-105 transition-all duration-700" alt="Monochrome photograph of an institutional investment committee boardroom overlooking an architectural skyline at dusk." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA158lpT_3xMtsktxJ8QjGiJP7Yyh7vj42fCno2v6fcgRWghltVPigO8uagxgfH0NsithpBT0uibBY_EuDLGsm_DV-kXSV_uXH6zlCuw6a6sZqFAa_zGcqHj_RWMlKiW4Wc8-fOoLHCFz8Vw52Tvs_HqBjBK1jzki5B0148AcJZWG_DPLH6kfDhv59qegRX7VKpp8vasWjjoMlgIO5YqVGKAIUW7PQk-XLLFmOmgY7yGXs4BB2w3hkq" />
            <div className="absolute inset-0 bg-gradient-to-t from-aegean-dark/95 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between font-mono text-[11px] text-text-primary bg-aegean-dark/80 px-4 py-2 border border-outline-dim backdrop-blur-sm">
              <span className="">INVESTMENT COMMITTEE VAULT</span>
              <span className="text-olive-light flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-truth"></span> AUTHENTICATED
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="space-y-3">
              <span className="font-mono text-xs tracking-ultra text-bronze uppercase">Fiduciary Safeguard</span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary leading-tight">
                Engineered for the final <span className="italic font-light text-bronze">Investment Committee</span> memo.
              </h2>
              <p className="font-sans text-base text-text-secondary leading-relaxed font-light">
                When deploying ₹500 Cr or acquiring cross-border logistics infrastructures, fiduciary liability cannot hinge on unaudited slide decks. Chrimata empowers General Partners and Managing Directors to demand verifiable proof hashes before wires leave escrow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="glass-panel p-6 rounded-sm border border-outline-dim">
                <div className="font-mono text-3xl lg:text-4xl text-text-primary font-medium">100%</div>
                <div className="font-sans text-xs text-text-secondary mt-2 font-light">Mathematical proof coverage across all target billing logs.</div>
              </div>
              <div className="glass-panel p-6 rounded-sm border border-outline-dim">
                <div className="font-mono text-3xl lg:text-4xl text-bronze font-medium">Zero</div>
                <div className="font-sans text-xs text-text-secondary mt-2 font-light">Model hallucinations or synthetic data contamination.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 lg:py-20 border-t border-outline-dim/60 bg-aegean-dark relative" id="request-access">
        <div className="landing-container">
        <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-sm border border-bronze/25 shadow-2xl relative">
          <div className="flex flex-col gap-3 mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-bronze font-mono text-xs tracking-widest uppercase">
              <span className="w-2 h-2 bg-bronze rotate-45 inline-block"></span>Restricted Sovereign Admission
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-text-primary">Request Institutional Access</h2>
            <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
              Admittance to Chrimata deterministic clusters is restricted to qualified private equity funds, sovereign allocators, and accredited corporate M&amp;A advisory desks.
            </p>
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-wider text-text-muted uppercase">Official Full Name</label>
              <input className="w-full bg-aegean-dark/90 border border-outline-dim focus:border-bronze px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 font-sans focus:outline-none transition-colors rounded-none" placeholder="Partner Alistair Sterling" required type="text" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-wider text-text-muted uppercase">Institutional Email Address</label>
              <input className="w-full bg-aegean-dark/90 border border-outline-dim focus:border-bronze px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 font-sans focus:outline-none transition-colors rounded-none" placeholder="a.sterling@sovereign-holdings.ch" required type="email" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-wider text-text-muted uppercase">Fund / Institution Name</label>
              <input className="w-full bg-aegean-dark/90 border border-outline-dim focus:border-bronze px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 font-sans focus:outline-none transition-colors rounded-none" placeholder="Sterling Heritage Partners LLP" required type="text" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-wider text-text-muted uppercase">Estimated AUM / Asset Class Focus</label>
              <select className="w-full bg-aegean-dark/90 border border-outline-dim focus:border-bronze px-4 py-3 text-sm text-text-primary font-sans focus:outline-none transition-colors rounded-none">
                <option>&gt; $1B+ PE Buyout / Growth Capital</option>
                <option>$250M - $1B Mid-Market Institutional</option>
                <option>Sovereign Wealth / State Pension Fund</option>
                <option>Cross-Border Corporate M&amp;A Strategy</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="block font-mono text-[10px] tracking-wider text-text-muted uppercase">Mandate Context or Target Asset Scale</label>
              <textarea className="w-full bg-aegean-dark/90 border border-outline-dim focus:border-bronze px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 font-sans focus:outline-none transition-colors resize-none rounded-none" placeholder="Provide confidential context on upcoming diligence cycle or platform integration mandate..." rows={3}></textarea>
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="w-4 h-4 bg-aegean-dark border-outline-dim text-bronze focus:ring-0 rounded-none" required type="checkbox" />
                <span className="font-mono text-[11px] text-text-muted">Acknowledge strict mutual NDA and zero-trust protocol.</span>
              </label>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-bronze text-aegean-dark font-sans text-xs font-semibold tracking-wider uppercase hover:bg-bronze-hover transition-all shadow-glow-bronze" type="submit">
                Submit Sovereign Verification Request
              </button>
            </div>
          </form>
          {formSubmitted && (
            <div className="mt-6 p-4 bg-aegean-dark border border-olive-truth/50 font-mono text-xs text-olive-light">
              REQUEST SUBMITTED. ENCRYPTED TICKET ISSUED TO PARTNER DESK. VERIFICATION DISPATCH WITHIN 4 HOURS.
            </div>
          )}
        </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
