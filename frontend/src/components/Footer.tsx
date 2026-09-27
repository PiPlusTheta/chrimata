import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-full bg-aegean-dark pt-24 pb-8 border-t border-outline-dim/60 flex flex-col items-center overflow-hidden">
      
      {/* 6-Column Navigation Container */}
      <div className="landing-container relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-16 mb-32">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Platform</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Overview</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Architecture</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Security Model</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Diligence Engine</Link>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Solutions</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Investing</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Banking</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Legal</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Corporate</Link>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Company</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">About</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Careers</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Blog</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Research</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">More Resources</Link>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Policies</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Privacy</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Data Processing</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Fair Use</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Terms of Service</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Cookie Preferences</Link>
        </div>

        {/* Column 5 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Follow Us</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">LinkedIn</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">X</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">YouTube</Link>
        </div>

        {/* Column 6 */}
        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-[9px] text-text-muted/70 tracking-[0.2em] uppercase mb-1">Contact</h4>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Request a demo</Link>
          <Link href="#" className="font-sans text-[11px] text-text-secondary hover:text-bronze transition-colors">Partner with us</Link>
        </div>

      </div>

      {/* Giant Wordmark */}
      <div className="relative w-full flex justify-center items-end pointer-events-none select-none overflow-hidden mt-12 pt-4">
        <h2 
          className="font-sans font-black text-center uppercase"
          style={{ 
            fontSize: '19.5vw', /* A bit wider to perfectly kiss the edges */
            whiteSpace: 'nowrap',
            letterSpacing: '-0.05em', /* Slightly tighter tracking */
            lineHeight: 0.85, /* Tight but prevents top cropping */
            margin: 0,
            padding: 0,
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transform: 'scaleY(1.05)', /* Subtle vertical presence */
            transformOrigin: 'bottom center',
          }}
        >
          CHRIMATA
        </h2>
      </div>

      {/* Bottom Copyright Bar - Positioned precisely at bottom-center over the faded text */}
      <div className="absolute bottom-6 z-10 w-full flex justify-center items-center px-6">
        <div className="font-display text-[9px] text-text-muted/60 tracking-[0.15em] uppercase text-center">
          COPYRIGHT © 2026 CHRIMATA. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
