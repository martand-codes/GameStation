import { motion } from 'framer-motion';
import { Flame, UserCheck, TrendingUp, Layers } from 'lucide-react';

interface EmpireMetricsProps {
  metrics: {
    totalGrossVolume?: number | string;
    platformRevenueCut?: number | string;
    pendingReviewQueue?: number;
    activeStaffMembers?: number;
  } | null;
}

export default function EmpireMetrics({ metrics }: EmpireMetricsProps) {
  const cards = [
    {
      title: 'Gross Marketplace Volume',
      badge: 'Storefront',
      badgeColor: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
      value: `₹ ${metrics?.totalGrossVolume ? Number(metrics.totalGrossVolume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`,
      isRed: false,
      note: 'Cumulative player purchases',
      icon: TrendingUp,
      iconColor: '#10B981',
      dotColor: '#10B981',
    },
    {
      title: 'Platform Royalties (30%)',
      badge: 'Treasury Cut',
      badgeColor: 'bg-red-950/50 text-[#FF1E27] border-red-500/30 font-bold',
      value: `₹ ${metrics?.platformRevenueCut ? Number(metrics.platformRevenueCut).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`,
      isRed: true,
      note: 'Sovereign retained cut',
      icon: Flame,
      iconColor: '#FF1E27',
      dotColor: '#FF1E27',
    },
    {
      title: 'Active Certification Queue',
      badge: 'Review Desk',
      badgeColor: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
      value: String(metrics?.pendingReviewQueue ?? 0),
      isRed: false,
      note: 'Developer games pending inspection',
      icon: Layers,
      iconColor: '#F59E0B',
      dotColor: '#F59E0B',
    },
    {
      title: 'Certified Staff Force',
      badge: 'Operators',
      badgeColor: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
      value: String(metrics?.activeStaffMembers ?? 0),
      isRed: false,
      note: 'Appointed review guild operators',
      icon: UserCheck,
      iconColor: '#A1A1AA',
      dotColor: '#A1A1AA',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative p-5 rounded-2xl overflow-hidden group transition-all duration-300"
          style={{
            background: '#0d0d12',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {card.title}
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${card.badgeColor}`}
            >
              {card.badge}
            </span>
          </div>

          {/* Metric Value */}
          <div className="my-2.5">
            <span
              className={`text-3xl font-black font-mono tracking-tight ${
                card.isRed
                  ? 'text-[#FF1E27] drop-shadow-[0_0_18px_rgba(255,30,39,0.35)]'
                  : 'text-white'
              }`}
            >
              {card.value}
            </span>
          </div>

          {/* Footer Status */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.05]">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: card.dotColor, boxShadow: `0 0 6px ${card.dotColor}` }}
            />
            <span className="text-xs text-zinc-400 font-sans truncate">{card.note}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
