import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, X, Lock, CheckCircle2, AlertOctagon, Sparkles, Terminal } from 'lucide-react';

interface DemoSandboxMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoSandboxMatrixModal({ isOpen, onClose }: DemoSandboxMatrixModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl p-6 sm:p-7 rounded-2xl bg-[#090B12] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-white font-mono shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight uppercase text-amber-400 flex items-center gap-2">
                  <span>Demo Owner Sandbox Matrix</span>
                  <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    PROTECTED
                  </span>
                </h3>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mt-0.5">
                  Root Sovereign: <span className="text-red-400 font-bold">@Martand_Prakhar</span> &bull; Sandbox Clearance: <span className="text-white font-bold">@Demo_Owner</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 text-xs font-sans pr-1">
            {/* Overview Banner */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-zinc-300 leading-relaxed font-sans text-xs flex items-start gap-3">
              <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 font-mono">SANDBOX ARCHITECTURE PROTOCOL: </span>
                To allow public portfolio visitors and recruiters to explore GameStation's executive controls without risking platform disruption or lockout, <span className="text-white font-medium">Demo Owner</span> operates inside an enterprise-grade sandbox. Destructive root operations are locked or self-healing.
              </div>
            </div>

            {/* Allowed Capabilities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Permitted Sandbox Operations (Full Experience)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-zinc-300">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>⚡ W3C APM & Flame Graphs</span>
                  </div>
                  Inspect live Distributed Tracing, kernel spans, and latency percentiles.
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-zinc-300">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>📋 QA Certification Desk</span>
                  </div>
                  Claim tickets, inspect technical dossiers, and certify or reject developer builds.
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-zinc-300">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>📊 Treasury & Take-Rate</span>
                  </div>
                  Test the dynamic platform royalty slider with live reactive recalculations.
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-zinc-300">
                  <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                    <span>🚨 Emergency Circuit Breakers</span>
                  </div>
                  Arm and test Marketplace freeze & Maintenance banners (with auto-heal).
                </div>
              </div>
            </div>

            {/* Restricted Capabilities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                <AlertOctagon className="w-4 h-4" />
                <span>Restricted to Root Sovereign (@Martand_Prakhar)</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-zinc-300 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">1. Permanent Platform Lockdown (5-Min Auto-Heal)</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      Killswitches armed by Demo Owner automatically disengage after 5 minutes so the live store remains accessible to subsequent visitors. Only @Martand_Prakhar can impose permanent lockdowns.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-zinc-300 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">2. Nuclear Global Session Purge</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      Terminating and revoking all active refresh tokens for all platform players, developers, and staff is exclusive to root sovereign @Martand_Prakhar.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-zinc-300 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">3. Credential & Profile Mutations</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      Changing passwords or email handles for demo accounts is permanently locked to prevent public visitors from locking each other out.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-zinc-300 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">4. Altering or Suspending Root Owner</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      Root owner @Martand_Prakhar is cryptographically shielded from suspension, demotion, or deletion by any staff member or demo user.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-red-500/20 text-zinc-300 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">5. Platform Authority Relinquishment / Claim</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                      Genesis root ownership tokens and recovery phrases are permanently anchored to @Martand_Prakhar and cannot be reassigned.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-xs shrink-0">
            <span className="text-[10px] text-zinc-500">
              SECURITY PROTOCOL SHA-256 VERIFIED
            </span>
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              Acknowledge & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

