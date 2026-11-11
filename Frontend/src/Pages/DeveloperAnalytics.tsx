import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Gamepad2,
  RefreshCw,
  Building2,
  PieChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getDeveloperDashboardMetricsAPI } from '../Services/Game.service';
import { useAuth } from '../Context/AuthContext';
import { useToast } from '../Context/ToastContext';

export default function DeveloperAnalytics() {
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
      toast.error(err.response?.data?.message || 'Failed to load studio analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedStudioId);
  }, [selectedStudioId]);

  const performance = metrics?.performance || [];
  const studiosList = metrics?.studiosList || [];
  const kpis = metrics?.kpis || { totalTitles: 0, publishedTitles: 0, totalPlayers: 0, netRevenue: 0 };

  // Calculate genre distribution
  const genreCount: Record<string, number> = {};
  performance.forEach((g: any) => {
    const genre = g.genre || 'Action';
    genreCount[genre] = (genreCount[genre] || 0) + 1;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              Studio Telemetry & Distribution Insights
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white font-mono mt-1.5">
            Studio Analytics
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Deep telemetry, audience reach demographics, and title engagement distributions.
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
            onClick={() => fetchMetrics()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Total Player Base
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {kpis.totalPlayers.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-blue-400 mt-2 font-mono flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Total Library Copies Distributed
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Average Copies Per Title
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {kpis.totalTitles > 0 ? Math.round(kpis.totalPlayers / kpis.totalTitles) : 0}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Conversion Baseline
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Storefront Penetration
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">
            {kpis.totalTitles > 0 ? `${Math.round((kpis.publishedTitles / kpis.totalTitles) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Published vs Draft Ratio
          </div>
        </div>
      </div>

      {/* Genre Breakdown & Title Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Breakdown */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Studio Genre Portfolio
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(genreCount).map(([genre, count]) => {
              const pct = Math.round((count / (performance.length || 1)) * 100);
              return (
                <div key={genre} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-200">{genre}</span>
                    <span className="text-neutral-400">{count} titles ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Titles by Player Engagement */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Player Engagement Ranking
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
            {performance.map((game: any, idx: number) => (
              <div
                key={game.id}
                className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-xs text-neutral-500">
                    #{idx + 1}
                  </span>
                  <img
                    src={game.coverImageUrl || '/placeholder.png'}
                    alt=""
                    className="w-8 h-11 object-cover rounded bg-black shrink-0 border border-neutral-800"
                  />
                  <div>
                    <div className="font-bold text-xs text-white truncate max-w-[200px]">
                      {game.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {game.genre} • ₹{game.price}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-emerald-400">
                    {game.players.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500">players</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
