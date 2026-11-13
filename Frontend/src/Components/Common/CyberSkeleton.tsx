import React from 'react';
import { Terminal, Shield, Activity, Cpu, Database, BarChart3, Layers } from 'lucide-react';

export type SkeletonRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'PLAYER' | 'CITIZEN';
export type SkeletonLayout = 'dashboard' | 'catalog' | 'details' | 'table' | 'cards';

interface CyberSkeletonProps {
  role?: SkeletonRole;
  layout?: SkeletonLayout;
  title?: string;
  subtitle?: string;
  cardsCount?: number;
}

export default function CyberSkeleton({
  role = 'PLAYER',
  layout = 'dashboard',
  title,
  subtitle,
  cardsCount = 4,
}: CyberSkeletonProps) {
  // Theme Palettes by Role
  const roleStyles = {
    OWNER: {
      laser: 'laser-crimson',
      badgeBg: 'bg-rose-950/40 border-rose-500/30 text-rose-400',
      ping: 'bg-rose-500',
      borderAccent: 'border-rose-500/20',
      boxBg: 'bg-[#0A0D14]',
      cardBg: 'bg-[#07090F]',
      defaultHeader: 'LEVEL-0 ROOT ICE · AIR-GAPPED DECRYPTING PLATFORM TREASURY...',
      defaultSub: 'DIRECT SOVEREIGN CLEARANCE // RING-0 KERNEL',
    },
    ADMIN: {
      laser: 'laser-cyan',
      badgeBg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400',
      ping: 'bg-cyan-400',
      borderAccent: 'border-cyan-500/20',
      boxBg: 'bg-[#090E1A]',
      cardBg: 'bg-[#050912]',
      defaultHeader: 'QA OVERSIGHT RADAR · DECRYPTING SUBMISSION DESK & COMPLIANCE...',
      defaultSub: 'STAFF OPERATIONS DESK // CLEARANCE SEC-LVL 2',
    },
    DEVELOPER: {
      laser: 'laser-violet',
      badgeBg: 'bg-purple-950/40 border-purple-500/30 text-purple-400',
      ping: 'bg-purple-400',
      borderAccent: 'border-purple-500/20',
      boxBg: 'bg-[#0E0B18]',
      cardBg: 'bg-[#080610]',
      defaultHeader: 'STUDIO FORGE PIPELINE · SYNCING COMPILER & GAME BUILDS...',
      defaultSub: 'DEVELOPER ENGINE // ASSET KERNEL v2.4',
    },
    PLAYER: {
      laser: 'laser-emerald',
      badgeBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
      ping: 'bg-emerald-400',
      borderAccent: 'border-emerald-500/20',
      boxBg: 'bg-[#0A0E17]',
      cardBg: 'bg-[#05080E]',
      defaultHeader: 'RING-3 PROTOCOL · DECRYPTING DISTRIBUTED ASSET BUNDLE...',
      defaultSub: 'GAMESTATION CORE // SECURE RUNTIME v2.4',
    },
    CITIZEN: {
      laser: 'laser-emerald',
      badgeBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
      ping: 'bg-emerald-400',
      borderAccent: 'border-emerald-500/20',
      boxBg: 'bg-[#0A0E17]',
      cardBg: 'bg-[#05080E]',
      defaultHeader: 'RING-3 PROTOCOL · DECRYPTING DISTRIBUTED ASSET BUNDLE...',
      defaultSub: 'GAMESTATION CORE // SECURE RUNTIME v2.4',
    },
  }[role] || {
    laser: 'laser-emerald',
    badgeBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
    ping: 'bg-emerald-400',
    borderAccent: 'border-emerald-500/20',
    boxBg: 'bg-[#0A0E17]',
    cardBg: 'bg-[#05080E]',
    defaultHeader: 'RING-3 PROTOCOL · DECRYPTING ASSET BUNDLE...',
    defaultSub: 'GAMESTATION CORE // SECURE RUNTIME v2.4',
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* ── AMBIENT DIAGNOSTIC CONNECTION BADGE ── */}
      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/[0.05]">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${roleStyles.badgeBg}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${roleStyles.ping}`} />
          <span className="font-bold tracking-wider uppercase">
            {title || roleStyles.defaultHeader}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          {subtitle || roleStyles.defaultSub}
        </span>
      </div>

      {/* ── LAYOUT VARIANT: DASHBOARD ── */}
      {layout === 'dashboard' && (
        <div className="space-y-6">
          {/* Hero Banner Shimmer */}
          <div className={`p-6 rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`} />
            <div className="space-y-2 relative z-10 max-w-xl">
              <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
              <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-3.5 w-full bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse relative z-10" />
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(cardsCount)].map((_, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} relative overflow-hidden space-y-3`}
              >
                <div
                  className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`}
                  style={{ animationDelay: `${i * 120}ms` }}
                />
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse relative z-10" />
                <div className="h-7 w-28 bg-white/20 rounded-lg animate-pulse relative z-10" />
                <div className="h-2.5 w-full bg-white/5 rounded animate-pulse relative z-10" />
              </div>
            ))}
          </div>

          {/* Analytics / Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} relative overflow-hidden space-y-4`}>
              <div className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`} />
              <div className="h-4 w-44 bg-white/15 rounded animate-pulse relative z-10" />
              <div className={`h-60 rounded-xl ${roleStyles.cardBg} border border-white/[0.04] flex items-center justify-center relative z-10`}>
                <Activity className="w-8 h-8 text-white/20 animate-pulse" />
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} relative overflow-hidden space-y-4`}>
              <div className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`} />
              <div className="h-4 w-32 bg-white/15 rounded animate-pulse relative z-10" />
              <div className={`h-60 rounded-xl ${roleStyles.cardBg} border border-white/[0.04] flex items-center justify-center relative z-10`}>
                <div className="w-28 h-28 rounded-full border-4 border-white/10 border-t-white/40 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT VARIANT: TABLE / LIST ── */}
      {layout === 'table' && (
        <div className={`p-6 rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} relative overflow-hidden space-y-4`}>
          <div className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`} />
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 relative z-10">
            <div className="h-4 w-48 bg-white/15 rounded animate-pulse" />
            <div className="h-8 w-28 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-2.5 relative z-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-14 rounded-xl ${roleStyles.cardBg} border border-white/[0.04] p-3 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-40 bg-white/15 rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-white/10 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LAYOUT VARIANT: CARDS / REPO ── */}
      {layout === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${roleStyles.borderAccent} ${roleStyles.boxBg} p-4 space-y-3 relative overflow-hidden shadow-lg`}
            >
              <div
                className={`absolute inset-0 ${roleStyles.laser} pointer-events-none`}
                style={{ animationDelay: `${(i % 3) * 150}ms` }}
              />
              <div className={`aspect-video w-full rounded-xl ${roleStyles.cardBg} relative overflow-hidden border border-white/5`} />
              <div className="h-4 w-3/4 bg-white/15 rounded animate-pulse relative z-10" />
              <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse relative z-10" />
              <div className="pt-2 flex justify-between items-center relative z-10">
                <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

