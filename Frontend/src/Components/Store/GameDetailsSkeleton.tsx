import React from 'react';
import { Terminal, ShieldCheck, Cpu } from 'lucide-react';

export default function GameDetailsSkeleton() {
  return (
    <div className="font-mono text-[#C9D1D9] max-w-6xl mx-auto space-y-8 select-none">
      {/* ── AMBIENT DIAGNOSTIC CONNECTION BADGE ── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            ESTABLISHING SECURE NODE LINK · DECRYPTING ASSET BUNDLE...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          NODE PROTOCOL // RING-3 ICE VERIFIED
        </span>
      </div>

      {/* ── 1. TITLE & BREADCRUMBS SKELETON ── */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-2.5">
          {/* Breadcrumb line */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="h-3.5 w-16 bg-white/10 rounded animate-pulse" />
            <span>&gt;</span>
            <div className="h-3.5 w-24 bg-white/10 rounded animate-pulse" />
            <span>&gt;</span>
            <div className="h-3.5 w-32 bg-emerald-500/20 rounded animate-pulse" />
          </div>

          {/* Big Game Title */}
          <div className="h-9 sm:h-10 w-72 sm:w-96 bg-white/15 rounded-lg animate-pulse" />
        </div>

        {/* Live CCU Badge Placeholder */}
        <div className="h-8 w-44 rounded-full bg-emerald-950/30 border border-emerald-500/20 animate-pulse" />
      </div>

      {/* ── 2. TOP HERO SECTION: MEDIA GALLERY + INFO COLUMN ── */}
      <div className="flex flex-col lg:flex-row gap-6 bg-[#090D16] border border-[#1E2638] rounded-xl p-4 sm:p-5">
        {/* Left: Media Gallery Placeholder (16:9 + Thumbnails) */}
        <div className="lg:w-2/3 space-y-3">
          <div className="relative aspect-video w-full rounded-lg bg-[#05080E] border border-[#212A3B] overflow-hidden flex items-center justify-center">
            {/* Traveling Laser Sweep */}
            <div className="absolute inset-0 laser-emerald pointer-events-none" />

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] opacity-40 pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <Terminal className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
              <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                DECRYPTING 4K TRAILER STREAM...
              </div>
            </div>
          </div>

          {/* Screenshot Thumbnails Reel */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-video rounded bg-[#05080E] border border-[#1E2638] overflow-hidden relative"
              >
                <div
                  className="absolute inset-0 laser-emerald pointer-events-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info Column Placeholder */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Cover image (3:4 or wide) */}
          <div className="relative aspect-[16/9] lg:aspect-[16/10] w-full rounded bg-[#05080E] border border-[#212A3B] overflow-hidden">
            <div className="absolute inset-0 laser-emerald pointer-events-none" />
          </div>

          {/* Description lines */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-white/10 rounded animate-pulse" />
            <div className="h-3.5 w-4/6 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Metadata table rows */}
          <div className="text-xs space-y-2.5 pt-2 border-t border-[#1E2638]">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-20 bg-emerald-500/20 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-28 bg-cyan-400/20 rounded animate-pulse" />
            </div>
          </div>

          {/* Tags row */}
          <div className="mt-auto pt-3 border-t border-[#1E2638] flex flex-wrap gap-1.5">
            <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-14 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── 3. BUY EDITIONS BOX SKELETON ── */}
      <div className="p-6 rounded-xl bg-[#090D16] border border-[#1E2638] relative overflow-hidden space-y-4">
        <div className="absolute inset-0 laser-emerald pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-white/15 rounded animate-pulse" />
            <div className="h-3.5 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-emerald-500/20 rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-emerald-500/30 rounded-xl animate-pulse border border-emerald-500/40" />
          </div>
        </div>
      </div>

      {/* ── 4. LOWER CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description.txt */}
          <div className="p-6 rounded-xl bg-[#090D16] border border-[#1E2638] space-y-3">
            <div className="h-4 w-36 bg-cyan-400/20 rounded animate-pulse" />
            <div className="h-3.5 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-3.5 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-3.5 w-3/4 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Telemetry (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#090D16] border border-[#1E2638] space-y-2 text-center"
              >
                <div className="h-3 w-20 bg-white/10 rounded mx-auto animate-pulse" />
                <div className="h-7 w-16 bg-white/20 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>

          {/* System Specs Box */}
          <div className="p-6 rounded-xl bg-[#090D16] border border-[#1E2638] space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="h-4 w-44 bg-white/15 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-[#05080E] rounded-lg border border-white/5 animate-pulse" />
              <div className="h-24 bg-[#05080E] rounded-lg border border-white/5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Sidebar Info (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#090D16] border border-[#1E2638] space-y-3">
            <div className="h-4 w-32 bg-cyan-400/20 rounded animate-pulse" />
            <div className="h-4 w-20 bg-emerald-500/20 rounded animate-pulse" />
            <div className="h-3.5 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-20 bg-[#05080E] rounded-lg border border-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

