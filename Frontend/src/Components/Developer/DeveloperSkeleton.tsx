import React from 'react';
import { Gamepad2, Cpu, Sparkles, Activity, Layers, Wallet } from 'lucide-react';

export default function DeveloperSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none font-sans">
      {/* ── 0. FORGE KERNEL PIPELINE HUD STRIP ─────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-purple-500/20">
        <div className="flex items-center gap-2 text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            STUDIO FORGE PIPELINE · SYNCING COMPILER &amp; GAME BUILDS...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
          DEVELOPER ENGINE // ASSET KERNEL v2.4
        </span>
      </div>

      {/* ── 1. HEADER ROW ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-36 bg-purple-500/20 rounded animate-pulse border border-purple-500/30" />
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-8 w-72 bg-white/15 rounded-lg animate-pulse" />
          <div className="h-3.5 w-80 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-[#151022] rounded-xl border border-white/5 animate-pulse" />
          <div className="h-10 w-36 bg-purple-600/30 rounded-xl border border-purple-500/40 animate-pulse" />
        </div>
      </div>

      {/* ── 2. STUDIO KPIS (4 CARDS) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#0E0B18] border border-purple-500/20 relative overflow-hidden space-y-3"
          >
            <div
              className="absolute inset-0 laser-violet pointer-events-none"
              style={{ animationDelay: `${i * 140}ms` }}
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 animate-pulse" />
            </div>
            <div className="h-7 w-24 bg-white/20 rounded-lg animate-pulse relative z-10" />
            <div className="h-3 w-36 bg-white/5 rounded animate-pulse relative z-10" />
          </div>
        ))}
      </div>

      {/* ── 3. PERFORMANCE & TELEMETRY ROW ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#0E0B18] border border-purple-500/20 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-violet pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
            <div className="h-4 w-44 bg-white/15 rounded animate-pulse" />
            <div className="h-4 w-28 bg-purple-400/20 rounded animate-pulse" />
          </div>

          <div className="h-60 rounded-xl bg-[#080610] border border-white/[0.04] flex items-center justify-center relative z-10">
            <Cpu className="w-10 h-10 text-purple-400/30 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0E0B18] border border-purple-500/20 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-violet pointer-events-none" />

          <div className="h-4 w-32 bg-white/15 rounded animate-pulse relative z-10" />
          <div className="space-y-3 pt-2 relative z-10">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#080610] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-purple-400/20 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. STUDIO GAMES REPO GRID ──────────────────────────────────── */}
      <div className="rounded-2xl bg-[#0E0B18] border border-purple-500/20 p-6 relative overflow-hidden space-y-4">
        <div className="absolute inset-0 laser-violet pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
          <div className="h-4 w-48 bg-white/15 rounded animate-pulse" />
          <div className="h-8 w-28 bg-purple-600/20 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#080610] border border-white/[0.04] space-y-3"
            >
              <div className="aspect-video w-full rounded-lg bg-[#05040B] relative overflow-hidden">
                <div
                  className="absolute inset-0 laser-violet pointer-events-none"
                  style={{ animationDelay: `${i * 180}ms` }}
                />
              </div>
              <div className="h-4 w-3/4 bg-white/15 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

