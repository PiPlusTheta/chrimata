"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useId } from 'react';

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 40 });
  const filterId = useId();

  const edgeVariant = (data?.edgeVariant as string) || 'standard';
  const isAnimating = data?.isAnimating as boolean;
  const sublabel = data?.sublabel as string | undefined;

  // Institutional palette: sapphire for standard, amber for hindsight, emerald for postgres
  const palette = {
    standard:  { base: '#3b82f6', active: '#60a5fa', glow: 'rgba(59,130,246,0.2)',  packet: '#93c5fd', labelBg: 'bg-blue-950/60',   labelText: 'text-blue-300',   labelBorder: 'border-blue-800/30',  subText: 'text-blue-400/50' },
    hindsight: { base: '#b45309', active: '#d97706', glow: 'rgba(217,119,6,0.25)',   packet: '#fbbf24', labelBg: 'bg-amber-950/60',  labelText: 'text-amber-300',  labelBorder: 'border-amber-800/30', subText: 'text-amber-400/50' },
    postgres:  { base: '#059669', active: '#10b981', glow: 'rgba(5,150,105,0.2)',    packet: '#6ee7b7', labelBg: 'bg-emerald-950/60', labelText: 'text-emerald-300', labelBorder: 'border-emerald-800/30', subText: 'text-emerald-400/50' },
  }[edgeVariant] || { base: '#3b82f6', active: '#60a5fa', glow: 'rgba(59,130,246,0.2)', packet: '#93c5fd', labelBg: 'bg-blue-950/60', labelText: 'text-blue-300', labelBorder: 'border-blue-800/30', subText: 'text-blue-400/50' };

  const stroke = isAnimating ? palette.active : palette.base;

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Base path */}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{
        stroke, strokeWidth: isAnimating ? 2 : 1.2,
        filter: `url(#${filterId}) drop-shadow(0 0 3px ${palette.glow})`,
        opacity: isAnimating ? 0.85 : 0.4,
        transition: 'all 0.4s ease',
      }} />

      {/* Ambient dashed flow */}
      <path d={edgePath} fill="none" markerEnd={markerEnd} style={{
        stroke: palette.active, strokeWidth: 1.2, strokeDasharray: '3, 14', strokeLinecap: 'round',
        animation: `arch-flow ${isAnimating ? '0.5s' : '3.5s'} linear infinite`,
        opacity: isAnimating ? 0.7 : 0.15,
        transition: 'opacity 0.4s ease',
      }} />

      {/* Data packet */}
      {isAnimating && (
        <circle r="4" fill={palette.packet} style={{
          offsetPath: `path('${edgePath}')`,
          animation: 'packet-move 1.4s ease-in-out infinite',
          filter: `drop-shadow(0 0 5px ${palette.packet})`,
        }} />
      )}

      {/* Label badge with sublabel */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div className="absolute flex flex-col items-center gap-px pointer-events-none transition-all duration-300"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, zIndex: 1000 }}>
            <span className={[
              'font-mono text-[9px] font-bold tracking-[0.08em] px-2 py-0.5 rounded backdrop-blur-sm border',
              palette.labelBg, palette.labelText, palette.labelBorder,
              isAnimating ? 'shadow-[0_0_8px_' + palette.glow + '] scale-105' : '',
            ].join(' ')}>
              {data.label as string}
            </span>
            {sublabel && (
              <span className={`font-sans text-[7.5px] font-medium tracking-wide ${palette.subText}`}>
                {sublabel}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
