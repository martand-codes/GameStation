import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ShieldCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface ReviewVelocityChartProps {
  data: Array<{
    day: string;
    approved: number;
    pending: number;
    rejected: number;
  }>;
}

export default function ReviewVelocityChart({ data }: ReviewVelocityChartProps) {
  const totalApproved = data.reduce((acc, curr) => acc + curr.approved, 0);
  const totalPending = data.reduce((acc, curr) => acc + curr.pending, 0);
  const totalRejected = data.reduce((acc, curr) => acc + curr.rejected, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-[#0e0e16]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl font-mono text-xs space-y-1 z-50">
          <div className="text-white font-bold border-b border-white/[0.08] pb-1">
            {label} Review Throughput
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Approved:</span>
            <span className="font-bold">{payload.find((p: any) => p.dataKey === 'approved')?.value || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-400">
            <span>Pending:</span>
            <span className="font-bold">{payload.find((p: any) => p.dataKey === 'pending')?.value || 0}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-red-400">
            <span>Rejected:</span>
            <span className="font-bold">{payload.find((p: any) => p.dataKey === 'rejected')?.value || 0}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d14] border border-white/[0.08] shadow-xl space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF1E27]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Certification Desk Velocity
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            Weekly reviewer evaluation throughput &amp; compliance turnaround
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalApproved} Approved</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalPending} Pending</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>{totalRejected} Rejected</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-48 sm:h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
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
              fontFamily="monospace"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="approved" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

