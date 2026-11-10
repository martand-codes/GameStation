import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

interface GenreDonutChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

const COLORS = ['#FF1E27', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'];

export default function GenreDonutChart({ data }: GenreDonutChartProps) {
  const totalGames = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="p-2.5 rounded-xl bg-[#0e0e16]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl font-mono text-xs space-y-0.5 z-50">
          <div className="text-white font-bold">{item.name}</div>
          <div className="text-zinc-400 text-[10px]">
            {item.value} Titles &bull; <span className="text-[#FF1E27] font-bold">{item.payload.percentage}%</span> of catalog
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d14] border border-white/[0.08] shadow-xl space-y-4 flex flex-col justify-between">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF1E27]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Catalog by Genre
          </h3>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans">
          Marketplace distribution &amp; title density
        </p>
      </div>

      {/* Donut Chart with Centered Total */}
      <div className="h-44 sm:h-52 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="#0d0d14"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
          <span className="text-xl sm:text-2xl font-black text-white">{totalGames}</span>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Titles</span>
        </div>
      </div>

      {/* Segment Legend */}
      <div className="space-y-1.5 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-zinc-300 truncate max-w-[120px]">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>{item.value}</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-white font-bold w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

