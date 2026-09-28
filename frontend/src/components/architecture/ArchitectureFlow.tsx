"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow, Background, BackgroundVariant, useNodesState, useEdgesState,
  Position, ConnectionMode, type Edge, type Node, MarkerType,
  useReactFlow, ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { CustomNode, type NodeData } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { Mobile, Data, Setting4, MessageProgramming, Cpu, Driving, Flash } from 'iconsax-react';
import { Maximize, Minimize } from 'lucide-react';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

/* ────────────────────────────────────────────────
   Strict 4-tier hierarchical layout
   ──────────────────────────────────────────────── */

const initialNodes: Node<NodeData>[] = [
  // Tier 1
  {
    id: 'client', type: 'custom', position: { x: 400, y: 0 },
    data: {
      label: 'Client / UI', sublabel: 'Next.js 15 · React 19', tier: 'Interface',
      icon: <Mobile size={20} variant="Bulk" color="currentColor" />,
    },
  },
  // Tier 2
  {
    id: 'gateway', type: 'custom', position: { x: 400, y: 180 },
    data: {
      label: 'API Gateway', sublabel: 'FastAPI · Uvicorn', tier: 'Router',
      icon: <Data size={20} variant="Bulk" color="currentColor" />,
    },
  },
  // Tier 3 — Left
  {
    id: 'pipelines', type: 'custom', position: { x: 50, y: 380 },
    data: {
      label: 'Automated Pipelines', sublabel: 'Change Reviews & Evidence Requests', tier: 'Workload',
      icon: <Setting4 size={20} variant="Bulk" color="currentColor" />,
    },
  },
  // Tier 3 — Right
  {
    id: 'agent', type: 'custom', position: { x: 850, y: 380 },
    data: {
      label: 'Ask Chrimata Agent', sublabel: 'Interactive LLM', tier: 'Workload',
      icon: <MessageProgramming size={20} variant="Bulk" color="currentColor" />,
    },
  },
  // Tier 4 — Left: PostgreSQL
  {
    id: 'postgres', type: 'custom', position: { x: 50, y: 650 },
    data: {
      label: 'PostgreSQL', sublabel: 'State Machine · Tickets & Status', tier: 'Storage',
      variant: 'postgres',
      icon: <Driving size={20} variant="Bulk" color="currentColor" />,
    },
  },
  // Tier 4 — Right: Hindsight
  {
    id: 'hindsight', type: 'custom', position: { x: 600, y: 650 },
    data: {
      label: 'Hindsight Memory', sublabel: 'Embedded Daemon · Local Cryptographic Privacy', tier: 'Cognitive Engine',
      variant: 'hindsight', isHindsight: true, isPulsing: false,
      icon: <Cpu size={22} variant="Bulk" color="currentColor" />,
    },
  },
];

const baseEdges: Edge[] = [
  // Standard traffic (sapphire blue)
  { id: 'e-cl-gw', source: 'client', target: 'gateway', type: 'custom',
    sourceHandle: 'bottom', targetHandle: 'top',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    data: { label: 'HTTPS', sublabel: 'REST + SSE', edgeVariant: 'standard' } },
  { id: 'e-gw-pipe', source: 'gateway', target: 'pipelines', type: 'custom',
    sourceHandle: 'left', targetHandle: 'top',
    data: { label: 'Trigger', sublabel: 'Automated Pipeline', edgeVariant: 'standard' } },
  { id: 'e-gw-agent', source: 'gateway', target: 'agent', type: 'custom',
    sourceHandle: 'right', targetHandle: 'top',
    data: { label: 'Session', sublabel: 'Streaming LLM Chat', edgeVariant: 'standard' } },

  // PostgreSQL (emerald)
  { id: 'e-pipe-pg', source: 'pipelines', target: 'postgres', type: 'custom',
    sourceHandle: 'bottom', targetHandle: 'top',
    data: { label: 'SQL Update', sublabel: 'Update Ticket State', edgeVariant: 'postgres' } },
  { id: 'e-gw-pg', source: 'gateway', target: 'postgres', type: 'custom',
    sourceHandle: 'left', targetHandle: 'right',
    data: { label: 'SQL Insert', sublabel: 'Persist Review Decision', edgeVariant: 'postgres' } },

  // Hindsight (amber)
  { id: 'e-pipe-hs', source: 'pipelines', target: 'hindsight', type: 'custom',
    sourceHandle: 'right', targetHandle: 'top',
    data: { label: 'recall()', sublabel: 'Fetch Past Outcomes', edgeVariant: 'hindsight' } },
  { id: 'e-agent-hs', source: 'agent', target: 'hindsight', type: 'custom',
    sourceHandle: 'bottom', targetHandle: 'right',
    data: { label: 'reflect()', sublabel: 'Synthesize Markdown Context', edgeVariant: 'hindsight' } },
  { id: 'e-gw-hs', source: 'gateway', target: 'hindsight', type: 'custom',
    sourceHandle: 'right', targetHandle: 'top',
    data: { label: 'retain()', sublabel: 'Store Decision Receipts', edgeVariant: 'hindsight' } },
];

