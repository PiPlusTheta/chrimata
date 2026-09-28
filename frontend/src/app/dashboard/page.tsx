"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "../../components/dashboard/store";
import { Buildings2, ArrowRight2 } from "iconsax-react";
import { motion, Variants } from "framer-motion";
import { BeamsBackground } from "../../components/BeamsBackground";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
  const router = useRouter();
  const { deals, loadDeals } = useDashboardStore();

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  return (
    <>
      {/* Dynamic Animated Beams Background */}
      <BeamsBackground className="absolute inset-0 z-0" intensity="medium" />
      
      <div className="relative z-10 flex flex-col gap-6 max-w-6xl mx-auto py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="font-display text-2xl font-light tracking-tight text-on-surface mb-2">
            Active Mandates
          </h1>
          <p className="font-mono text-xs text-on-surface-variant">
            Select a company to enter the verification terminal
          </p>
        </motion.div>

        {deals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-outline-dim/50 rounded-2xl bg-aegean-dark/30 backdrop-blur-sm"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-outline-dim border-t-bronze rounded-full mb-4"
            />
            <span className="font-mono text-xs text-outline">Loading mandates...</span>
          </motion.div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
          {deals.map((deal, index) => (
            <motion.button
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/dashboard/${deal.id}/queue`)}
              className="relative flex flex-col text-left bg-aegean-dark/60 border border-outline-dim hover:border-bronze/50 rounded-xl p-5 transition-colors duration-200 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bronze/0 to-bronze/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 w-full relative z-10">
                <div className="w-10 h-10 rounded-lg bg-accent-surface flex items-center justify-center text-outline group-hover:text-bronze transition-colors">
                  <Buildings2 size={20} variant="Linear" color="currentColor" />
                </div>
                {deal.open_issue_count > 0 && (
                  <span className="px-2 py-1 rounded border border-terra-alert/30 bg-terra-alert/10 font-mono text-[10px] text-terra-light uppercase tracking-wider">
                    {deal.open_issue_count} Issue{deal.open_issue_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <h2 className="font-display text-lg font-medium text-text-primary mb-1 relative z-10">
                {deal.name}
              </h2>
              
              <div className="font-mono text-[10px] text-on-surface-variant flex items-center gap-2 mb-6 relative z-10">
                <span>{deal.industry || "Unknown Industry"}</span>
                <span className="text-outline-dim">•</span>
                <span>{deal.stage || "Unknown Stage"}</span>
              </div>
              
              <div className="mt-auto flex items-center justify-between w-full pt-4 border-t border-hairline group-hover:border-bronze/30 transition-colors relative z-10">
                <span className="font-mono text-[10px] uppercase tracking-wider text-outline group-hover:text-bronze transition-colors">
                  Open Terminal
                </span>
                <ArrowRight2 size={14} className="text-outline group-hover:text-bronze transition-transform group-hover:translate-x-1" color="currentColor" />
              </div>
            </motion.button>
          ))}
          </div>
        )}

      <motion.div 
        className="mt-8 border-t border-hairline pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4">
          System Overview
        </h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="bg-accent-surface/30 border border-hairline rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />
            <div className="font-mono text-[10px] uppercase tracking-wider text-outline mb-1">Data Engine</div>
            <div className="flex items-center gap-2 font-mono text-xs text-tertiary">
              <span className="relative flex h-2 w-2 items-center justify-center rounded-full bg-tertiary">
                <span className="absolute h-3 w-3 rounded-full border border-tertiary animate-ping" />
              </span>
              Connected
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-accent-surface/30 border border-hairline rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />
            <div className="font-mono text-[10px] uppercase tracking-wider text-outline mb-1">Active Mandates</div>
            <div className="font-mono text-xs text-on-surface">{deals.length} tracked entities</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-accent-surface/30 border border-hairline rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />
            <div className="font-mono text-[10px] uppercase tracking-wider text-outline mb-1">Open Issues</div>
            <div className="font-mono text-xs text-on-surface">
              {deals.reduce((acc, d) => acc + d.open_issue_count, 0)} cross-deal issues
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      </div>
    </>
  );
}
