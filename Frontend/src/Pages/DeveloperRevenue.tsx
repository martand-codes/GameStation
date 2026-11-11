import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Download,
  Building2,
  RefreshCw,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getDeveloperDashboardMetricsAPI } from '../Services/Game.service';
import { useAuth } from '../Context/AuthContext';
import { useToast } from '../Context/ToastContext';

export default function DeveloperRevenue() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedStudioId, setSelectedStudioId] = useState<string>('ALL');
  const [metrics, setMetrics] = useState<any>(null);

  const isElevated = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const fetchMetrics = async (studioId?: string) => {
    try {
      setLoading(true);
      const data = await getDeveloperDashboardMetricsAPI(studioId ?? selectedStudioId);
      setMetrics(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load revenue ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedStudioId);
  }, [selectedStudioId]);

  const performance = metrics?.performance || [];
  const studiosList = metrics?.studiosList || [];
  const kpis = metrics?.kpis || { totalTitles: 0, grossRevenue: 0, netRevenue: 0 };
  const platformFee = Math.round(kpis.grossRevenue * 0.3);

  const exportEarningsCSV = () => {
    if (performance.length === 0) {
      toast.warning('No financial records to export.');
      return;
    }

    const headers = ['Game Title', 'Studio', 'Status', 'Base Price (INR)', 'Players', 'Gross Revenue (INR)', 'Studio Net Cut (70%)'];
    const rows = performance.map((g: any) => [
      `"${g.title}"`,
      `"${g.developer?.username || user?.username}"`,
      g.status,
      g.price,
      g.players,
      g.grossRevenue,
      g.netRevenue,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gamestation_studio_earnings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Earnings statement exported to CSV');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <Wallet className="w-3.5 h-3.5" />
              Sovereign Treasury // Developer Payout Ledger
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white font-mono mt-1.5">
            Revenue & Settlements
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Transparent 70/30 platform revenue split, payout balances, and sales receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isElevated && studiosList.length > 0 && (
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <select
                value={selectedStudioId}
                onChange={(e) => setSelectedStudioId(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 font-mono outline-none cursor-pointer pr-2"
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  All Studios ({studiosList.reduce((acc: number, s: any) => acc + s.gamesCount, 0)} Titles)
                </option>
                {studiosList.map((studio: any) => (
                  <option key={studio.id} value={studio.id} className="bg-neutral-900 text-white">
                    @{studio.username} ({studio.gamesCount} titles)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={exportEarningsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => fetchMetrics()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Revenue Financial Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Total Gross Platform Sales
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            ₹{kpis.grossRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-neutral-500 mt-2 font-mono">
            100% Volume processed
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Platform Protocol Royalty (30%)
          </div>
          <div className="text-3xl font-black font-mono text-neutral-400 mt-2">
            ₹{platformFee.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-neutral-500 mt-2 font-mono">
            Server, CDN & Ring-3 QA infrastructure
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-emerald-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
            Studio Net Earnings (70%)
          </div>
          <div className="text-3xl font-black font-mono text-emerald-300 mt-2">
            ₹{kpis.netRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursable Balance
          </div>
        </div>
      </div>

      {/* Title Revenue Breakdown Table */}
      <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Title Revenue Distribution
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            Direct Studio Remittance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-neutral-950/60 border-b border-neutral-800/80 font-mono text-[11px] text-neutral-400 uppercase">
              <tr>
                <th className="py-3 px-5">Title</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Sold Units</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Studio Share (70%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {performance.map((game: any) => (
                <tr key={game.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white">{game.title}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {isElevated ? `@${game.developer?.username}` : game.genre}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    {game.price === 0 ? 'FREE' : `₹${game.price.toLocaleString('en-IN')}`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    {game.players.toLocaleString('en-IN')} units
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    ₹{game.grossRevenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-right">
                    ₹{game.netRevenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
