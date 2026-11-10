import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Layers,
  Users,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  ChevronRight,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getAdminDashboardMetricsAPI } from '../../Services/Admin.service';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardMetricsAPI();
      setData(res);
    } catch (e) {
      console.error('Failed to load admin metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {
    pendingCertifications: 0,
    liveStorefrontGames: 0,
    hiddenOrModeratedGames: 0,
    rejectedSubmissions: 0,
    totalUsers: 0,
    suspendedUsers: 0,
    activeDevelopers: 0,
  };

  const velocity = data?.velocity || {
    approvedPast24h: 0,
    rejectedPast24h: 0,
    totalReviews24h: 0,
    approvalRatePercent: 100,
  };

  const sovereignStatus = data?.sovereignStatus || {};
  const pendingBacklog = data?.pendingBacklog || [];

  const hasBreachedSLA = pendingBacklog.some((g: any) => g.slaStatus === 'BREACHED');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* ── Sovereign System Advisory (If Owner Armed Any Killswitch) ─── */}
      {(sovereignStatus.maintenanceMode ||
        sovereignStatus.marketplaceFrozen ||
        sovereignStatus.submissionsFrozen ||
        sovereignStatus.broadcastActive) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#0E172E] to-[#0A1024] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 uppercase">
                  SOVEREIGN DIRECTIVE ACTIVE:
                </span>
                {sovereignStatus.maintenanceMode && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.2 rounded text-[10px] uppercase font-bold">
                    Maintenance Mode
                  </span>
                )}
                {sovereignStatus.marketplaceFrozen && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded text-[10px] uppercase font-bold">
                    Marketplace Frozen
                  </span>
                )}
                {sovereignStatus.submissionsFrozen && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded text-[10px] uppercase font-bold">
                    Submissions Locked
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5 font-sans">
                {sovereignStatus.maintenanceNotice ||
                  sovereignStatus.broadcastMessage ||
                  'The platform Owner has active killswitch directives armed across GameStation.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:inline shrink-0">
            ROOT LEVEL STATUS
          </span>
        </motion.div>
      )}

      {/* ── Top Header Strip ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Operations Command Center</span>
            </h1>
            <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/70 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              OPERATOR FLIGHT DECK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live submission queue monitoring, 24h review velocity, and platform catalog health
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white bg-[#0D152B] hover:bg-[#131F3F] border border-blue-900/40 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* ── KPI Deck (Navy / Cobalt Blue) ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Certification */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/admin/certification')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-lg group relative overflow-hidden ${
            hasBreachedSLA
              ? 'bg-gradient-to-br from-rose-950/40 to-[#0A1024] border-rose-500/40 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
              : 'bg-gradient-to-br from-blue-950/40 to-[#0A1024] border-blue-500/30 hover:border-blue-400 shadow-[0_4px_20px_rgba(30,58,138,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300">
              Pending Certification
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                hasBreachedSLA
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-blue-600/20 border-blue-500/30 text-blue-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {kpis.pendingCertifications}
            </span>
            {hasBreachedSLA && (
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase animate-pulse">
                SLA Breached
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-blue-900/30">
            <span>Awaiting Review</span>
            <span className="text-blue-400 group-hover:underline flex items-center gap-1 font-bold">
              Open Queue <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* Card 2: 24h Review Velocity */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-5 rounded-2xl border border-blue-900/40 bg-[#090F24] shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              24h Review Velocity
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {velocity.totalReviews24h}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {velocity.approvalRatePercent}% Approved
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-blue-900/30">
            <span className="text-emerald-400">+{velocity.approvedPast24h} Approved</span>
            <span className="text-rose-400">-{velocity.rejectedPast24h} Rejected</span>
          </div>
        </motion.div>

        {/* Card 3: Live Storefront Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={() => navigate('/admin/catalog')}
          className="p-5 rounded-2xl border border-blue-900/40 bg-[#090F24] cursor-pointer hover:border-blue-500/40 transition-all shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Live Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#0D152B] border border-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {kpis.liveStorefrontGames}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-blue-900/30">
            <span>Published Titles</span>
            <span className="text-blue-400 group-hover:underline flex items-center gap-1 font-bold">
              Inspect Catalog <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* Card 4: Moderation Triage */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl border border-blue-900/40 bg-[#090F24] cursor-pointer hover:border-blue-500/40 transition-all shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Moderation Triage
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {kpis.suspendedUsers + kpis.hiddenOrModeratedGames}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-blue-900/30">
            <span>{kpis.suspendedUsers} Suspended</span>
            <span className="text-rose-400 font-bold">{kpis.hiddenOrModeratedGames} Delisted</span>
          </div>
        </motion.div>
      </div>

      {/* ── Recharts Telemetry Visualizers (24h Review Velocity & System Triage) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Review Velocity Horizon */}
        <div className="p-5 rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Certification Decision Trends
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {velocity.approvalRatePercent}% Approval Rate
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { period: 'Past 48h', approved: Math.max(1, Math.round(velocity.approvedPast24h * 1.4)), rejected: Math.round(velocity.rejectedPast24h * 1.2) },
                  { period: 'Past 24h', approved: velocity.approvedPast24h, rejected: velocity.rejectedPast24h },
                  { period: 'Current Active', approved: velocity.approvedPast24h, rejected: velocity.rejectedPast24h },
                  { period: 'Queue Backlog', approved: pendingBacklog.length, rejected: 0 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050814',
                    borderColor: '#1E3A8A',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#FFFFFF',
                  }}
                />
                <Area type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                <Area type="monotone" dataKey="rejected" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorRejected)" name="Rejected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: System Catalog & Moderation Volume */}
        <div className="p-5 rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Platform Volume Distribution
            </span>
            <span className="text-[10px] font-mono text-blue-400/80 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full">
              Live Horizon
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { metric: 'Storefront', count: kpis.liveStorefrontGames, color: '#10B981' },
                  { metric: 'Pending', count: kpis.pendingCertifications, color: '#3B82F6' },
                  { metric: 'Delisted', count: kpis.hiddenOrModeratedGames, color: '#F59E0B' },
                  { metric: 'Suspended', count: kpis.suspendedUsers, color: '#F43F5E' },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#1E293B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050814',
                    borderColor: '#1E3A8A',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#FFFFFF',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  <Cell fill="#10B981" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#F43F5E" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Interactive Live Backlog Queue & SLA Monitor ────────────────── */}
      <div className="p-6 rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <span>Certification Backlog &amp; SLA Monitor</span>
                <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/70 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {pendingBacklog.length} QUEUED
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Oldest pending developer submissions prioritized by submission timestamp
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/certification')}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.35)] shrink-0"
          >
            <span>Launch Certification Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Backlog Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {pendingBacklog.map((game: any) => {
            const cover = game.media?.coverImageUrl;
            const edition = game.pricing?.[0];
            const version = game.versions?.[0]?.version || '1.0.0';

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/admin/certification`)}
                className="p-4 rounded-xl bg-[#0D152B] border border-blue-900/30 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-18 rounded-lg bg-[#060B18] border border-blue-900/40 overflow-hidden shrink-0 relative flex items-center justify-center">
                    {cover ? (
                      <img src={cover} alt={game.title} className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-6 h-6 text-slate-600" />
                    )}
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold bg-black/80 text-slate-300 px-1 rounded">
                      {game.genre}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold font-mono text-white truncate group-hover:text-blue-300 transition-colors">
                        {game.title}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.2 rounded shrink-0">
                        v{version}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      Studio: <strong className="text-slate-200">@{game.developer?.username}</strong>
                    </p>

                    <div className="text-[10px] font-mono text-slate-400">
                      Pricing:{' '}
                      <strong className="text-blue-400">
                        {edition?.isFree ? 'FREE' : `₹ ${edition?.price || '0.00'}`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bottom SLA Pill Strip */}
                <div className="pt-2 border-t border-blue-900/20 flex items-center justify-between text-[10px] font-mono gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        game.slaStatus === 'BREACHED'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse'
                          : game.slaStatus === 'WARNING'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {game.slaStatus === 'BREACHED'
                        ? `SLA BREACHED (${game.waitingHours}h)`
                        : game.slaStatus === 'WARNING'
                        ? `PRIORITY (${game.waitingHours}h)`
                        : `Awaiting (${game.waitingHours}h)`}
                    </span>

                    {game.assignedAdmin ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        @{game.assignedAdmin.username}
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                    Inspect &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}

          {pendingBacklog.length === 0 && (
            <div className="col-span-full p-12 text-center rounded-xl bg-[#0D152B] border border-blue-900/30 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold font-mono text-white uppercase">
                Certification Horizon Clean
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No developer game packages are currently queued for inspection. All titles have been
                reviewed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Operational Grid (Recent Decisions & Action Stream) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Review Decisions */}
        <div className="p-6 rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Recent Certification Decisions</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Staff Attribution
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {data?.recentCertifications?.map((c: any) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#0D152B] border border-blue-900/30 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">{c.title}</span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Studio: @{c.developer?.username} &bull; Reviewer: @{c.reviewedByAdmin?.username || 'Staff'}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                      c.status === 'PUBLISHED'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            ))}

            {(!data?.recentCertifications || data.recentCertifications.length === 0) && (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No recent certification decisions logged.
              </div>
            )}
          </div>
        </div>

        {/* Staff Operations Action Stream */}
        <div className="p-6 rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Staff Operations Stream</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Flight Recorder
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {data?.recentAuditLogs?.slice(0, 6).map((log: any) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#0D152B] border border-blue-900/30 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-300">
                    @{log.actorName || 'Operator'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed truncate">
                  {log.details}
                </p>
              </div>
            ))}

            {(!data?.recentAuditLogs || data.recentAuditLogs.length === 0) && (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No operational activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
