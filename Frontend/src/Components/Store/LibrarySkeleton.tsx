import React from 'react';
import { Gamepad2, HardDrive, Clock, ShieldCheck, Terminal } from 'lucide-react';

export default function LibrarySkeleton() {
  return (
    <div className="space-y-8 font-mono select-none">
      {/* ── 0. AMBIENT DIAGNOSTIC CONNECTION BADGE ── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            LOCAL_VAULT // DIGITAL_ENTITLEMENTS · DECRYPTING DRMs &amp; BINARIES...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          GAMESTATION CORE // CLIENT ENGINE v2.4
        </span>
      </div>

      {/* ── 1. TOP HERO HUD BANNER SKELETON ── */}
      <div className="relative bg-gradient-to-r from-purple-950/20 via-[#0D1117] to-emerald-950/20 border border-[#30363D] rounded-xl p-6 sm:p-7 overflow-hidden shadow-2xl">
        {/* Laser Sweep */}
        <div className="absolute inset-0 laser-emerald pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-400 animate-pulse" />
              <div className="h-3.5 w-48 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 sm:h-9 w-64 bg-white/15 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-purple-500/20 rounded-md animate-pulse border border-purple-500/30" />
            </div>
            <div className="h-3.5 w-full bg-white/5 rounded animate-pulse" />
          </div>

          {/* Quick HUD Metrics (3 Cards) */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#161B22]/80 border border-[#30363D] px-4 py-2.5 rounded-lg min-w-[130px] space-y-1.5"
              >
                <div className="h-2.5 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH CONTROL MATRIX SKELETON ── */}
      <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E2638] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Placeholder */}
        <div className="h-9 w-full md:w-80 bg-[#05080E] rounded-lg border border-white/5 animate-pulse" />

        {/* Genre Pills & Sort Dropdown */}
        <div className="flex items-center gap-2 overflow-x-hidden">
          <div className="h-8 w-16 bg-emerald-500/20 rounded-lg animate-pulse border border-emerald-500/30 shrink-0" />
          <div className="h-8 w-24 bg-[#121824] rounded-lg animate-pulse shrink-0" />
          <div className="h-8 w-20 bg-[#121824] rounded-lg animate-pulse shrink-0" />
          <div className="h-8 w-28 bg-[#121824] rounded-lg animate-pulse shrink-0" />
        </div>
      </div>

      {/* ── 3. LIBRARY GAMES GRID (6 CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-[#0B0F17] border border-[#212A3B] overflow-hidden relative shadow-lg flex flex-col space-y-3"
          >
            {/* Traveling Laser Sweep */}
            <div
              className="absolute inset-0 laser-emerald pointer-events-none"
              style={{ animationDelay: `${(i % 3) * 180}ms` }}
            />

            {/* Cover Image Placeholder (16:9) */}
            <div className="aspect-video w-full bg-[#05080E] relative flex items-center justify-center border-b border-[#1E2638]">
              <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase animate-pulse">
                DECRYPTING LICENSE...
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 pt-1 flex flex-col flex-grow space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 bg-white/15 rounded animate-pulse" />
                <div className="h-4 w-16 bg-emerald-500/20 rounded animate-pulse" />
              </div>

              {/* Telemetry info row */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              </div>

              {/* Launch Action Button Placeholder */}
              <div className="pt-2 mt-auto">
                <div className="h-9 w-full bg-emerald-600/20 border border-emerald-500/30 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

