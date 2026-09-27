import Link from "next/link";
import { ROUTES } from "../routes";
import { Footer } from "../components/Footer";

export default function LandingPage() {
  return <>
    <header className="sticky top-0 z-50 border-b border-outline-dim bg-aegean-dark/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        <Link href={ROUTES.home} className="flex items-center gap-3 font-display text-base font-semibold tracking-wide text-text-primary"><span className="inline-block h-2.5 w-2.5 rotate-45 bg-bronze" />CHRIMATA</Link>
        <Link href={ROUTES.queue} className="border border-bronze/40 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-bronze transition-colors hover:border-bronze hover:bg-bronze/10">Open Terminal</Link>
      </div>
    </header>
    <main>
      <section className="relative overflow-hidden border-b border-outline-dim bg-aegean-dark px-6 py-24 lg:px-12 lg:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(197,168,128,.08),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7"><p className="mb-5 font-mono text-xs uppercase tracking-[.2em] text-bronze">Institutional Diligence Terminal</p><h1 className="max-w-3xl font-display text-5xl font-light leading-[1.08] tracking-tight text-text-primary md:text-7xl">Evidence before conviction.</h1><p className="mt-7 max-w-2xl text-base leading-relaxed text-text-secondary">Chrimata brings source documents, financial calculations, claim discrepancies, and analyst review into one verifiable diligence workspace.</p><div className="mt-10 flex flex-wrap gap-3"><Link href={ROUTES.queue} className="inline-flex items-center justify-center bg-bronze px-7 py-3 text-sm font-semibold text-aegean-dark transition-colors hover:bg-bronze-hover">Open Review Queue</Link><Link href={ROUTES.ask} className="inline-flex items-center justify-center border border-outline-soft px-7 py-3 text-sm text-text-primary transition-colors hover:border-bronze">Ask Chrimata</Link></div></div>
          <div className="lg:col-span-5"><div className="rounded-xl border border-outline-dim bg-aegean-card p-6 shadow-2xl"><div className="mb-6 flex items-center gap-2 border-b border-outline-dim pb-4 font-mono text-[10px] uppercase tracking-wider text-text-muted"><span className="h-1.5 w-1.5 rounded-full bg-olive-truth" />Current workflow</div><div className="space-y-5"><div><div className="font-display text-xl text-text-primary">Queue & Intake</div><p className="mt-1 text-xs text-text-secondary">Review the current mandate and its live evidence.</p></div><div className="border-t border-outline-dim pt-5"><div className="font-display text-xl text-text-primary">Diligence Matrix</div><p className="mt-1 text-xs text-text-secondary">Inspect calculations, issues, and source documents.</p></div><div className="border-t border-outline-dim pt-5"><div className="font-display text-xl text-text-primary">Ask Chrimata</div><p className="mt-1 text-xs text-text-secondary">Investigate the current deal with persisted, evidence-aware conversations.</p></div></div></div></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1400px] gap-6 px-6 py-20 md:grid-cols-3 lg:px-12"><div className="border border-outline-dim bg-aegean-card p-6"><h2 className="font-display text-2xl text-text-primary">Source custody</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">Register and inspect the documents behind a diligence finding.</p></div><div className="border border-outline-dim bg-aegean-card p-6"><h2 className="font-display text-2xl text-text-primary">Calculated metrics</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">Keep financial calculations distinct from unverified claims.</p></div><div className="border border-outline-dim bg-aegean-card p-6"><h2 className="font-display text-2xl text-text-primary">Analyst review</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">Record decisions and revisit open issues as evidence changes.</p></div></section>
    </main>
    <Footer />
  </>;
}
