"use client";

import { motion } from "framer-motion";

type Series = {
  label: string;
  color: string; // hex
  points: number[]; // arbitrary units, will be normalized to the chart height
  dashed?: boolean;
};

/**
 * A small, dependency-free animated line chart (gradient fill + draw-in stroke
 * animation via framer-motion). Used on both the landing page and the real
 * dashboard so the two share one literal visual language, not just a palette.
 */
export function TrajectoryChart({
  series,
  yLabels,
  xLabels,
  height = 220,
}: {
  series: Series[];
  yLabels: string[];
  xLabels: string[];
  height?: number;
}) {
  const width = 800;
  const padTop = 20;
  const padBottom = 30;
  const chartH = height - padTop - padBottom;
  const allValues = series.flatMap((s) => s.points);
  const max = Math.max(...allValues) * 1.08;
  const min = Math.min(0, Math.min(...allValues));

  const toXY = (points: number[]) =>
    points.map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = padTop + chartH - ((v - min) / (max - min || 1)) * chartH;
      return [x, y] as const;
    });

  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
        {yLabels.map((label, i) => {
          const y = padTop + (i / (yLabels.length - 1)) * chartH;
          return (
            <g key={label}>
              <line x1={0} x2={width} y1={y} y2={y} stroke="#202E47" strokeWidth={1} />
              <text x={0} y={y - 6} fill="#60718A" fontFamily="IBM Plex Mono, monospace" fontSize={10}>
                {label}
              </text>
            </g>
          );
        })}
        {xLabels.map((label, i) => (
          <text
            key={label}
            x={(i / (xLabels.length - 1)) * width}
            y={height - 6}
            fill="#60718A"
            fontFamily="IBM Plex Mono, monospace"
            fontSize={10}
          >
            {label}
          </text>
        ))}

        {series.map((s) => {
          const pts = toXY(s.points);
          const linePath = toPath(pts);
          const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${padTop + chartH} L ${pts[0][0]} ${padTop + chartH} Z`;
          const gradId = `grad-${s.label.replace(/\s+/g, "-")}`;
          return (
            <g key={s.label}>
              <defs>
                <linearGradient id={gradId} x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              {!s.dashed && (
                <motion.path
                  d={areaPath}
                  fill={`url(#${gradId})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              )}
              <motion.path
                d={linePath}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 5" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
              {pts.map(([x, y], i) => (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={s.dashed ? 4 : 3}
                  fill={s.color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 + i * 0.08 }}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** An animated horizontal bar for real (never fabricated) claim/calculation
 * comparisons — the width animates in on mount/update, driven by real data. */
export function AnimatedBar({
  label,
  displayValue,
  fraction,
  color,
  sublabel,
}: {
  label: string;
  displayValue: string;
  fraction: number; // 0..1
  color: string;
  sublabel?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</span>
        <span className="font-headline text-sm text-on-surface">{displayValue}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-outline-dim/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(2, fraction * 100))}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {sublabel && <div className="font-mono text-[9px] text-outline mt-1">{sublabel}</div>}
    </div>
  );
}

/** Subtle ambient animated glow — used in place of a static hero background. */
export function AmbientGlow({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute -top-1/4 left-1/4 w-[60%] h-[60%] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(197,168,128,0.14) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[45%] h-[45%] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(74,124,89,0.10) 0%, transparent 70%)" }}
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
