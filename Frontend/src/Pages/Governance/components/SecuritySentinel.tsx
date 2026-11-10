import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Activity, Terminal, Radio } from 'lucide-react';

export default function SecuritySentinel() {
  const pillars = [
    {
      icon: Lock,
      color: '#FF1E27',
      label: 'BIP-39 Vault Seed',
      sub: '12-Word Key Air-Gapped',
      badge: 'Protected',
    },
    {
      icon: ShieldCheck,
      color: '#10B981',
      label: 'Genesis Route',
      sub: 'Permanently Sealed',
      badge: 'Zero-Access',
      highlightColor: '#10B981',
    },
    {
      icon: Activity,
      color: '#06B6D4',
      label: 'Session Sentinel',
      sub: 'Killswitch Armed',
      badge: 'Live',
    },
    {
      icon: Terminal,
      color: '#FF1E27',
      label: 'Break-Glass CLI',
      sub: 'npm run root:recover',
      badge: 'Verified',
      isMono: true,
    },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6 sm:p-7 select-none"
      style={{
        background: '#0d0d12',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px -5px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Subtle Crimson Gradient Glow behind header */}
      <div
        aria-hidden
        className="absolute top-0 right-1/4 w-96 h-28 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,30,39,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27] shadow-[0_0_16px_rgba(255,30,39,0.2)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Sentinel Defense Matrix
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#FF1E27] bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                100% Armed
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Air-Gapped Vault Security & Zero-Trust Platform Governance
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14141c] border border-red-500/20 text-[#FF1E27] text-xs font-mono font-semibold self-start sm:self-auto shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1E27]" />
          </span>
          <span>AIR-GAPPED VAULT ACTIVE</span>
        </div>
      </div>

      {/* Laser Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="h-2 w-full bg-[#14141b] rounded-full overflow-hidden p-[1px] border border-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-[#FF1E27] to-amber-400 shadow-[0_0_16px_rgba(255,30,39,0.6)]"
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
          <span>BIP-39 Vault Initialized</span>
          <span>Genesis Perimeter Sealed</span>
          <span>Sentinel Monitor Active</span>
          <span className="text-[#FF1E27] font-bold">All 4 Pillars Fortified</span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.label}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#121218] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${pillar.color}15`,
                border: `1px solid ${pillar.color}30`,
              }}
            >
              <pillar.icon className="w-4 h-4" style={{ color: pillar.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-zinc-200 font-mono truncate">
                  {pillar.label}
                </span>
              </div>
              <span
                className={`text-[11px] block mt-0.5 truncate ${
                  pillar.isMono ? 'font-mono text-zinc-400' : 'text-zinc-400'
                }`}
                style={{ color: pillar.highlightColor }}
              >
                {pillar.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
