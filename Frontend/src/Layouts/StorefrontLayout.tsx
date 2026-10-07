import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, Gamepad2, ShoppingCart, LogOut, Code, ChevronRight, Folder, Box, Heart } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
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
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Breadcrumb logic
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // Base breadcrumb
    const base = [
      { name: 'gamestation', path: '/store' },
      { name: 'src', path: '/store' }
    ];

    if (path === '/store') {
      return [...base, { name: 'views', path: '/store' }, { name: 'index.tsx', path: '/store', isCurrent: true }];
    } else if (path.includes('/store/browse')) {
      return [...base, { name: 'views', path: '/store/browse' }, { name: 'browse.ts', path: '/store/browse', isCurrent: true }];
    } else if (path.includes('/store/library')) {
      return [...base, { name: 'db', path: '/store/library' }, { name: 'library.db', path: '/store/library', isCurrent: true }];
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
            {(user?.role === 'DEVELOPER' || user?.role === 'ADMIN') && (
              <button 
                onClick={() => navigate('/dev/dashboard')}
                className="hidden md:flex items-center gap-2 text-xs text-[#8B949E] hover:text-emerald-400 transition-colors"
              >
                <Code className="h-4 w-4" />
                <span>[SWITCH_TO_DEV]</span>
              </button>
            )}

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
              <div className="absolute right-0 mt-2 w-48 bg-[#0D1117] border border-[#30363D] rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-[#30363D]">
                  <p className="text-xs text-[#8B949E]">Current User:</p>
                  <p className="text-sm text-emerald-400 font-bold">@{user?.username || 'guest'}</p>
                </div>
                <div className="p-1">
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
