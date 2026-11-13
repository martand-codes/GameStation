import React from 'react';
import { Terminal, Shield, Key, HardDrive, Laptop, Smartphone } from 'lucide-react';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-8 font-mono select-none max-w-6xl mx-auto">
      {/* ── 0. AMBIENT DIAGNOSTIC CONNECTION BADGE ── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            CITIZEN_CREDENTIALS // RING-3 IDENTITY · DECRYPTING SESSIONS &amp; VAULT...
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          GAMESTATION SEC-PROTOCOL // IDENTITY KEYRING v2.4
        </span>
      </div>

      {/* ── 1. TOP CITIZEN IDENTITY CARD SKELETON ── */}
      <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        {/* Laser Sweep */}
        <div className="absolute inset-0 laser-emerald pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar Box Placeholder */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#161B22] border border-emerald-500/30 flex items-center justify-center relative overflow-hidden shrink-0">
              <Terminal className="w-8 h-8 text-emerald-400/50 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-36 bg-white/20 rounded animate-pulse" />
                <div className="h-5 w-20 bg-emerald-500/20 rounded border border-emerald-500/30 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-48 bg-white/10 rounded animate-pulse" />
                <span className="text-[#30363D]">•</span>
                <div className="h-3.5 w-32 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Telemetry Metrics Row Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#21262D] text-xs relative z-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#161B22]/70 border border-[#21262D] p-3.5 rounded-lg space-y-1.5"
            >
              <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-20 bg-emerald-500/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. TAB CONTROLS SKELETON ── */}
      <div className="flex items-center gap-2 border-b border-[#21262D] pb-3">
        <div className="h-9 w-44 bg-emerald-500/20 rounded-lg border border-emerald-500/30 animate-pulse" />
        <div className="h-9 w-40 bg-[#161B22] rounded-lg animate-pulse" />
      </div>

      {/* ── 3. PROFILE SETTINGS & SECURITY GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form: Identity Parameters */}
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 laser-emerald pointer-events-none" />

          <div className="flex items-center gap-2 pb-3 border-b border-[#21262D] relative z-10">
            <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="h-4 w-44 bg-white/15 rounded animate-pulse" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-[#161B22] border border-[#30363D] rounded-md animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-[#161B22] border border-[#30363D] rounded-md animate-pulse" />
            </div>
            <div className="pt-2">
              <div className="h-10 w-36 bg-emerald-600/30 border border-emerald-500/40 rounded-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Form: Cryptographic Key Rotation */}
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 laser-emerald pointer-events-none" />

          <div className="flex items-center gap-2 pb-3 border-b border-[#21262D] relative z-10">
            <Key className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="h-4 w-48 bg-white/15 rounded animate-pulse" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-[#161B22] border border-[#30363D] rounded-md animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-[#161B22] border border-[#30363D] rounded-md animate-pulse" />
            </div>
            <div className="pt-2">
              <div className="h-10 w-44 bg-cyan-600/30 border border-cyan-500/40 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. HARDWARE RIG & DEVICE SESSIONS SKELETON ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 laser-emerald pointer-events-none" />
          <div className="h-4 w-44 bg-white/15 rounded animate-pulse relative z-10" />
          <div className="space-y-2 relative z-10">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-10 bg-[#161B22]/70 rounded-md border border-[#21262D] animate-pulse" />
            ))}
          </div>
        </div>

        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 laser-emerald pointer-events-none" />
          <div className="h-4 w-40 bg-white/15 rounded animate-pulse relative z-10" />
          <div className="space-y-2 relative z-10">
            {[1, 2].map((idx) => (
              <div key={idx} className="h-16 bg-[#161B22]/70 rounded-md border border-[#21262D] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

