"use client";

import { useEffect } from "react";
import { Warning2 } from "iconsax-react";
import { Button, Panel } from "../../components/dashboard/ui";

// Next.js App Router error boundary for everything under /dashboard. Without
// this file, an unhandled render-time exception in any dashboard route (e.g. a
// malformed issue.history array) falls through to Next's default error screen
// instead of staying inside the app's own chrome.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Panel className="max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent-border bg-accent-surface text-terra-light">
          <Warning2 size={22} variant="Linear" color="currentColor" />
        </div>
        <h2 className="font-headline text-xl text-on-surface">Something went wrong on this page</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {error.message || "An unexpected error interrupted this view."} The rest of the dashboard is unaffected.
        </p>
        {error.digest && <p className="mt-2 font-mono text-[10px] text-outline">Reference: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => reset()}>Try again</Button>
          <Button variant="secondary" onClick={() => { window.location.href = "/"; }}>Return home</Button>
        </div>
      </Panel>
    </div>
  );
}
