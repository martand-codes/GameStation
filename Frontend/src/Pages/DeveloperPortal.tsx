import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getGamesAPI, deleteGameAPI } from '../Services/Game.service';
import { useNavigate } from 'react-router-dom';
import { Plus, Gamepad2, Settings, ExternalLink, Trash2, Search, Code, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DeveloperPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'DEVELOPER' || user?.role === 'ADMIN' || user?.role === 'OWNER') {
      fetchGames();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getGamesAPI();
      setGames(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load titles from developer registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(gameId);
      await deleteGameAPI(gameId);
      setGames(prev => prev.filter(g => g.id !== gameId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete game");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> PUBLISHED
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> IN REVIEW
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded border bg-red-500/10 text-red-400 border-red-500/30">
            <AlertCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded border bg-neutral-900 text-neutral-400 border-neutral-700">
            DRAFT
          </span>
        );
    }
  };

  if (user?.role !== 'DEVELOPER' && user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
    return (
      <div className="p-8 text-center font-mono mt-20 max-w-md mx-auto bg-[#0C1017] border border-red-500/30 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.15)]">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400 opacity-80" />
        <h2 className="text-xl font-bold mb-2 text-white">DEVELOPER CLEARANCE REQUIRED</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Your current account role is <span className="text-amber-400 font-bold">[{user?.role || 'GUEST'}]</span>. Only accounts registered as Developer, Admin, or Owner can access Game Studio.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/store')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Return to Store
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-[#161B22] hover:bg-[#21262D] text-neutral-300 font-bold rounded-lg text-xs transition-colors border border-neutral-700"
          >
            Sign In / Register as Developer
          </button>
        </div>
      </div>
    );
  }

  // Filter games
  const filteredGames = games.filter(g => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalTitles = games.length;
  const publishedCount = games.filter(g => g.status === 'PUBLISHED').length;
  const pendingCount = games.filter(g => g.status === 'PENDING').length;
  const draftCount = games.filter(g => g.status === 'DRAFT').length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Code className="text-emerald-400 w-8 h-8" />
            Game Studio
          </h1>
          <p className="text-neutral-400 text-sm">
            Deploy, configure, and manage titles published across the GameStation network.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/developer/games/new')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Initialize New Draft
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0C1017] border border-[#223145] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-1">Total Titles</p>
          <p className="text-2xl font-black text-white">{totalTitles}</p>
        </div>
        <div className="bg-[#0C1017] border border-[#223145] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">Published</p>
          <p className="text-2xl font-black text-emerald-400">{publishedCount}</p>
        </div>
        <div className="bg-[#0C1017] border border-[#223145] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold mb-1">In Review</p>
          <p className="text-2xl font-black text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-[#0C1017] border border-[#223145] rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">Drafts</p>
          <p className="text-2xl font-black text-neutral-400">{draftCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-[#080B10] p-4 rounded-xl border border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search titles, genres, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 pl-10 pr-4 py-2 rounded-lg text-xs text-white placeholder-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PUBLISHED', 'PENDING', 'DRAFT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border shrink-0 ${
                statusFilter === tab
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-[#0D1117] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-200 rounded-lg text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Game Titles Grid */}
      {loading ? (
        <div className="text-center p-16 text-neutral-500 font-mono tracking-widest animate-pulse">
          INITIALIZING_STUDIO_REGISTRY...
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center p-16 border border-neutral-800 border-dashed rounded-xl text-neutral-500 bg-[#07090E]">
          <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
          <p className="text-base font-bold text-neutral-300 mb-1">No matching titles located.</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try modifying your search query or status filter.'
              : 'Begin by initializing your studio\'s first game draft.'}
          </p>
          <button
            onClick={() => navigate('/developer/games/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Initialize Draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const banner = game.media?.bannerImageUrl || game.media?.coverImageUrl;
            const pricing = game.pricing?.[0];
            const isFree = pricing?.isFree;
            const priceVal = pricing?.price ? Number(pricing.price) : 0;
            const playersCount = game._count?.library || 0;
            const latestVersion = game.versions?.[0]?.version || '0.1.0';

            return (
              <div 
                key={game.id} 
                className="border border-[#1E2633] bg-[#0A0E15] rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group flex flex-col hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              >
                {/* Banner / Media Thumbnail */}
                <div className="h-40 bg-[#05070A] relative shrink-0 overflow-hidden border-b border-[#1E2633]">
                  {banner ? (
                    <img 
                      src={banner} 
                      alt={game.title} 
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-gradient-to-b from-[#0D1117] to-black">
                      <Gamepad2 className="w-10 h-10 mb-1 opacity-40 text-emerald-400" />
                      <span className="text-[10px] text-neutral-600 font-mono">NO_BANNER_ATTACHED</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 shadow-lg">
                    {getStatusBadge(game.status)}
                  </div>

                  {/* Genre Tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                      {game.genre}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate" title={game.title}>
                      {game.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#8B949E] mb-4 line-clamp-2 flex-1">
                    {game.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#06080D] rounded border border-[#1A2230] text-[11px] mb-4 font-mono">
                    <div>
                      <p className="text-[10px] text-neutral-500">BASE PRICE</p>
                      <p className="font-bold text-white">
                        {isFree ? (
                          <span className="text-emerald-400">FREE</span>
                        ) : priceVal > 0 ? (
                          `₹${priceVal.toFixed(0)}`
                        ) : (
                          <span className="text-neutral-500">TBD</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">PLAYERS</p>
                      <p className="font-bold text-blue-400">{playersCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">VERSION</p>
                      <p className="font-bold text-purple-400">v{latestVersion}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1E2633] mt-auto">
                    {/* Delete button (DRAFT only) */}
                    {game.status === 'DRAFT' ? (
                      <button
                        onClick={() => handleDeleteGame(game.id, game.title)}
                        disabled={deletingId === game.id}
                        className="text-neutral-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 transition-colors text-xs flex items-center gap-1 disabled:opacity-50"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">DELETE</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/store/games/${game.id}`)}
                        className="text-neutral-500 hover:text-cyan-400 p-1.5 rounded hover:bg-cyan-950/20 transition-colors text-xs flex items-center gap-1"
                        title="View Live Store Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-[10px]">STORE</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/developer/games/${game.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:border-emerald-400 text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        CONFIG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
