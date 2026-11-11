import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Gamepad2, LayoutDashboard, Settings, BarChart3, Wallet, LogOut, UserCircle, Crown, MessageSquare } from 'lucide-react';

export default function DeveloperLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  }

  return (
    <div className="h-screen w-full bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-black tracking-widest text-emerald-400 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            GAMESTATION
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono uppercase tracking-widest">Developer Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user?.role === 'OWNER' && (
            <div className="pb-2 mb-2 border-b border-neutral-800">
              <NavLink to="/platform/governance" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${isActive ? 'bg-amber-950/40 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-amber-400/80 hover:bg-neutral-900 hover:text-amber-300 border border-amber-500/20'}`}>
                <Crown className="w-5 h-5 text-amber-400" /> Governance Cockpit
              </NavLink>
            </div>
          )}
          <NavLink to="/developer/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>
          <NavLink to="/developer/portal" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'}`}>
            <Settings className="w-5 h-5" /> Game Studio
          </NavLink>
          <NavLink to="/developer/reviews" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'}`}>
            <MessageSquare className="w-5 h-5" /> Player Reviews
          </NavLink>
          <NavLink to="/developer/analytics" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'}`}>
            <BarChart3 className="w-5 h-5" /> Analytics
          </NavLink>
          <NavLink to="/developer/revenue" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white border border-transparent'}`}>
            <Wallet className="w-5 h-5" /> Revenue
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg font-bold text-neutral-400 hover:bg-red-900/20 hover:text-red-400 transition-colors border border-transparent">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="md:hidden font-black text-emerald-400 tracking-widest">GS DEV</div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">
              [ Switch to Player View ]
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-neutral-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.username || 'Developer'}</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-emerald-500 tracking-widest">{user?.role || 'DEVELOPER'}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <UserCircle className="w-6 h-6 text-neutral-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-black relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
