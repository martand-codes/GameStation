import React from 'react';
import { Shield, ShieldAlert, Activity, Key, Terminal, BarChart3 } from 'lucide-react';

export default function GovernanceSkeleton() {
  return (
    <div className="space-y-8 select-none font-sans">
      {/* ── 0. AIR-GAPPED LEVEL-0 DECRYPT HUD ───────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-rose-500/20">
        <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            LEVEL-0 ROOT ICE · AIR-GAPPED DECRYPTING PLATFORM TREASURY...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
          DIRECT SOVEREIGN CLEARANCE // RING-0 KERNEL
        </span>
      </div>

      {/* ── 1. SOVEREIGN CHIEF HERO BANNER SKELETON ───────────────────── */}
      <div
        className="p-6 md:p-7 rounded-2xl border border-rose-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(13,13,18,0.95) 60%)',
        }}
      >
        {/* Laser Sweep */}
        <div className="absolute inset-0 laser-crimson pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-36 bg-rose-500/20 rounded animate-pulse border border-rose-500/30" />
            <span className="text-zinc-600">&bull;</span>
            <div className="h-3.5 w-24 bg-emerald-500/20 rounded animate-pulse" />
          </div>
          <div className="h-8 sm:h-9 w-72 bg-white/15 rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="h-10 w-32 bg-[#1A1A24] rounded-xl border border-white/5 animate-pulse" />
          <div className="h-10 w-40 bg-rose-600/30 rounded-xl border border-rose-500/40 animate-pulse" />
          <div className="h-10 w-36 bg-[#1A1A24] rounded-xl border border-white/5 animate-pulse" />
        </div>
      </div>

      {/* ── 2. TELEMETRY RADAR HUD SKELETON ────────────────────────────── */}
      <div className="rounded-2xl border border-rose-500/20 bg-[#0A0D14] p-5 relative overflow-hidden space-y-4">
        <div className="absolute inset-0 laser-crimson pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-4 w-28 bg-rose-500/20 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#07090F] border border-white/[0.05] space-y-2">
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-28 bg-rose-500/20 rounded animate-pulse" />
              <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. EMPIRE PULSE 4-METRICS SKELETON ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="h-3.5 w-52 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#0A0D14] border border-rose-500/15 relative overflow-hidden space-y-3"
            >
              <div
                className="absolute inset-0 laser-crimson pointer-events-none"
                style={{ animationDelay: `${i * 150}ms` }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-pulse" />
              </div>
              <div className="h-7 w-32 bg-white/20 rounded-lg animate-pulse relative z-10" />
              <div className="h-3 w-40 bg-white/5 rounded animate-pulse relative z-10" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. CHARTS ROW SKELETON (REVENUE & REVIEWS) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#0A0D14] border border-rose-500/15 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-crimson pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
            <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-64 rounded-xl bg-[#06080E] border border-white/[0.04] flex items-center justify-center relative z-10">
            <BarChart3 className="w-10 h-10 text-rose-500/30 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0A0D14] border border-rose-500/15 p-6 relative overflow-hidden space-y-4">
          <div className="absolute inset-0 laser-crimson pointer-events-none" />

          <div className="h-4 w-36 bg-white/10 rounded animate-pulse relative z-10" />
          <div className="h-64 rounded-xl bg-[#06080E] border border-white/[0.04] flex items-center justify-center relative z-10">
            <div className="w-36 h-36 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
          </div>
        </div>
      </div>

      {/* ── 5. STAFF ROSTER & INVITES SKELETON ──────────────────────────── */}
      <div className="rounded-2xl bg-[#0A0D14] border border-rose-500/15 p-6 relative overflow-hidden space-y-4">
        <div className="absolute inset-0 laser-crimson pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
          <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-32 bg-rose-500/20 rounded-xl animate-pulse" />
        </div>

        <div className="space-y-3 relative z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#06080E] border border-white/[0.04] p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-white/15 rounded animate-pulse" />
                  <div className="h-2.5 w-32 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-rose-500/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

