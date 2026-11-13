import React from 'react';
import { Terminal, Database } from 'lucide-react';

export default function StoreSkeletonLoader() {
  return (
    <div className="space-y-10 font-mono select-none">
      {/* ── 1. HERO SPOTLIGHT SKELETON ───────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0A0E17] border border-emerald-500/20 p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col justify-end shadow-2xl">
        {/* Laser Sweep Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.12] to-transparent animate-laser pointer-events-none" />

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="h-5 w-36 bg-emerald-500/20 rounded-md animate-pulse border border-emerald-500/30" />
            <div className="h-5 w-24 bg-white/5 rounded-md animate-pulse" />
          </div>
          <div className="h-8 sm:h-10 w-3/4 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* ── 2. FEATURED TARGETS SKELETON (2 CARDS 16:9) ─────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#212A3B] pb-2.5">
          <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" />
          <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-xl bg-[#0B0F17] border border-[#212A3B] overflow-hidden p-6 flex flex-col justify-end"
            >
              {/* Laser sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-laser pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-emerald-500/20 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-6 w-1/2 bg-white/10 rounded animate-pulse" />
                <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="pt-2 flex items-center justify-between">
                  <div className="h-7 w-20 bg-emerald-500/20 rounded-lg animate-pulse" />
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. FILTER MATRIX SKELETON ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#212A3B] pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400 animate-pulse" />
            <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Filter bar container */}
        <div className="p-4 rounded-2xl bg-[#090D16] border border-[#1E2638] space-y-3">
          {/* Pills row */}
          <div className="flex items-center gap-2 overflow-x-hidden">
            <div className="h-8 w-28 bg-emerald-500/20 rounded-xl animate-pulse shrink-0 border border-emerald-500/30" />
            <div className="h-8 w-32 bg-[#121824] rounded-xl animate-pulse shrink-0" />
            <div className="h-8 w-28 bg-[#121824] rounded-xl animate-pulse shrink-0" />
            <div className="h-8 w-36 bg-[#121824] rounded-xl animate-pulse shrink-0" />
            <div className="h-8 w-24 bg-[#121824] rounded-xl animate-pulse shrink-0" />
            <div className="h-8 w-30 bg-[#121824] rounded-xl animate-pulse shrink-0" />
          </div>

          {/* Search & sort row */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="h-9 w-full sm:w-80 bg-[#05080E] rounded-xl border border-white/[0.06] animate-pulse" />
            <div className="h-8 w-44 bg-[#05080E] rounded-xl border border-white/[0.06] animate-pulse" />
          </div>
        </div>

        {/* ── 4. CATALOG GRID SKELETON (10 CARDS, 3:4 ASPECT) ─────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="relative bg-[#0B0F17] border border-[#212A3B] rounded-xl overflow-hidden font-mono flex flex-col h-full shadow-lg"
            >
              {/* Traveling Laser Shimmer */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/[0.09] to-transparent animate-laser pointer-events-none"
                style={{ animationDelay: `${(i % 5) * 200}ms` }}
              />

              {/* Card Header Strip */}
              <div className="px-3 py-2 border-b border-[#1E2638] bg-[#070A10] flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40 animate-pulse" />
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-cyan-400/20 rounded animate-pulse" />
              </div>

              {/* Cover Placeholder 3:4 */}
              <div className="aspect-[3/4] w-full bg-[#070A10] relative flex items-center justify-center">
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest animate-pulse">
                  DECRYPTING...
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-grow space-y-2">
                <div className="h-4 w-3/4 bg-white/15 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#1E2638] border-dashed">
                  <div className="h-5 w-16 bg-emerald-500/20 rounded animate-pulse" />
                  <div className="h-3 w-14 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
