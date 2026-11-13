import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Users,
  Wallet,
  Activity,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Building2,
  Sparkles,
  CheckCircle2,
  Store,
  Star,
  MessageSquare,
  Cpu,
  Volume2,
  Eye,
  Wifi,
} from 'lucide-react';
import { getDeveloperDashboardMetricsAPI } from '../Services/Game.service';
import { getStudioReviewsAPI, type StudioReviewsFeedResponse } from '../Services/Review.service';
import { useAuth } from '../Context/AuthContext';
import { useToast } from '../Context/ToastContext';
import { QADossierModal } from '../Components/Admin/QADossierModal';
import DeveloperSkeleton from '../Components/Developer/DeveloperSkeleton';
import { getCachedData, setCachedData } from '../Utils/sessionCache';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const cachedDev = getCachedData<any>('developer_dashboard_metrics');
  const [loading, setLoading] = useState(() => !cachedDev);
  const [selectedStudioId, setSelectedStudioId] = useState<string>('ALL');
  const [metrics, setMetrics] = useState<any>(() => cachedDev?.metrics || null);
  const [reviewsData, setReviewsData] = useState<StudioReviewsFeedResponse | null>(() => cachedDev?.reviewsData || null);
  const [selectedDossierGame, setSelectedDossierGame] = useState<any | null>(null);

  const fetchDashboardMetrics = async (studioId?: string) => {
    try {
      const cacheKey = `developer_dashboard_metrics_${studioId ?? selectedStudioId}`;
      const hasCache = Boolean(getCachedData(cacheKey));
      if (!hasCache) {
        setLoading(true);
      }
      const targetStudioId = studioId ?? selectedStudioId;
      const minScan = !hasCache ? new Promise((resolve) => setTimeout(resolve, 380)) : Promise.resolve();
      const [data, reviewsRes] = await Promise.all([
        getDeveloperDashboardMetricsAPI(targetStudioId),
        getStudioReviewsAPI(targetStudioId).catch(() => null),
        minScan,
      ]);
      setMetrics(data);
      setReviewsData(reviewsRes);
      setCachedData(cacheKey, { metrics: data, reviewsData: reviewsRes }, 120_000);
      setCachedData('developer_dashboard_metrics', { metrics: data, reviewsData: reviewsRes }, 120_000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch studio telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics(selectedStudioId);
  }, [selectedStudioId]);

  const isElevated = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const kpis = metrics?.kpis || {
    totalTitles: 0,
    publishedTitles: 0,
    pendingTitles: 0,
    rejectedTitles: 0,
    draftTitles: 0,
    totalPlayers: 0,
    grossRevenue: 0,
    netRevenue: 0,
  };

  const performance = metrics?.performance || [];
  const recentActivity = metrics?.recentActivity || [];
  const studiosList = metrics?.studiosList || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none font-sans">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="dev-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.22 }}
          >
            <DeveloperSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="dev-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* ── Top Header Strip ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Studio Forge // Command Center
            </span>

            {isElevated ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sovereign Overseer View
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                @{user?.username}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white font-mono mt-1.5">
            Studio Command Center
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Real-time pipeline diagnostics, telemetry analytics, and storefront performance tracking.
          </p>
        </div>

        {/* Controls Strip: Studio Filter & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Elevated Studio Switcher (Only visible to OWNER & ADMIN) */}
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

          {/* Sync Button */}
          <button
            onClick={() => fetchDashboardMetrics()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
            title="Refresh studio telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>

          {/* Draft New Title CTA */}
          <button
            onClick={() => navigate('/developer/games/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Draft New Title
          </button>

          {/* Owner Fast-Track to Storefront Banner */}
          {user?.role === 'OWNER' && (
            <button
              onClick={() => navigate('/platform/governance/campaigns')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
              title="Configure Storefront Hero Spotlight & Campaign Banner"
            >
              <Store className="w-3.5 h-3.5 text-cyan-400" />
              <span>Storefront Banner</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Metrics Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Active Published Titles */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Storefront Catalog
              </span>
              <h3 className="text-xs font-bold text-neutral-300 uppercase font-mono mt-0.5">
                Active Titles
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {kpis.publishedTitles}
            </span>
            <span className="text-xs font-mono text-neutral-500">
              / {kpis.totalTitles} total
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live on Store
            </span>
            <span>{kpis.pendingTitles > 0 ? `${kpis.pendingTitles} in QA` : 'Zero backlog'}</span>
          </div>
        </div>

        {/* Total Player Acquisition */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Audience Reach
              </span>
              <h3 className="text-xs font-bold text-neutral-300 uppercase font-mono mt-0.5">
                Total Acquisition
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {kpis.totalPlayers.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-neutral-500">players</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Player Libraries
            </span>
            <span>Organic installs</span>
          </div>
        </div>

        {/* Net Studio Revenue */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Developer Share (70%)
              </span>
              <h3 className="text-xs font-bold text-neutral-300 uppercase font-mono mt-0.5">
                Net Revenue
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              ₹{kpis.netRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="text-neutral-500">Gross: ₹{kpis.grossRevenue.toLocaleString('en-IN')}</span>
            <span className="text-amber-400">Sovereign 70/30</span>
          </div>
        </div>

        {/* QA Certification Health */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Compliance Protocol
              </span>
              <h3 className="text-xs font-bold text-neutral-300 uppercase font-mono mt-0.5">
                QA Health
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {kpis.publishedTitles > 0
                ? `${Math.round((kpis.publishedTitles / (kpis.totalTitles || 1)) * 100)}%`
                : '0%'}
            </span>
            <span className="text-xs font-mono text-neutral-500">pass rate</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="text-emerald-400">{kpis.publishedTitles} Certified</span>
            <span className="text-neutral-500">{kpis.rejectedTitles} Rejections</span>
          </div>
        </div>

        {/* Community Sentiment & Reviews */}
        <div
          onClick={() => navigate('/developer/reviews')}
          className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/50 hover:bg-neutral-900/30 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
                Player Satisfaction
              </span>
              <h3 className="text-xs font-bold text-neutral-300 uppercase font-mono mt-0.5">
                Review Rating
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Star className="w-4 h-4 fill-purple-400/20 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            {(reviewsData?.summary?.totalReviews || 0) > 0 ? (
              <>
                <span className="text-3xl font-black font-mono text-white flex items-center gap-1.5">
                  {reviewsData?.summary?.averageRating ? reviewsData.summary.averageRating.toFixed(1) : '0.0'}
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  ({reviewsData?.summary?.totalReviews} reviews)
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold font-mono text-neutral-400">
                  No Reviews
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  (0 reviews)
                </span>
              </>
            )}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-purple-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {reviewsData?.summary?.unansweredCount
                ? `${reviewsData.summary.unansweredCount} pending replies`
                : 'All answered'}
            </span>
            <span className="text-neutral-500 group-hover:text-purple-300 transition-colors">Manage →</span>
          </div>
        </div>
      </div>

      {/* ── Community Review Radar & Technical Telemetry Strip ────────────────────── */}
      <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Star className="w-5 h-5 fill-purple-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  Community Sentiment & Technical Radar
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  (reviewsData?.summary?.totalReviews || 0) > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}>
                  {reviewsData?.summary?.totalReviews ? (reviewsData.summary.sentiment || 'Positive') : 'NO REVIEWS'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Hardware optimization, gameplay satisfaction, audio, visuals, and stability telemetry gathered from verified players.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/developer/reviews')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0 self-start md:self-auto cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Reviews Suite</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Technical Deep Dive Sub-Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
          {/* Optimization */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Optimization
              </span>
              <span className="font-bold text-white">
                {reviewsData?.summary?.deepDiveAverages?.optimization ? reviewsData.summary.deepDiveAverages.optimization.toFixed(1) : '5.0'}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${((reviewsData?.summary?.deepDiveAverages?.optimization || 5) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Fun Factor */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> Fun Factor
              </span>
              <span className="font-bold text-white">
                {reviewsData?.summary?.deepDiveAverages?.funFactor ? reviewsData.summary.deepDiveAverages.funFactor.toFixed(1) : '5.0'}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${((reviewsData?.summary?.deepDiveAverages?.funFactor || 5) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Sound Design */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Sound Design
              </span>
              <span className="font-bold text-white">
                {reviewsData?.summary?.deepDiveAverages?.soundDesign ? reviewsData.summary.deepDiveAverages.soundDesign.toFixed(1) : '5.0'}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                style={{ width: `${((reviewsData?.summary?.deepDiveAverages?.soundDesign || 5) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Visuals */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Visuals & Art
              </span>
              <span className="font-bold text-white">
                {reviewsData?.summary?.deepDiveAverages?.visuals ? reviewsData.summary.deepDiveAverages.visuals.toFixed(1) : '5.0'}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${((reviewsData?.summary?.deepDiveAverages?.visuals || 5) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Netcode */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-rose-400" /> Netcode / Stability
              </span>
              <span className="font-bold text-white">
                {reviewsData?.summary?.deepDiveAverages?.stabilityNetcode ? reviewsData.summary.deepDiveAverages.stabilityNetcode.toFixed(1) : '5.0'}/5
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                style={{ width: `${((reviewsData?.summary?.deepDiveAverages?.stabilityNetcode || 5) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Game Performance & Activity Stream ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Performance Table */}
        <div className="lg:col-span-2 bg-[#0e0e14] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Studio Title Performance ({performance.length})
              </h3>
            </div>

            <button
              onClick={() => navigate('/developer/portal')}
              className="text-xs font-mono text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              Full Studio Portal &rarr;
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left font-sans">
              <thead className="bg-neutral-950/60 border-b border-neutral-800/80">
                <tr>
                  <th className="py-3 px-5 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                    Game Title
                  </th>
                  <th className="py-3 px-4 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                    Base Pricing
                  </th>
                  <th className="py-3 px-4 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                    Players
                  </th>
                  <th className="py-3 px-4 text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                    Net Revenue
                  </th>
                  <th className="py-3 px-5 text-neutral-400 font-mono text-[11px] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {performance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                      No titles found for this studio. Click "+ Draft New Title" to begin.
                    </td>
                  </tr>
                ) : (
                  performance.map((game: any) => {
                    const isPublished = game.status === 'PUBLISHED';
                    const isPending = game.status === 'PENDING';
                    const isRejected = game.status === 'REJECTED';

                    return (
                      <tr key={game.id} className="hover:bg-neutral-800/20 transition-colors group">
                        {/* Title & Cover */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={game.coverImageUrl || '/placeholder.png'}
                              alt=""
                              className="w-10 h-14 object-cover rounded bg-black border border-neutral-800 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                {game.title}
                                <span className="text-[10px] text-neutral-500 font-mono font-normal">
                                  {game.version}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                {game.genre || 'Action'} {isElevated && `• @${game.developer?.username}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isPublished
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                                : isRejected
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPublished
                                  ? 'bg-emerald-400'
                                  : isPending
                                  ? 'bg-blue-400'
                                  : isRejected
                                  ? 'bg-rose-400'
                                  : 'bg-neutral-500'
                              }`}
                            />
                            {game.status}
                          </span>
                        </td>

                        {/* Pricing */}
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-200">
                          {game.price === 0 ? 'FREE' : `₹${game.price.toLocaleString('en-IN')}`}
                        </td>

                        {/* Players */}
                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {game.players.toLocaleString('en-IN')}
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          ₹{game.netRevenue.toLocaleString('en-IN')}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* QA Dossier Viewer */}
                            {game.qaNotes && (
                              <button
                                onClick={() => setSelectedDossierGame(game)}
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-colors cursor-pointer"
                                title="View QA Certification Dossier"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Configure Game */}
                            <button
                              onClick={() => navigate(`/developer/games/${game.id}`)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                              title="Open Game Studio Config"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>

                            {/* Reviews Link */}
                            <button
                              onClick={() => navigate(`/developer/reviews?gameId=${game.id}`)}
                              className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-colors cursor-pointer"
                              title="View Game Reviews & Reply"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Storefront View */}
                            {isPublished && (
                              <button
                                onClick={() => navigate(`/store/games/${game.id}`)}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                                title="Preview on Live Storefront"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Studio Telemetry & Recent Activity Feed */}
        <div className="bg-[#0e0e14] border border-neutral-800/80 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Operations Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">FLIGHT RECORDER</span>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                No recent activity recorded for this studio.
              </div>
            ) : (
              recentActivity.map((act: any) => {
                let icon = <Activity className="w-4 h-4 text-blue-400" />;
                let iconBg = 'bg-blue-500/10 border-blue-500/20';

                if (act.type === 'CERTIFICATION') {
                  icon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;
                  iconBg = 'bg-emerald-500/10 border-emerald-500/20';
                } else if (act.type === 'VERSION') {
                  icon = <Layers className="w-4 h-4 text-purple-400" />;
                  iconBg = 'bg-purple-500/10 border-purple-500/20';
                } else if (act.type === 'SUBMISSION') {
                  icon = <Clock className="w-4 h-4 text-amber-400" />;
                  iconBg = 'bg-amber-500/10 border-amber-500/20';
                }

                return (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60 flex items-start gap-3 hover:border-neutral-700 transition-colors"
                  >
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${iconBg}`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{act.title}</div>
                      <p className="text-[11px] text-neutral-400 font-sans mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* QA Certification Dossier Modal */}
      <QADossierModal
        game={selectedDossierGame}
        onClose={() => setSelectedDossierGame(null)}
      />
    </div>
  );
}
