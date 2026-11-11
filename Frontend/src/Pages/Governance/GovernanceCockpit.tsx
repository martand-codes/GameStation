import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import {
  getEmpireMetricsAPI,
  getEmpireChartMetricsAPI,
  getStaffMembersAPI,
  getStaffInvitesAPI,
  createStaffInviteAPI,
  revokeStaffInviteAPI,
  revokeStaffMemberAPI,
  getAuditLogsAPI,
  getStorefrontBannerAPI,
} from '../../Services/Governance.service';
import {
  ShieldCheck,
  Plus,
  Users,
  Key,
  Terminal,
  Shield,
  Lock,
  Activity,
  TerminalSquare,
  BarChart3,
  Store,
  ArrowRight,
} from 'lucide-react';

import EmpireMetrics from './components/EmpireMetrics';
import EmpireRevenueChart from './components/charts/EmpireRevenueChart';
import GenreDonutChart from './components/charts/GenreDonutChart';
import ReviewVelocityChart from './components/charts/ReviewVelocityChart';
import StaffRosterTable from './components/StaffRosterTable';
import ActiveInvitesTable from './components/ActiveInvitesTable';
import FlightRecorderLogs from './components/FlightRecorderLogs';
import IssueInviteModal from './components/IssueInviteModal';

export default function GovernanceCockpit() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [banner, setBanner] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'invites' | 'logs'>('staff');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [m, charts, s, inv, logs, bannerRes] = await Promise.all([
        getEmpireMetricsAPI(),
        getEmpireChartMetricsAPI(),
        getStaffMembersAPI(),
        getStaffInvitesAPI(),
        getAuditLogsAPI(),
        getStorefrontBannerAPI().catch(() => null),
      ]);
      setMetrics(m);
      setChartData(charts);
      setStaff(s);
      setInvites(inv);
      setAuditLogs(logs);
      if (bannerRes) setBanner(bannerRes);
    } catch (e: any) {
      console.error('Governance fetch failed:', e);
    }
  };

  const handleCreateInvite = async (expiryHours: number) => {
    try {
      const res = await createStaffInviteAPI({ role: 'ADMIN', expiresInHours: Number(expiryHours) });
      fetchData();
      toast.success('Staff invitation token generated');
      return `${window.location.origin}/staff/accept-invitation?token=${res.invite.token}`;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to issue invite');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!confirm('Permanently invalidate this token?')) return;
    try {
      await revokeStaffInviteAPI(id);
      fetchData();
      toast.success('Invitation token permanently invalidated');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to revoke token');
    }
  };

  const handleRevokeStaff = async (id: string, username: string) => {
    if (!confirm(`Revoke reviewer clearance for @${username}?`)) return;
    try {
      await revokeStaffMemberAPI(id);
      fetchData();
      toast.success(`Revoked reviewer clearance for @${username}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to revoke staff clearance');
    }
  };

  const TABS = [
    { id: 'staff', label: 'Staff Roster', count: staff.length, icon: Users },
    { id: 'invites', label: 'Active Tokens', count: invites.length, icon: Key },
    { id: 'logs', label: 'Flight Recorder', count: auditLogs.length, icon: Terminal },
  ] as const;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── 1. OWNER WELCOME HEADER ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-7 rounded-2xl border border-white/[0.08] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,30,39,0.08) 0%, rgba(13,13,18,0.95) 60%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px -5px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#FF1E27] tracking-wider uppercase">
              Root Sovereign Clearance
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              Air-Gapped Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-[#FF1E27]">@{user?.username}</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl font-normal leading-relaxed">
            Direct sovereign authority over marketplace revenues, reviewer permissions, and platform security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => navigate('/platform/governance/campaigns')}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95"
            title="Configure Live Storefront Hero Spotlight & Campaign Banner"
          >
            <Store className="w-3.5 h-3.5 text-cyan-400" />
            <span>Storefront Banner</span>
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-white bg-[#FF1E27] hover:bg-[#E0151E] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,30,39,0.35)] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Issue Staff Directive</span>
          </button>
          <button
            onClick={() => navigate('/certification/queue')}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1c1c28] border border-white/[0.08] transition-all cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF1E27]" />
            <span>Review Queue ({metrics?.pendingReviewQueue || 0})</span>
          </button>
        </div>
      </motion.div>

      {/* ── 2. EMPIRE PULSE METRICS ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Platform Treasury &amp; Real-time Pulse
          </span>
        </div>
        <EmpireMetrics metrics={metrics} />
      </motion.div>

      {/* ── 2.5 STOREFRONT CAMPAIGN SPOTLIGHT (SOVEREIGN BROADCAST) ───── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07 }}
        className="p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(13,17,23,0.95) 70%)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {banner?.eventTag || 'LIVE STOREFRONT CAMPAIGN'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                {banner?.isActive !== false ? 'BROADCASTING ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {banner?.eventName || 'CYBER HARVEST // STOREFRONT GENESIS'}
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl line-clamp-1 font-mono">
              {banner?.description || 'Discover premier titles from iconic developer studios with certified Ring-3 stability.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/platform/governance/campaigns')}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
          >
            <span>Edit Storefront Banner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] transition-all cursor-pointer"
          >
            <span>View Live</span>
          </button>
        </div>
      </motion.div>

      {/* ── 3. PICTORIAL ANALYTICS & REVENUE SUITE ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FF1E27]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Pictorial Analytics &amp; Yield Vectors
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
            Live Streamed
          </span>
        </div>

        {/* Row 1: Dual-Area Inflow Chart (2 Cols on lg) + Genre Donut (1 Col on lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EmpireRevenueChart
              data={chartData?.revenueTimeline || []}
              platformRoyaltyRate={chartData?.platformRoyaltyRate || 30}
            />
          </div>
          <div className="lg:col-span-1">
            <GenreDonutChart data={chartData?.genreDistribution || []} />
          </div>
        </div>

        {/* Row 2: Weekly Review Velocity Bar Chart */}
        <div>
          <ReviewVelocityChart data={chartData?.reviewVelocity || []} />
        </div>
      </motion.div>

      {/* ── 4. COMPACT SENTINEL DEFENSE HUD ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-5 rounded-2xl border border-white/[0.08] bg-[#0d0d12] space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#FF1E27]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Cryptographic Security Sentinel
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
            All 4 Pillars Fortified
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#121218] border border-white/[0.05] flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#FF1E27] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate font-mono">BIP-39 Vault Seed</span>
              <span className="text-[10px] text-zinc-500 block truncate">12-Word Air-Gapped</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121218] border border-white/[0.05] flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate font-mono">Genesis Route</span>
              <span className="text-[10px] text-emerald-400 block truncate">Permanently Sealed</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121218] border border-white/[0.05] flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate font-mono">Session Sentinel</span>
              <span className="text-[10px] text-zinc-500 block truncate">Killswitch Armed</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121218] border border-white/[0.05] flex items-center gap-3">
            <TerminalSquare className="w-4 h-4 text-[#FF1E27] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate font-mono">Break-Glass CLI</span>
              <span className="text-[10px] text-zinc-500 block truncate font-mono">npm run root:recover</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 4. STAFF OPERATIONS GUILD ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-4 pt-2"
      >
        {/* Segmented Control */}
        <div className="flex items-center justify-between">
          <div
            className="p-1 rounded-xl flex items-center gap-1"
            style={{ background: '#0d0d12', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            {TABS.map(({ id, label, count, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                  style={{ color: isActive ? '#ffffff' : '#71717a' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="cockpitSubTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      className="absolute inset-0 rounded-lg bg-[#1a1a24] border border-red-500/40 shadow-[0_0_15px_rgba(255,30,39,0.2)]"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">
                    {label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
            Active Guild Ledger
          </span>
        </div>

        {/* Tab views */}
        <AnimatePresence mode="wait">
          {activeTab === 'staff' && (
            <StaffRosterTable
              key="staff"
              staff={staff}
              currentUserId={user?.id}
              onRevokeStaff={handleRevokeStaff}
            />
          )}
          {activeTab === 'invites' && (
            <ActiveInvitesTable
              key="invites"
              invites={invites}
              onOpenInviteModal={() => setIsInviteModalOpen(true)}
              onRevokeInvite={handleRevokeInvite}
            />
          )}
          {activeTab === 'logs' && <FlightRecorderLogs key="logs" logs={auditLogs} />}
        </AnimatePresence>
      </motion.div>

      {/* Directive Modal */}
      <IssueInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleCreateInvite}
      />
    </div>
  );
}
