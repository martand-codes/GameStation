import React from 'react';
import { ShieldCheck, Activity, AlertTriangle, Layers, Radio } from 'lucide-react';

export default function AdminSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* ── 0. QA OVERSIGHT RADAR HUD STRIP ───────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            QA OVERSIGHT RADAR · DECRYPTING SUBMISSION DESK &amp; COMPLIANCE...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
          STAFF OPERATIONS DESK // CLEARANCE SEC-LVL 2
        </span>
      </div>

      {/* ── 1. HEADER ROW ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#212A3B]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-cyan-500/20 rounded animate-pulse border border-cyan-500/30" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-white/15 rounded-lg animate-pulse" />
          <div className="h-3.5 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-[#0D1526] rounded-xl border border-white/5 animate-pulse" />
          <div className="h-10 w-36 bg-cyan-500/20 rounded-xl border border-cyan-500/30 animate-pulse" />
        </div>
      </div>

      {/* ── 2. KPI METRICS (4 CARDS) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#090E1A] border border-cyan-500/20 relative overflow-hidden space-y-3"
          >
            <div
              className="absolute inset-0 laser-cyan pointer-events-none"
              style={{ animationDelay: `${i * 140}ms` }}
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-white/20 rounded-lg animate-pulse relative z-10" />
            <div className="h-3 w-36 bg-white/5 rounded animate-pulse relative z-10" />
          </div>
        ))}
      </div>

      {/* ── 3. VELOCITY & SLA MONITOR ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#090E1A] border border-cyan-500/20 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-cyan pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
            <div className="h-4 w-44 bg-white/15 rounded animate-pulse" />
            <div className="h-4 w-28 bg-cyan-400/20 rounded animate-pulse" />
          </div>

          <div className="h-56 rounded-xl bg-[#050912] border border-white/[0.04] flex items-center justify-center relative z-10">
            <Activity className="w-8 h-8 text-cyan-400/30 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#090E1A] border border-cyan-500/20 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-cyan pointer-events-none" />

          <div className="h-4 w-32 bg-white/15 rounded animate-pulse relative z-10" />
          <div className="space-y-3 pt-2 relative z-10">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#050912] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-amber-400/20 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. BACKLOG TABLE SKELETON ──────────────────────────────────── */}
      <div className="rounded-2xl bg-[#090E1A] border border-cyan-500/20 p-6 relative overflow-hidden space-y-4">
        <div className="absolute inset-0 laser-cyan pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
          <div className="h-4 w-48 bg-white/15 rounded animate-pulse" />
          <div className="h-4 w-24 bg-cyan-400/20 rounded animate-pulse" />
        </div>

        <div className="space-y-2.5 relative z-10">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#050912] border border-white/[0.04] p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3.5 w-36 bg-white/15 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-amber-500/20 rounded-md animate-pulse" />
                <div className="h-8 w-24 bg-cyan-500/20 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

