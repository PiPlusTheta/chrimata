import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

function classes(...items: (string | undefined | false)[]) { return items.filter(Boolean).join(" "); }

export function PageHeader({ eyebrow, title, description, actions, children }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return <section className="dashboard-page-header"><div className="min-w-0 space-y-1.5">{eyebrow && <div className="font-mono text-[10px] uppercase tracking-wider text-outline">{eyebrow}</div>}<h1 className="font-headline text-3xl font-light tracking-tight text-on-surface md:text-4xl">{title}</h1>{description && <p className="max-w-2xl text-xs leading-relaxed text-on-surface-variant md:text-sm">{description}</p>}{children}</div>{actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}</section>;
}

export function Panel({ children, className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={classes("dashboard-panel", className)} {...props}>{children}</section>;
}

export function StatCard({ label, value, icon, status, footer, className }: { label: ReactNode; value: ReactNode; icon?: ReactNode; status?: ReactNode; footer?: ReactNode; className?: string }) {
  return <div className={classes("dashboard-stat-card", className)}><div className="flex items-center justify-between gap-3 text-outline"><span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>{icon}</div><div className="my-4 flex items-baseline justify-between gap-3"><div className="font-headline text-4xl font-light text-on-surface">{value}</div>{status}</div>{footer && <div className="flex items-center justify-between gap-2 border-t border-hairline pt-3 text-xs text-on-surface-variant">{footer}</div>}</div>;
}

export function StatusBadge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "accent"; className?: string }) {
  return <span className={classes("dashboard-status-badge", `dashboard-status-${tone}`, className)}>{children}</span>;
}

export function Button({ variant = "secondary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  return <button className={classes("dashboard-button", `dashboard-button-${variant}`, className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={classes("dashboard-input", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={classes("dashboard-input", className)} {...props} />;
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={classes("dashboard-filter-bar", className)}>{children}</section>;
}

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return <div className="w-full overflow-x-auto"><table className={classes("dashboard-data-table", className)}>{children}</table></div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="dashboard-empty-state"><div className="font-headline text-lg text-on-surface">{title}</div>{description && <p className="mt-1 text-xs text-on-surface-variant">{description}</p>}</div>;
}

export function Modal({ children, onClose, className }: { children: ReactNode; onClose: () => void; className?: string }) {
  return <div className="dashboard-modal-backdrop" onMouseDown={onClose} role="presentation"><div role="dialog" aria-modal="true" className={classes("dashboard-modal", className)} onMouseDown={e => e.stopPropagation()}>{children}</div></div>;
}
