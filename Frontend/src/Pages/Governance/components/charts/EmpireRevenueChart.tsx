import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Coins, Calendar } from 'lucide-react';

interface EmpireRevenueChartProps {
  data: Array<{
    date: string;
    grossVolume: number;
    platformCut: number;
    txCount: number;
  }>;
  platformRoyaltyRate: number;
}

export default function EmpireRevenueChart({ data, platformRoyaltyRate }: EmpireRevenueChartProps) {
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D'>('7D');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const gross = payload.find((p: any) => p.dataKey === 'grossVolume')?.value || 0;
      const cut = payload.find((p: any) => p.dataKey === 'platformCut')?.value || 0;
      const tx = payload[0]?.payload?.txCount || 0;

      return (
        <div className="p-3 rounded-xl bg-[#0e0e16]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl font-mono text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-1.5">
            <span className="text-zinc-300 font-bold">{label}</span>
            <span className="text-[10px] text-zinc-500">{tx} Transactions</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Gross Inflow:</span>
              </span>
              <span className="text-white font-bold">₹ {Number(gross).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[#FF1E27]">
                <span className="w-2 h-2 rounded-full bg-[#FF1E27]" />
                <span>Sovereign ({platformRoyaltyRate}%):</span>
              </span>
              <span className="text-[#FF1E27] font-black">₹ {Number(cut).toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d14] border border-white/[0.08] shadow-xl space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF1E27]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Marketplace Revenue &amp; Treasury Inflow
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            Real-time gross purchase volume mapped against retained {platformRoyaltyRate}% sovereign cuts
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#14141e] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto font-mono text-[10px]">
          {(['7D', '14D', '30D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-[#FF1E27] text-white shadow-[0_0_10px_rgba(255,30,39,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Graph */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="royaltyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF1E27" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#FF1E27" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val}`}
              fontFamily="monospace"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Gross Volume Area */}
            <Area
              type="monotone"
              dataKey="grossVolume"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#grossGrad)"
            />

            {/* Platform Cut Area */}
            <Area
              type="monotone"
              dataKey="platformCut"
              stroke="#FF1E27"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#royaltyGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.04] text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
            <span className="text-zinc-300">Gross Marketplace Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF1E27]" />
            <span className="text-[#FF1E27] font-bold">Sovereign Cut ({platformRoyaltyRate}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <Calendar className="w-3 h-3" />
          <span>Timeline synchronized with Stripe Gateway</span>
        </div>
      </div>
    </div>
  );
}

