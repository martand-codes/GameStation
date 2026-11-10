import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import {
  Flame,
  LayoutDashboard,
  ShieldCheck,
  AlertOctagon,
  Layers,
  Landmark,
  Users,
  Store,
  Code2,
  LogOut,
  Clock,
  Plus,
  RefreshCw,
  Key,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { getEmpireMetricsAPI, createStaffInviteAPI } from '../Services/Governance.service';
import IssueInviteModal from '../Pages/Governance/components/IssueInviteModal';
import SystemTelemetryModal from '../Pages/Governance/components/SystemTelemetryModal';
import SovereignGreeterGate from '../Pages/Governance/components/SovereignGreeterGate';

export default function GovernanceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [metrics, setMetrics] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(() => {
    return sessionStorage.getItem('gamestation_sovereign_session_cleared') === 'true';
  });
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const tick = () =>
      setTimeString(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [location.pathname]);

  const fetchMetrics = async () => {
    try {
      const data = await getEmpireMetricsAPI();
      setMetrics(data);
    } catch {
      // quiet fail on background metric check
    }
  };

  const handleCreateInvite = async (expiryHours: number) => {
    try {
      const res = await createStaffInviteAPI({ role: 'ADMIN', expiresInHours: Number(expiryHours) });
      return `${window.location.origin}/staff/accept-invitation?token=${res.invite.token}`;
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to issue invite');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    {
      to: '/platform/governance',
      label: 'Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/certification/queue',
      label: 'Certification Desk',
      icon: ShieldCheck,
      badge: metrics?.pendingReviewQueue ? String(metrics.pendingReviewQueue) : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      to: '/platform/governance/emergency',
      label: 'Emergency Controls',
      icon: AlertOctagon,
    },
    {
      to: '/platform/governance/catalog',
      label: 'Game Catalog',
      icon: Layers,
    },
    {
      to: '/platform/governance/treasury',
      label: 'Treasury & Revenue',
      icon: Landmark,
    },
    {
      to: '/platform/governance/users',
      label: 'User Directory',
      icon: Users,
    },
  ];

  // Restrict to OWNER
  if (user?.role !== 'OWNER') {
    return (
      <main className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-sm w-full text-center space-y-4 p-8 rounded-2xl bg-[#0e0e14] border border-red-500/20 shadow-2xl">
          <AlertOctagon className="w-9 h-9 mx-auto text-[#FF1E27]" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">Restricted Access</h2>
          <p className="text-xs text-zinc-400">
            Governance is reserved for the root platform owner. Current role: <span className="font-mono text-zinc-200">{user?.role || 'Guest'}</span>
          </p>
          <button
            onClick={() => navigate('/store')}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase text-white bg-zinc-800 hover:bg-zinc-700"
          >
            Return to Storefront
          </button>
        </div>
      </main>
    );
  }

  // Sovereign Enclave Master Key Gate (Required Once Per Session)
  if (!isSessionUnlocked) {
    return <SovereignGreeterGate onUnlocked={() => setIsSessionUnlocked(true)} />;
  }

  const handleLockEnclave = () => {
    sessionStorage.removeItem('gamestation_sovereign_session_cleared');
    setIsSessionUnlocked(false);
  };

  return (
    <div className="h-screen w-full bg-[#07070a] text-zinc-100 flex overflow-hidden font-sans select-none">
      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 border-r border-white/[0.06] bg-[#09090e] flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27] shadow-[0_0_15px_rgba(255,30,39,0.25)] shrink-0">
              <Flame className="w-4 h-4 text-[#FF1E27]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest uppercase font-mono text-white">GAMESTATION</span>
              </div>
              <span className="text-[10px] font-mono text-[#FF1E27] font-bold tracking-wider uppercase block">
                Platform Owner
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium font-mono transition-all ${
                  isActive
                    ? 'bg-[#181824] text-white border border-red-500/40 shadow-[0_0_15px_rgba(255,30,39,0.15)] font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className="w-4 h-4 shrink-0 text-zinc-400" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Platform Switches & User Profile */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {/* Quick Directive Action */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-mono font-bold text-white bg-[#FF1E27] hover:bg-[#E0151E] shadow-[0_0_15px_rgba(255,30,39,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Issue Staff Directive</span>
          </button>

          {/* Cross-portal link buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => navigate('/store')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-white bg-[#121218] hover:bg-[#1a1a22] border border-white/[0.06] transition-colors"
            >
              <Store className="w-3 h-3" />
              <span>Storefront</span>
            </button>
            <button
              onClick={() => navigate('/developer/dashboard')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-white bg-[#121218] hover:bg-[#1a1a22] border border-white/[0.06] transition-colors"
            >
              <Code2 className="w-3 h-3" />
              <span>Studio</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="pt-2 flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#121218] border border-white/[0.06]">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate font-mono">@{user?.username}</span>
              <span className="text-[9px] font-mono text-zinc-500 block truncate">Root Sovereign</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleLockEnclave}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
                title="Lock Sovereign Enclave"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ───────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-72 bg-[#09090e] border-r border-white/[0.08] flex flex-col z-10 h-full p-4 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-[#FF1E27]" />
                  <span className="text-xs font-mono font-black tracking-widest text-white uppercase">
                    GAMESTATION
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#14141e]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium font-mono transition-all ${
                        isActive
                          ? 'bg-[#181824] text-white border border-red-500/40 font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-zinc-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsInviteModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-[#FF1E27]"
              >
                Issue Staff Directive
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-white/[0.06] bg-[#09090e]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-[#121218] border border-white/[0.06]"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 truncate">
              GameStation Governance
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live UTC Clock */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-[#FF1E27]" />
              <span className="tabular-nums">{timeString}</span>
            </div>

            {/* System Health / Diagnostics */}
            <button
              onClick={() => setIsTelemetryModalOpen(true)}
              className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-300 hover:text-white px-2.5 py-1 rounded-full bg-[#121218] hover:bg-[#1a1a24] border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer group active:scale-95"
              title="Click to view Live System Telemetry Diagnostics"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] group-hover:scale-125 transition-transform" />
              <span>Systems Nominal</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal for Issuing Staff Directives */}
      <IssueInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleCreateInvite}
      />

      {/* Modal for Live System Telemetry */}
      <SystemTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
      />
    </div>
  );
}

