import Link from "next/link";
import { ROUTES } from "../routes";

export function Footer() {
  return <footer className="border-t border-outline-dim bg-aegean-dark px-6 py-10 lg:px-12"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4"><span className="font-display text-lg tracking-wide text-text-primary">CHRIMATA</span><nav aria-label="Footer" className="flex flex-wrap gap-5 text-xs text-text-secondary"><Link href={ROUTES.queue} className="hover:text-bronze">Review Queue</Link><Link href={ROUTES.diligence} className="hover:text-bronze">Diligence</Link><Link href={ROUTES.evidence} className="hover:text-bronze">Evidence</Link><Link href={ROUTES.ask} className="hover:text-bronze">Ask Chrimata</Link></nav><span className="font-mono text-[10px] text-text-muted">© 2026 Chrimata</span></div></footer>;
}