/* ────────────────────────────────────────────────
   Simulation State Machine
   ──────────────────────────────────────────────── */
type Phase = 'idle' | 'accept' | 'route' | 'persist' | 'retain' | 'done';

const PHASE_LABELS: Record<Phase, string> = {
  idle: '',
  accept: 'Phase 1 — Analyst accepts discrepancy explanation via UI',
  route: 'Phase 2 — Gateway routes decision to workloads',
  persist: 'Phase 3 — PostgreSQL marks issue as resolved (SQL UPDATE)',
  retain: 'Phase 4 — Hindsight stores semantic explanation via retain()',
  done: 'Workflow complete — context persisted for future institutional recall',
};

const PHASE_EDGES: Record<Phase, string[]> = {
  idle: [],
  accept: ['e-cl-gw'],
  route: ['e-gw-pipe', 'e-gw-agent'],
  persist: ['e-pipe-pg', 'e-gw-pg'],
  retain: ['e-gw-hs', 'e-pipe-hs'],
  done: [],
};

const PHASE_PULSE_HINDSIGHT: Phase[] = ['retain'];
const PHASE_MS = 2400;

function ArchitectureFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);
  const [phase, setPhase] = useState<Phase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fitView]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  const runSimulation = useCallback(() => {
    if (isRunning) { clearTimers(); setPhase('idle'); setIsRunning(false); return; }
    setIsRunning(true);

    const sequence: Phase[] = ['accept', 'route', 'persist', 'retain', 'done'];
    const loop = (offset: number) => {
      sequence.forEach((p, i) => {
        const t = setTimeout(() => {
          setPhase(p);
          if (p === 'done') {
            const restart = setTimeout(() => loop(0), PHASE_MS);
            timers.current.push(restart);
          }
        }, offset + i * PHASE_MS);
        timers.current.push(t);
      });
    };
    loop(0);
  }, [isRunning, clearTimers]);

  // Sync edges
  useEffect(() => {
    const active = new Set(PHASE_EDGES[phase] || []);
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, isAnimating: active.has(e.id) } } as Edge)));
  }, [phase, setEdges]);

  // Sync Hindsight pulse
  useEffect(() => {
    const pulse = PHASE_PULSE_HINDSIGHT.includes(phase);
    setNodes((nds) => nds.map((n) => n.id === 'hindsight' ? { ...n, data: { ...n.data, isPulsing: pulse } } : n));
  }, [phase, setNodes]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div ref={wrapperRef} className={`w-full relative rounded-2xl overflow-hidden border border-white/[0.04] bg-[#030712] ${isFullscreen ? 'h-screen' : 'h-[750px]'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes arch-flow { from { stroke-dashoffset: 17; } to { stroke-dashoffset: 0; } }
        @keyframes packet-move { 0% { offset-distance: 0%; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        .react-flow__attribution { display: none !important; }
      `}} />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between px-7 py-5 bg-gradient-to-b from-[#030712] via-[#030712]/70 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="font-sans text-lg font-semibold tracking-tight text-slate-100">System Architecture</h2>
          <p className="font-sans text-[11px] text-slate-500 mt-0.5 max-w-lg tracking-tight">
            Institutional data topology — PostgreSQL tracks ticket state, Hindsight retains semantic context for long-term agent memory.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex flex-row items-center gap-3">
            <motion.button
              onClick={runSimulation} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
              className={[
                'flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'font-sans text-[12px] font-semibold tracking-tight border cursor-pointer transition-all duration-300',
                isRunning
                  ? 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-600/40 text-amber-100 shadow-[0_0_20px_rgba(217,119,6,0.25)]'
                  : 'bg-slate-900/80 border-white/[0.06] text-slate-400 hover:bg-slate-800/80 hover:border-white/[0.1] hover:text-slate-300',
              ].join(' ')}
            >
              <Flash size={14} variant={isRunning ? "Bold" : "Linear"} color="currentColor" />
              {isRunning ? 'Stop Simulation' : 'Simulate Analyst Workflow'}
            </motion.button>
            <motion.button
              onClick={toggleFullscreen} whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.06] text-slate-400 hover:bg-slate-800/80 hover:border-white/[0.1] hover:text-slate-300 transition-all duration-300"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </motion.button>
          </div>

          {/* Phase indicator */}
          <AnimatePresence mode="wait">
            {isRunning && phase !== 'idle' && (
              <motion.div
                key={phase} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/[0.04] backdrop-blur-md"
              >
                <motion.div
                  className={`w-1.5 h-1.5 rounded-full ${phase === 'done' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
                <span className="font-sans text-[10px] font-medium text-slate-400 tracking-tight">
                  {PHASE_LABELS[phase]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true} panOnDrag={true} zoomOnScroll={true}
        nodesConnectable={false}
        fitView fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3} maxZoom={2}
        className="w-full h-full"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#0a1120" />
      </ReactFlow>
    </div>
  );
}

export function ArchitectureFlow() {
  return (
    <ReactFlowProvider>
      <ArchitectureFlowInner />
    </ReactFlowProvider>
  );
}
