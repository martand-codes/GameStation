import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Wallet,
  Gamepad2,
  Library,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  Lock,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  UserPlus,
  UserMinus,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  getAdminUsersAPI,
  toggleUserSuspensionAPI,
  getStaffRosterAPI,
  updateUserRoleAPI,
} from '../../Services/Admin.service';
import { createStaffInviteAPI } from '../../Services/Governance.service';
import { useAuth } from '../../Context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentStaff } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCharts, setShowCharts] = useState(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'CITIZENS' | 'STAFF_ROSTER'>('CITIZENS');
  const [staffRoster, setStaffRoster] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Role Transition Dialog State (Owner-Only Action)
  const [roleModalUser, setRoleModalUser] = useState<{
    id: string;
    username: string;
    email: string;
    role: string;
    targetRole: 'ADMIN' | 'PLAYER' | 'DEVELOPER';
  } | null>(null);
  const [roleModalReason, setRoleModalReason] = useState<string>('');
  const [roleModalLoading, setRoleModalLoading] = useState(false);

  // Staff Token Generation Drawer (Available to Owner)
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviteExpiry, setInviteExpiry] = useState(24);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Moderation Dialog State
  const [modTargetUser, setModTargetUser] = useState<any | null>(null);
  const [reasonCategory, setReasonCategory] = useState<string>('TERMS_VIOLATION');
  const [customReason, setCustomReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStaffRoster();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async (query?: string) => {
    try {
      setLoading(true);
      const data = await getAdminUsersAPI(query ?? search, roleFilter, statusFilter);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      setUsers([]);
      setNotification({
        message: err.response?.data?.message || 'Failed to query user registry.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffRoster = async () => {
    try {
      setStaffLoading(true);
      const data = await getStaffRosterAPI();
      setStaffRoster(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load staff roster:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleExecuteRoleChange = async () => {
    if (!roleModalUser) return;
    try {
      setRoleModalLoading(true);
      const res = await updateUserRoleAPI(
        roleModalUser.id,
        roleModalUser.targetRole,
        roleModalReason.trim() || undefined
      );
      setNotification({
        message: res.message || `Role updated successfully to ${roleModalUser.targetRole}.`,
        type: 'success',
      });
      setRoleModalUser(null);
      setRoleModalReason('');
      await Promise.all([fetchUsers(search), fetchStaffRoster()]);
    } catch (err: any) {
      setNotification({
        message: err.response?.data?.message || 'Failed to update user role.',
        type: 'error',
      });
    } finally {
      setRoleModalLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleGenerateInviteToken = async () => {
    try {
      setInviteLoading(true);
      const res = await createStaffInviteAPI({
        role: 'ADMIN',
        expiresInHours: Number(inviteExpiry),
      });
      const link = `${window.location.origin}/staff/accept-invitation?token=${res.invite.token}`;
      setGeneratedInviteLink(link);
      setCopySuccess(false);
    } catch (err: any) {
      setNotification({
        message: err.response?.data?.message || 'Failed to issue staff token (Owner clearance required).',
        type: 'error',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const openSuspensionModal = (targetUser: any) => {
    setModTargetUser(targetUser);
    setReasonCategory(targetUser.isActive ? 'TERMS_VIOLATION' : 'APPEAL_APPROVED');
    setCustomReason('');
  };

  const handleExecuteSuspension = async () => {
    if (!modTargetUser) return;
    try {
      setActionLoading(true);
      const directiveNote = customReason.trim()
        ? `[${reasonCategory}] ${customReason.trim()}`
        : `[${reasonCategory}] Standard operator intervention`;

      await toggleUserSuspensionAPI(modTargetUser.id, directiveNote);

      setNotification({
        message: `Account @${modTargetUser.username} standing updated to ${
          modTargetUser.isActive ? 'SUSPENDED' : 'ACTIVE'
        }.`,
        type: 'success',
      });
      setModTargetUser(null);
      await fetchUsers(search);
    } catch (err: any) {
      setNotification({
        message: err.response?.data?.message || 'Failed to modify account standing.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Safe Metric Counts
  const safeUsers = Array.isArray(users) ? users : [];
  const totalUsers = safeUsers.length;
  const playersCount = safeUsers.filter((u) => u.role === 'PLAYER').length;
  const devsCount = safeUsers.filter((u) => u.role === 'DEVELOPER').length;
  const staffCount = safeUsers.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length;
  const suspendedCount = safeUsers.filter((u) => !u.isActive).length;

  // Chart Telemetry Data
  const roleChartData = [
    { name: 'Players', count: playersCount, color: '#10B981' },
    { name: 'Studios', count: devsCount, color: '#A855F7' },
    { name: 'Staff Ops', count: staffCount, color: '#3B82F6' },
    { name: 'Suspended', count: suspendedCount, color: '#F43F5E' },
  ];

  const totalLibraries = safeUsers.reduce((sum, u) => sum + (u._count?.library || 0), 0);
  const totalPurchases = safeUsers.reduce((sum, u) => sum + (u._count?.payments || 0), 0);
  const totalGamesDev = safeUsers.reduce((sum, u) => sum + (u._count?.games || 0), 0);

  const activityChartData = [
    { name: 'Library Units', count: totalLibraries, color: '#06B6D4' },
    { name: 'Purchases', count: totalPurchases, color: '#10B981' },
    { name: 'Created Titles', count: totalGamesDev, color: '#8B5CF6' },
  ];

  const isOwner = currentStaff?.role === 'OWNER';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 select-none font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto px-4 py-3.5 rounded-xl border font-mono text-xs shadow-2xl flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-[#0D152B] border-blue-500/40 text-blue-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-900/30">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Staff Registry Desk
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-wider text-white">
              User Support &amp; Moderation
            </h1>
          </div>
          <p className="text-xs text-blue-200/70 mt-1 font-sans">
            Citizen records, studio verification, role clearance, session termination, and policy compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Token Generation Button (Available to Owner) */}
          {isOwner && (
            <button
              onClick={() => setShowInviteDrawer(!showInviteDrawer)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Issue Staff Token</span>
            </button>
          )}

          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-900/40 text-blue-300 font-mono text-xs hover:bg-blue-900/30 transition-colors"
          >
            {showCharts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Telemetry Charts</span>
          </button>

          <button
            onClick={() => fetchUsers(search)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800/40 hover:bg-blue-900/40 text-blue-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Registry</span>
          </button>
        </div>
      </div>

      {/* ── Owner Staff Token Issuance Panel ──────────────────────────────── */}
      <AnimatePresence>
        {showInviteDrawer && isOwner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-[#090E1F] border border-blue-500/40 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Sovereign Staff Invitation Gateway
                  </span>
                </div>
                <button
                  onClick={() => setShowInviteDrawer(false)}
                  className="text-blue-300/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-blue-200/70 font-sans leading-relaxed">
                As the Platform Owner, generate single-use, cryptographically verified cryptographic onboarding tokens to assign new <strong className="text-blue-400">ADMIN</strong> staff. Invited operators onboard at <code className="text-white bg-blue-950/80 px-1 py-0.5 rounded">/staff/accept-invitation</code>.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-[#050814] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-blue-200">
                  <span className="text-blue-400/70">Role:</span>
                  <span className="font-bold text-white uppercase">OPERATOR (ADMIN)</span>
                </div>

                <div className="flex items-center gap-2 bg-[#050814] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-blue-200">
                  <span className="text-blue-400/70">TTL Expiry:</span>
                  <select
                    value={inviteExpiry}
                    onChange={(e) => setInviteExpiry(Number(e.target.value))}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer"
                  >
                    <option value={12} className="bg-[#090E1F]">12 Hours</option>
                    <option value={24} className="bg-[#090E1F]">24 Hours</option>
                    <option value={48} className="bg-[#090E1F]">48 Hours</option>
                    <option value={72} className="bg-[#090E1F]">72 Hours</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateInviteToken}
                  disabled={inviteLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  {inviteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Generate Secure Token
                </button>
              </div>

              {generatedInviteLink && (
                <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/50 space-y-2">
                  <div className="text-[11px] text-blue-300 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Staff Onboarding Link Generated:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="flex-1 bg-[#050814] border border-blue-900/60 rounded-lg px-3 py-1.5 text-xs text-blue-100 font-mono select-all outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copySuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copySuccess ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Primary Navigation Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-blue-900/40 pb-3">
        <button
          onClick={() => setActiveTab('CITIZENS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'CITIZENS'
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Registered Citizens</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-blue-300 font-bold">
            {totalUsers}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('STAFF_ROSTER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'STAFF_ROSTER'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Staff Guild Roster</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 font-bold border border-blue-500/30">
            {staffRoster.length} Operators
          </span>
        </button>
      </div>

      {activeTab === 'STAFF_ROSTER' ? (
        <div className="space-y-6">
          {/* Staff Roster Top Banner */}
          <div className="p-5 rounded-2xl bg-[#090E1F] border border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold uppercase text-white tracking-wider">
                  Operator Guild &amp; Governance Roster
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Active platform administrators entrusted with certification review locks, storefront catalog curation, and policy sanctions.
              </p>
            </div>

            {isOwner && (
              <button
                onClick={() => setShowInviteDrawer(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <KeyRound className="w-4 h-4" />
                <span>Issue Cryptographic Token</span>
              </button>
            )}
          </div>

          {/* Staff Member Cards Grid */}
          {staffLoading ? (
            <div className="p-12 text-center text-blue-300/50 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
              Loading staff guild dossier...
            </div>
          ) : staffRoster.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono bg-[#090E1F] rounded-2xl border border-blue-900/30">
              No staff members discovered.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {staffRoster.map((staff) => {
                const isStaffOwner = staff.role === 'OWNER';
                const avatarLetters = (staff.username?.substring(0, 2) || 'OP').toUpperCase();
                const activeReviewCount = staff._count?.assignedGameReviews || 0;
                const certifiedCount = staff._count?.reviewedGames || 0;
                const isCurrentSelf = staff.id === currentStaff?.id;

                return (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-5 border transition-all space-y-4 font-mono shadow-xl relative overflow-hidden ${
                      isStaffOwner
                        ? 'bg-gradient-to-br from-[#12050A] via-[#090E1F] to-[#050814] border-red-500/40 hover:border-red-500/60'
                        : 'bg-[#090E1F] border-blue-900/40 hover:border-blue-700/60'
                    }`}
                  >
                    {/* Top Glow Accent */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        isStaffOwner
                          ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'
                      }`}
                    />

                    {/* Header: Avatar + Identity */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 border ${
                            isStaffOwner
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {avatarLetters}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">@{staff.username}</span>
                            {isCurrentSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 border border-blue-500/40 text-blue-300">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                            {staff.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                          isStaffOwner
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {isStaffOwner ? 'ROOT SOVEREIGN' : 'LEVEL-1 OPERATOR'}
                      </span>
                    </div>

                    {/* Operational Workload Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-blue-900/30 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase block">Active Review Locks</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm ${activeReviewCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {activeReviewCount}
                          </span>
                          <span className="text-[10px] text-slate-500">Tickets</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-blue-900/30 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase block">Titles Certified</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-emerald-400">{certifiedCount}</span>
                          <span className="text-[10px] text-slate-500">Games</span>
                        </div>
                      </div>
                    </div>

                    {/* Standing & Enrolled Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-blue-900/30">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            staff.isActive !== false ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span className="text-white font-medium">
                          {staff.isActive !== false ? 'Active Duty' : 'Suspended'}
                        </span>
                      </div>
                      <span>Enrolled: {new Date(staff.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Operational Directives (Owner Controls) */}
                    {isOwner && (
                      <div className="pt-2 border-t border-blue-900/30 flex items-center justify-end gap-2">
                        {isStaffOwner ? (
                          <span className="text-[10px] text-red-400/60 font-mono px-2 py-1 rounded bg-red-950/20 border border-red-500/20">
                            Root Sovereign &bull; Protected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => openSuspensionModal(staff)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                                staff.isActive !== false
                                  ? 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {staff.isActive !== false ? (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Suspend</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Restore</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() =>
                                setRoleModalUser({
                                  id: staff.id,
                                  username: staff.username,
                                  email: staff.email,
                                  role: staff.role,
                                  targetRole: 'PLAYER',
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-amber-300 hover:text-white bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Revoke Admin clearance and return to Player status"
                            >
                              <UserMinus className="w-3 h-3" />
                              <span>Revoke Clearance</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-blue-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Citizens Enrolled</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{totalUsers}</div>
          <div className="text-[10px] font-mono text-blue-300/50 mt-1">Platform-wide registry</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-emerald-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Players Active</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{playersCount}</div>
          <div className="text-[10px] font-mono text-emerald-300/50 mt-1">Consumer base</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-purple-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Developer Studios</span>
            <Gamepad2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{devsCount}</div>
          <div className="text-[10px] font-mono text-purple-300/50 mt-1">Deploying games</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-rose-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Suspended</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{suspendedCount}</div>
          <div className="text-[10px] font-mono text-rose-300/50 mt-1">Revoked sessions</div>
        </div>
      </div>

      {/* ── Recharts Telemetry Section ──────────────────────────────────────── */}
      <AnimatePresence>
        {showCharts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* Chart 1: Role Distribution */}
            <div className="p-5 rounded-2xl bg-[#090E1F] border border-blue-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Citizen Demographics by Role
                </span>
                <span className="text-[10px] font-mono text-blue-400/60">Live Breakdown</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#1E293B' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#1E293B' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
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
                      {roleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Platform Engagement Activity */}
            <div className="p-5 rounded-2xl bg-[#090E1F] border border-blue-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Aggregated Citizen Activity
                </span>
                <span className="text-[10px] font-mono text-cyan-400/60">Engagement Tape</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#1E293B' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#1E293B' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050814',
                        borderColor: '#0284C7',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#FFFFFF',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {activityChartData.map((entry, index) => (
                        <Cell key={`cell-act-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          {['ALL', 'PLAYER', 'DEVELOPER', 'ADMIN'].map((rl) => (
            <button
              key={rl}
              onClick={() => setRoleFilter(rl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === rl
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-blue-300/60 hover:text-white hover:bg-blue-950/40'
              }`}
            >
              {rl}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email..."
              className="w-full bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-blue-100 placeholder:text-blue-400/30 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-mono font-bold uppercase text-blue-200 transition-colors cursor-pointer shrink-0"
          >
            Filter
          </button>
        </form>
      </div>

      {/* User Table (Responsive wrapper) */}
      <div className="rounded-xl overflow-hidden bg-[#090E1F] border border-blue-900/30 shadow-2xl">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs font-sans min-w-[760px]">
            <thead className="bg-[#070B18] text-blue-300/60 font-mono uppercase tracking-wider border-b border-blue-900/30">
              <tr>
                <th className="py-3.5 px-4">Citizen Identity</th>
                <th className="py-3.5 px-4">Clearance Role</th>
                <th className="py-3.5 px-4">Account Standing</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Platform Activity</th>
                <th className="py-3.5 px-4">Enrolled Date</th>
                <th className="py-3.5 px-4 text-right">Sanctions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blue-300/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                    Querying citizen registry...
                  </td>
                </tr>
              ) : safeUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blue-300/50">
                    No accounts found matching search criteria.
                  </td>
                </tr>
              ) : (
                safeUsers.map((targetUser) => {
                  const isUserOwner = targetUser.role === 'OWNER';
                  const isUserAdmin = targetUser.role === 'ADMIN';
                  const isUserDev = targetUser.role === 'DEVELOPER';
                  const isActive = targetUser.isActive;
                  const username = targetUser.username || 'unknown';
                  const avatarLetters = (username.substring(0, 2) || 'US').toUpperCase();
                  const walletNum = Number(targetUser.walletBalance || 0);

                  // Protection logic: Staff cannot suspend owner or admins (unless current user is owner)
                  const isProtected =
                    isUserOwner ||
                    (isUserAdmin && currentStaff?.role !== 'OWNER') ||
                    targetUser.id === currentStaff?.id;

                  return (
                    <tr key={targetUser.id} className="hover:bg-blue-950/20 transition-colors">
                      {/* Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase font-mono">
                            {avatarLetters}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm font-sans flex items-center gap-2">
                              @{username}
                              {isUserOwner && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                                  Root Sovereign
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-300/50 truncate block max-w-[200px]">
                              {targetUser.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isUserOwner
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : isUserAdmin
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : isUserDev
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {targetUser.role}
                        </span>
                      </td>

                      {/* Standing */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Wallet */}
                      <td className="py-3 px-4 text-white font-bold">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>${walletNum.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Platform Activity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 text-blue-300/70">
                          <span title="Games Published" className="flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3 text-purple-400" />
                            {targetUser._count?.games || 0}
                          </span>
                          <span title="Library Games" className="flex items-center gap-1">
                            <Library className="w-3 h-3 text-cyan-400" />
                            {targetUser._count?.library || 0}
                          </span>
                          <span title="Transactions" className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-400" />
                            {targetUser._count?.payments || 0}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-blue-300/50 text-[11px]">
                        {targetUser.createdAt ? new Date(targetUser.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Sanctions Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Owner 1-Click Role Elevation Controls */}
                          {isOwner && targetUser.id !== currentStaff?.id && (
                            <>
                              {!isUserAdmin && !isUserOwner && (
                                <button
                                  onClick={() =>
                                    setRoleModalUser({
                                      id: targetUser.id,
                                      username: targetUser.username,
                                      email: targetUser.email,
                                      role: targetUser.role,
                                      targetRole: 'ADMIN',
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                                  title="Promote citizen to Staff Admin"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Promote to Admin</span>
                                </button>
                              )}

                              {isUserAdmin && (
                                <button
                                  onClick={() =>
                                    setRoleModalUser({
                                      id: targetUser.id,
                                      username: targetUser.username,
                                      email: targetUser.email,
                                      role: targetUser.role,
                                      targetRole: 'PLAYER',
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all cursor-pointer inline-flex items-center gap-1.5"
                                  title="Revoke Admin clearance and return account to Player"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  <span>Revoke Admin</span>
                                </button>
                              )}
                            </>
                          )}

                          {isProtected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400/40 px-2 py-1 rounded bg-blue-950/40 border border-blue-900/30">
                              <Lock className="w-3 h-3" />
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => openSuspensionModal(targetUser)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Suspend</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Restore</span>
                                </>
                              )}
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
      </div>
      )}

      {/* Suspension / Reactivation Modal */}
      <AnimatePresence>
        {modTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090E1F] border border-blue-800/50 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    {modTargetUser.isActive ? 'Suspend Citizen Account' : 'Restore Citizen Clearance'}
                  </h3>
                </div>
                <button
                  onClick={() => setModTargetUser(null)}
                  className="text-blue-300/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700/40 flex items-center justify-center text-white font-bold uppercase font-mono">
                  {(modTargetUser.username?.substring(0, 2) || 'US').toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">@{modTargetUser.username}</div>
                  <div className="text-xs text-blue-300/60 font-mono">
                    Clearance: [{modTargetUser.role}] &bull; {modTargetUser.email}
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono">
                <label className="text-xs text-blue-200/80 uppercase block">
                  Policy Justification Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {modTargetUser.isActive ? (
                    <>
                      {['TERMS_VIOLATION', 'PAYMENT_FRAUD', 'COMMUNITY_HARASSMENT', 'BOT_EXPLOIT'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReasonCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            reasonCategory === cat
                              ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                              : 'bg-blue-950/20 border-blue-900/40 text-blue-300/60 hover:bg-blue-950/40'
                          }`}
                        >
                          {cat.replace('_', ' ')}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['APPEAL_APPROVED', 'VERIFICATION_CLEARED', 'SECURITY_RESOLVED', 'MANUAL_RESTORE'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReasonCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            reasonCategory === cat
                              ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                              : 'bg-blue-950/20 border-blue-900/40 text-blue-300/60 hover:bg-blue-950/40'
                          }`}
                        >
                          {cat.replace('_', ' ')}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="text-xs text-blue-200/80 uppercase block">
                  Staff Incident Note (Logged with Operator Attribution)
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="State specific infraction or remediation context..."
                  rows={3}
                  className="w-full bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl p-3 text-xs text-blue-100 placeholder:text-blue-400/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/30 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setModTargetUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-blue-950/40 text-blue-300/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteSuspension}
                  className={`px-5 py-2.5 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                    modTargetUser.isActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : modTargetUser.isActive ? (
                    <UserX className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  {modTargetUser.isActive ? 'Execute Suspension' : 'Confirm Restoration'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Staff Role Promotion / Revocation Directive ─────────── */}
      <AnimatePresence>
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-[#0A1024] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5 font-mono"
            >
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
                <div className="flex items-center gap-2.5 text-white">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      roleModalUser.targetRole === 'ADMIN'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {roleModalUser.targetRole === 'ADMIN' ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      {roleModalUser.targetRole === 'ADMIN'
                        ? 'Promote to Staff Admin'
                        : 'Revoke Staff Clearance'}
                    </h3>
                    <span className="text-[10px] text-blue-300/60">
                      Sovereign Directive Protocol
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Target Card */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-blue-900/40 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Target Citizen:</span>
                  <strong className="text-white">@{roleModalUser.username}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-slate-300">{roleModalUser.email}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-blue-900/30">
                  <span className="text-slate-400">Role Transition:</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-slate-400">{roleModalUser.role}</span>
                    <span className="text-blue-400">&rarr;</span>
                    <span
                      className={
                        roleModalUser.targetRole === 'ADMIN'
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }
                    >
                      {roleModalUser.targetRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {roleModalUser.targetRole === 'ADMIN'
                  ? 'Promoting this user grants immediate LEVEL-1 OPERATOR clearance. They will be authorized to claim review tickets, run the QA Sandbox Rig, certify storefront submissions, and moderate titles.'
                  : 'Revoking staff clearance removes Operator Deck access and returns the account to standard citizen standing. Any review tickets currently held by this operator will automatically be released back to the unassigned queue.'}
              </p>

              {/* Optional Directive Rationale */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Induction Directive / Rationale (Optional):
                </label>
                <textarea
                  rows={2}
                  value={roleModalReason}
                  onChange={(e) => setRoleModalReason(e.target.value)}
                  placeholder="e.g. Delegated QA team lead for Phase 3 rollout..."
                  className="w-full bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-[#0D152B] hover:bg-[#131F3F] border border-blue-900/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={roleModalLoading}
                  onClick={handleExecuteRoleChange}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                    roleModalUser.targetRole === 'ADMIN'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                      : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  }`}
                >
                  {roleModalLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                  ) : roleModalUser.targetRole === 'ADMIN' ? (
                    'Confirm Promotion'
                  ) : (
                    'Confirm Revocation'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
