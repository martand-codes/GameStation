import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, ShoppingCart, LogOut, Code, ChevronRight, Folder, Box, Heart, Coins, Crown, AlertTriangle, Radio, Megaphone, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useWallet } from '../Context/WalletContext';
import { getPublicBroadcastAPI } from '../Services/Governance.service';
import CartDrawer from '../Components/Store/CartDrawer';
import WishlistDrawer from '../Components/Store/WishlistDrawer';

export default function StorefrontLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [dismissedBroadcast, setDismissedBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState<{
    maintenanceMode?: boolean;
    maintenanceNotice?: string;
    marketplaceFrozen?: boolean;
    broadcastActive?: boolean;
    broadcastMessage?: string;
    broadcastSeverity?: 'INFO' | 'WARNING' | 'CRITICAL';
  } | null>(null);
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { balance } = useWallet();

  useEffect(() => {
    checkBroadcast();
    const interval = setInterval(checkBroadcast, 30000); // 30s probe
    return () => clearInterval(interval);
  }, []);

  const checkBroadcast = async () => {
    try {
      const data = await getPublicBroadcastAPI();
      setBroadcast(data);
    } catch {
      // quiet fail if backend unreachable
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Breadcrumb logic
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // Base breadcrumb
    const base: { name: string; path: string; isCurrent?: boolean }[] = [
      { name: 'gamestation', path: '/store', isCurrent: false },
      { name: 'src', path: '/store', isCurrent: false }
    ];

    if (path === '/store') {
      return [...base, { name: 'views', path: '/store' }, { name: 'index.tsx', path: '/store', isCurrent: true }];
    } else if (path.includes('/store/browse')) {
      return [...base, { name: 'views', path: '/store/browse' }, { name: 'browse.ts', path: '/store/browse', isCurrent: true }];
    } else if (path.includes('/store/library')) {
      return [...base, { name: 'db', path: '/store/library' }, { name: 'library.db', path: '/store/library', isCurrent: true }];
    } else if (path.includes('/store/profile')) {
      return [...base, { name: 'config', path: '/store/profile' }, { name: '.profile', path: '/store/profile', isCurrent: true }];
    } else if (path.includes('/store/wallet')) {
      return [...base, { name: 'config', path: '/store/wallet' }, { name: 'wallet.cfg', path: '/store/wallet', isCurrent: true }];
    } else if (path.includes('/store/friends')) {
      return [...base, { name: 'config', path: '/store/friends' }, { name: 'network.cfg', path: '/store/friends', isCurrent: true }];
    } else if (path.includes('/store/games/')) {
      return [...base, { name: 'modules', path: '/store' }, { name: 'game_instance.exe', path: path, isCurrent: true }];
    }
    
    return [...base, { name: 'unknown', path: path, isCurrent: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-black text-[#A0AEC0] font-mono flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Sovereign Live Platform Marquee Broadcast Engine */}
      {broadcast?.broadcastActive && broadcast?.broadcastMessage && !dismissedBroadcast && (
        <aside
          aria-label="Platform Broadcast"
          className={`border-b text-xs px-4 sm:px-6 py-2.5 flex items-center justify-between font-mono z-50 relative overflow-hidden transition-all ${
            broadcast.broadcastSeverity === 'CRITICAL'
              ? 'bg-[#FF1E27]/20 border-[#FF1E27]/50 text-white shadow-[0_4px_20px_rgba(255,30,39,0.3)]'
              : broadcast.broadcastSeverity === 'WARNING'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.25)]'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.2)]'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 mr-4">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                broadcast.broadcastSeverity === 'CRITICAL'
                  ? 'bg-[#FF1E27] animate-ping'
                  : broadcast.broadcastSeverity === 'WARNING'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <span
              className={`font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 text-[11px] ${
                broadcast.broadcastSeverity === 'CRITICAL'
                  ? 'text-[#FF1E27]'
                  : broadcast.broadcastSeverity === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {broadcast.broadcastSeverity === 'CRITICAL' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : broadcast.broadcastSeverity === 'WARNING' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              {broadcast.broadcastSeverity === 'CRITICAL'
                ? 'CRITICAL ALERT:'
                : broadcast.broadcastSeverity === 'WARNING'
                ? 'ADVISORY NOTICE:'
                : 'PLATFORM BROADCAST:'}
            </span>
            <span className="text-zinc-100 font-medium truncate">
              {broadcast.broadcastMessage}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`text-[9px] font-bold tracking-widest hidden md:inline uppercase px-2 py-0.5 rounded border ${
                broadcast.broadcastSeverity === 'CRITICAL'
                  ? 'bg-red-950/60 border-red-500/30 text-red-300'
                  : broadcast.broadcastSeverity === 'WARNING'
                  ? 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              }`}
            >
              LIVE DISPATCH
            </span>
            {broadcast.broadcastSeverity !== 'CRITICAL' && (
              <button
                onClick={() => setDismissedBroadcast(true)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss Broadcast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Sovereign Emergency Announcement Marquee / Alert */}
      {broadcast?.maintenanceMode && (
        <aside aria-label="System Advisory" className="bg-[#FF1E27]/20 border-b border-[#FF1E27]/40 text-white text-xs px-6 py-2.5 flex items-center justify-between font-mono z-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-ping shrink-0" />
            <span className="font-black text-[#FF1E27] uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              SYSTEM ADVISORY:
            </span>
            <span className="text-zinc-200 truncate">{broadcast.maintenanceNotice || 'Platform undergoing scheduled maintenance.'}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold tracking-widest hidden sm:inline shrink-0 uppercase">
            SOVEREIGN OVERRIDE
          </span>
        </aside>
      )}

      {broadcast?.marketplaceFrozen && !broadcast?.maintenanceMode && (
        <aside aria-label="Marketplace Alert" className="bg-amber-500/15 border-b border-amber-500/30 text-white text-xs px-6 py-2 flex items-center justify-between font-mono z-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              MARKETPLACE NOTICE:
            </span>
            <span className="text-zinc-200 truncate">Platform transactions &amp; checkout are temporarily paused.</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold tracking-widest hidden sm:inline shrink-0 uppercase">
            CHECKOUT PAUSED
          </span>
        </aside>
      )}

      {/* Hacker/Engineer Topbar */}
      <header className="sticky top-0 z-50 border-b border-[#1A202C] bg-[#000000CC] backdrop-blur-md">
        <div className="flex items-center justify-between px-6 h-14">
          
          {/* Logo area */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/store')}>
            <Terminal className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              ~/GameStation
            </span>
          </div>

          {/* Engineer Search (Terminal Input style) */}
          <div className="flex-1 max-w-2xl px-12 hidden md:block">
            <div className={`flex items-center bg-[#0D1117] border ${isSearchActive ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-[#30363D]'} rounded-md px-3 py-1.5 transition-all duration-300`}>
              <span className="text-emerald-500 mr-2 font-bold text-sm">λ</span>
              <input
                type="text"
                className="w-full bg-transparent border-none outline-none text-sm text-[#C9D1D9] placeholder-[#484F58]"
                placeholder="execute query --target=games"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
              />
              <span className="animate-pulse w-1.5 h-4 bg-emerald-500 ml-1 opacity-70"></span>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex items-center gap-6">
            
            {/* Developer Toggle */}
            {(user?.role === 'DEVELOPER' || user?.role === 'ADMIN' || user?.role === 'OWNER') && (
              <button 
                onClick={() => navigate('/developer/dashboard')}
                className="hidden md:flex items-center gap-2 text-xs text-[#8B949E] hover:text-emerald-400 transition-colors px-2 py-1 rounded border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <Code className="h-4 w-4" />
                <span>[SWITCH_TO_DEV]</span>
              </button>
            )}

            {/* PTS Wallet Balance Button */}
            <Link
              to="/store/wallet"
              className="flex items-center gap-1.5 px-3 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 text-emerald-400 font-bold text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)] group"
              title="GameStation PTS Wallet"
            >
              <Coins className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>₹{balance.toFixed(0)} PTS</span>
            </Link>

            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative text-[#8B949E] hover:text-pink-400 transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-sm bg-pink-500/20 text-[10px] font-bold text-pink-400 border border-pink-500/50">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-[#8B949E] hover:text-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-sm bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/50">
                  {items.length}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer border border-[#30363D] px-2 py-1 rounded-md bg-[#0D1117] hover:border-[#8B949E] transition-colors">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-[#C9D1D9]">{user?.username || 'root'}</span>
              </div>
              
              {/* Dropdown UI: Context Menu Style */}
              <div className="absolute right-0 mt-2 w-52 bg-[#0D1117] border border-[#30363D] rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-[#30363D]">
                  <p className="text-xs text-[#8B949E]">Current User:</p>
                  <p className="text-sm text-emerald-400 font-bold">@{user?.username || 'guest'}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">ROLE: {user?.role || 'PLAYER'}</p>
                </div>
                <div className="p-1">
                  {user?.role === 'OWNER' && (
                    <Link to="/platform/governance" className="flex items-center px-3 py-2 text-sm text-yellow-400 hover:bg-[#161B22] rounded-sm font-bold border-b border-[#30363D]/50 mb-1">
                      <Crown className="h-3.5 w-3.5 mr-2 text-yellow-400" /> [governance_suite]
                    </Link>
                  )}
                  {(user?.role === 'DEVELOPER' || user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                    <Link to="/developer/dashboard" className="flex items-center px-3 py-2 text-sm text-emerald-400 hover:bg-[#161B22] rounded-sm font-bold border-b border-[#30363D]/50 mb-1">
                      <Code className="h-3.5 w-3.5 mr-2" /> [dev_portal]
                    </Link>
                  )}
                  <Link to="/store/profile" className="flex items-center px-3 py-2 text-sm text-[#C9D1D9] hover:bg-[#161B22] hover:text-white rounded-sm">
                    <ChevronRight className="h-3 w-3 mr-2" /> .profile
                  </Link>
                  <Link to="/store/wallet" className="flex items-center px-3 py-2 text-sm text-[#C9D1D9] hover:bg-[#161B22] hover:text-white rounded-sm">
                    <ChevronRight className="h-3 w-3 mr-2" /> .wallet
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#161B22] hover:text-red-300 rounded-sm">
                    <LogOut className="h-3 w-3 mr-2" /> exit()
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* IDE-style Sidebar */}
        <aside className="w-64 border-r border-[#1A202C] hidden lg:block bg-[#050505] pt-6 flex-shrink-0">
          <div className="px-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#484F58] font-bold">Explorer</p>
          </div>
          
          <nav className="space-y-1">
            <div className="px-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-[#C9D1D9]">
                <ChevronRight className="h-3 w-3 transition-transform rotate-90" />
                <Folder className="h-4 w-4 text-[#8B949E]" />
                <span className="font-bold">gamestation</span>
              </div>
              
              <div className="ml-5 mt-1 border-l border-[#30363D] pl-2 space-y-1">
                <Link to="/store" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors ${location.pathname === '/store' ? 'text-white bg-[#161B22] border border-[#30363D]' : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#0D1117]'}`}>
                  <Box className="h-3.5 w-3.5 text-blue-400" />
                  index.tsx
                </Link>
                <Link to="/store/browse" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors ${location.pathname.includes('/store/browse') ? 'text-white bg-[#161B22] border border-[#30363D]' : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#0D1117]'}`}>
                  <Box className="h-3.5 w-3.5 text-emerald-400" />
                  browse.ts
                </Link>
                <Link to="/store/library" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors ${location.pathname.includes('/store/library') ? 'text-white bg-[#161B22] border border-[#30363D]' : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#0D1117]'}`}>
                  <Box className="h-3.5 w-3.5 text-purple-400" />
                  library.db
                </Link>
                <Link to="/store/wallet" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors ${location.pathname.includes('/store/wallet') ? 'text-white bg-[#161B22] border border-[#30363D]' : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#0D1117]'}`}>
                  <Box className="h-3.5 w-3.5 text-amber-400" />
                  wallet.cfg
                </Link>
                {(user?.role === 'DEVELOPER' || user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                  <Link to="/developer/dashboard" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors text-emerald-400/90 hover:text-emerald-300 hover:bg-[#0D1117] border border-transparent hover:border-emerald-500/30">
                    <Code className="h-3.5 w-3.5 text-emerald-400" />
                    developer.sh
                  </Link>
                )}
                <Link to="/store/friends" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors ${location.pathname.includes('/store/friends') ? 'text-white bg-[#161B22] border border-[#30363D]' : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#0D1117]'}`}>
                  <Box className="h-3.5 w-3.5 text-orange-400" />
                  network.cfg
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {/* Dynamic Interactive Breadcrumbs */}
          <div className="h-8 border-b border-[#1A202C] flex items-center px-4 bg-[#050505] text-xs font-medium text-[#8B949E]">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.name}>
                <Link 
                  to={crumb.path} 
                  className={`hover:text-emerald-400 transition-colors ${crumb.isCurrent ? 'text-[#C9D1D9]' : ''}`}
                >
                  {crumb.name}
                </Link>
                {index < breadcrumbs.length - 1 && <span className="mx-1.5 opacity-50">&gt;</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="p-6 md:p-10 pb-20 min-h-[calc(100vh-140px)]">
            <Outlet />
          </div>
          
          {/* Hacker Status Footer */}
          <footer className="border-t border-[#1A202C] bg-[#050505] text-[#484F58] text-xs py-4 px-6 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-bold hover:text-emerald-400 cursor-pointer transition-colors">
                  <Terminal className="h-3 w-3" />
                  <span>GameStation v1.0.0</span>
                </div>
                <span className="opacity-50">|</span>
                <span className="hover:text-[#8B949E] cursor-pointer transition-colors">Terms of Execution</span>
                <span className="opacity-50">|</span>
                <span className="hover:text-[#8B949E] cursor-pointer transition-colors">Privacy Directive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                <span>All systems operational.</span>
                <span className="ml-4 opacity-50">&copy; {new Date().getFullYear()} GameStation</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
}
