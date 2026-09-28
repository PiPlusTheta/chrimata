"use client";

import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export type NodeData = Record<string, unknown> & {
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  variant?: 'default' | 'hindsight' | 'postgres';
  tier?: string;
  isPulsing?: boolean;
  sourceHandles?: Position[];
  targetHandles?: Position[];
};

export function CustomNode({ data }: { data: NodeData }) {
  const variant = (data.variant as string) || 'default';
  const isPulsing = data.isPulsing as boolean;

  const borderClass =
    variant === 'hindsight' ? 'border-amber-600/30'
    : variant === 'postgres' ? 'border-emerald-600/20'
    : 'border-white/[0.05]';

  const iconBg =
    variant === 'hindsight' ? 'bg-amber-900/30 text-amber-400'
    : variant === 'postgres' ? 'bg-emerald-900/25 text-emerald-400'
    : 'bg-white/[0.03] text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Hindsight outer glow — warm gold, not neon */}
      {variant === 'hindsight' && (
        <motion.div
          className="absolute -inset-[2px] rounded-xl"
          style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #92400e, #b45309)', backgroundSize: '300% 300%' }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            boxShadow: isPulsing
              ? ['0 0 25px 6px rgba(217,119,6,0.45)', '0 0 40px 12px rgba(180,83,9,0.5)', '0 0 25px 6px rgba(217,119,6,0.45)']
              : ['0 0 12px 2px rgba(217,119,6,0.15)', '0 0 18px 4px rgba(180,83,9,0.2)', '0 0 12px 2px rgba(217,119,6,0.15)'],
          }}
          transition={{ duration: isPulsing ? 0.7 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className={`relative rounded-xl border overflow-hidden bg-slate-950/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${borderClass} min-w-[240px]`}>
        {/* Subtle top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Target Handles */}
        <Handle type="target" position={Position.Top} id="top" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="target" position={Position.Bottom} id="bottom" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="target" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />

        {/* Horizontal card: icon | text */}
        <div className="relative z-10 flex items-center gap-3.5 px-4 py-3">
          {data.icon && (
            <div className="relative shrink-0">
              {variant === 'hindsight' && (
                <motion.div
                  className="absolute -inset-2 rounded-full border border-dashed border-amber-700/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg}`}>
                {data.icon}
              </div>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            {data.tier && (
              <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-600 leading-none mb-0.5">
                {data.tier as string}
              </span>
            )}
            <span className="font-sans text-[13px] font-semibold tracking-tight text-slate-100 leading-tight">
              {data.label}
            </span>
            {data.sublabel && (
              <span className="font-sans text-[10px] text-slate-500 tracking-tight leading-tight mt-px">
                {data.sublabel}
              </span>
            )}
          </div>
        </div>

        {/* Source Handles */}
        <Handle type="source" position={Position.Top} id="top" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="source" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
        <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !rounded-full !border !border-slate-700 !bg-slate-500" />
      </div>
    </motion.div>
  );
}
