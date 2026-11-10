import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  ShieldCheck,
  Layers,
  Users,
  History,
  Store,
  Crown,
  LogOut,
  Clock,
  Menu,
  X,
  RefreshCw,
  Terminal,
  Activity,
} from 'lucide-react';
import { getAdminDashboardMetricsAPI } from '../Services/Admin.service';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [metrics, setMetrics] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      const data = await getAdminDashboardMetricsAPI();
      setMetrics(data);
    } catch {
      // quiet fail on background check
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Operations Center',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/certification',
      label: 'Certification Desk',
      icon: ShieldCheck,
      badge: metrics?.kpis?.pendingCertifications ? String(metrics.kpis.pendingCertifications) : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      to: '/admin/catalog',
      label: 'Storefront Catalog',
      icon: Layers,
    },
    {
      to: '/admin/users',
      label: 'User Support & Bans',
      icon: Users,
      badge: metrics?.kpis?.suspendedUsers ? String(metrics.kpis.suspendedUsers) : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      to: '/admin/logs',
      label: 'Staff Action Logs',
      icon: History,
    },
  ];

  const isOwner = user?.role === 'OWNER';

  return (
    <div
      className="min-h-screen text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200"
      style={{
        background: 'linear-gradient(180deg, #050814 0%, #080E1F 50%, #060A17 100%)',
      }}
    >
      {/* ── Operator Navy Topbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-blue-900/40 bg-[#070C1C]/90 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between shadow-[0_4px_20px_rgba(3,7,18,0.5)]">
        {/* Left: Brand & Clearance Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-[#0D152B] border border-blue-900/40"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.45)] border border-blue-400/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm tracking-wider text-white uppercase group-hover:text-blue-400 transition-colors">
                  GameStation
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.2 rounded uppercase">
                  OPS
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                Staff Operations Desk
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-blue-900/40 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              {isOwner ? 'ROOT CLEARANCE (OWNER)' : 'LEVEL-1 STAFF CLEARANCE'}
            </span>
          </div>
        </div>

        {/* Right: Quick Jumps (RGB Triad), Live Clock & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Owner Quick Switch to Sovereign Cockpit (RED) */}
          {isOwner && (
            <button
              onClick={() => navigate('/platform/governance')}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,30,39,0.25)]"
              title="Switch to Sovereign Governance Enclave"
            >
              <Crown className="w-3.5 h-3.5 text-[#FF1E27]" />
              <span>Sovereign Enclave</span>
            </button>
          )}

          {/* Jump to Storefront (GREEN) */}
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 transition-all cursor-pointer"
            title="Open Storefront View"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Storefront</span>
          </button>

          {/* Time Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D152B] border border-blue-900/40 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{timeString}</span>
          </div>

          {/* Operator Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-blue-900/40">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/30 flex items-center justify-center text-xs font-mono font-bold text-white shadow-inner">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-mono font-bold text-white block leading-none">
                @{user?.username || 'Staff_Operator'}
              </span>
              <span className="text-[10px] font-mono text-blue-400 block mt-0.5 uppercase">
                {isOwner ? 'Platform Owner' : 'Operator Staff'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0D152B] hover:bg-rose-950/30 border border-blue-900/40 hover:border-rose-500/30 transition-colors ml-1 cursor-pointer"
              title="Terminate Operator Session"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Shell Body ───────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Navy Operator) */}
        <aside className="w-64 border-r border-blue-900/40 bg-[#070C1C]/70 backdrop-blur-md hidden md:flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            {/* Operator Desk Header Label */}
            <div className="px-3 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                Operator Deck // Level-1
              </span>
            </div>

            {/* Navigation Matrix */}
            <nav className="space-y-1.5 font-mono">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-[0_0_18px_rgba(37,99,235,0.4)] border border-blue-400/40'
                        : 'text-slate-400 hover:text-white hover:bg-[#0D152B] border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom Telemetry Card */}
          <div className="space-y-3 pt-4 border-t border-blue-900/40 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="uppercase font-bold text-blue-400">System Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>Database Latency:</span>
                <span className="font-bold text-emerald-400">
                  {metrics?.telemetry?.dbLatencyMs !== undefined ? `${metrics.telemetry.dbLatencyMs}ms` : '3ms'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>Certification Queue:</span>
                <span className="font-bold text-blue-300">
                  {metrics?.kpis?.pendingCertifications || 0} Pending
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center font-mono">
              GameStation &bull; Navy Blue Operations
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="relative z-10 w-72 h-full bg-[#070C1C] border-r border-blue-900/50 flex flex-col justify-between p-5 shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-mono font-bold text-sm text-white">Operator Deck</span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-2 font-mono text-xs">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                              : 'text-slate-400 hover:text-white hover:bg-[#0D152B]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-blue-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                <div className="pt-4 border-t border-blue-900/40 space-y-2">
                  {isOwner && (
                    <button
                      onClick={() => {
                        navigate('/platform/governance');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-bold text-red-300 bg-red-950/40 border border-red-500/30"
                    >
                      <Crown className="w-4 h-4 text-[#FF1E27]" />
                      <span>Sovereign Enclave (Red)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate('/store');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30"
                  >
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Storefront (Green)</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Route Workspace Canvas */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

