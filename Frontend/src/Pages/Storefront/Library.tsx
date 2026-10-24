import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Gamepad2, Search, Filter, LayoutGrid, List, Play, Download, 
  ShieldCheck, Clock, HardDrive, ExternalLink, ArrowRight, RefreshCw, AlertCircle, RotateCcw
} from 'lucide-react';
import { getPlayerLibraryAPI, type LibraryItem } from '../../Services/Library.service';
import { recordPlaytimeAPI } from '../../Services/Telemetry.service';
import GameLauncherModal from '../../Components/Store/GameLauncherModal';
import DigitalLicenseModal from '../../Components/Store/DigitalLicenseModal';
import VersionHistoryModal from '../../Components/Store/VersionHistoryModal';
import RefundRequestModal from '../../Components/Store/RefundRequestModal';

export default function Library() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    '> [FS_MOUNT] Querying /dev/sda1/games/user_library.db...',
    '> [SEC_AUTH] Validating DRM tokens against GameStation keystore...'
  ]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'playtime'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Interactive Modals
  const [launchingItem, setLaunchingItem] = useState<LibraryItem | null>(null);
  const [licenseItem, setLicenseItem] = useState<LibraryItem | null>(null);
  const [versionItem, setVersionItem] = useState<LibraryItem | null>(null);
  const [refundItem, setRefundItem] = useState<LibraryItem | null>(null);

  // Local playtime storage tracking
  const [playtimes, setPlaytimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('gamestation_playtimes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPlayerLibraryAPI();
      if (res.success) {
        setItems(res.data);
        // Sync database playtime into local state
        const dbPlaytimes: Record<string, number> = {};
        res.data.forEach((item) => {
          if (item.playTime !== undefined) {
            dbPlaytimes[item.game.id] = item.playTime;
          }
        });
        setPlaytimes((prev) => ({ ...prev, ...dbPlaytimes }));
        setLogs(prev => [...prev, `> [OK] Discovered ${res.data.length} registered digital licenses.`]);
      } else {
        setError('Failed to fetch player library.');
      }
    } catch (err: any) {
      console.error('Fetch library failed:', err);
      setError(err.response?.data?.message || 'Error connecting to license server.');
      setLogs(prev => [...prev, '> [ERR_NETWORK] Connection handshake timed out.']);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleUpdatePlaytime = async (gameId: string, additionalSeconds: number) => {
    setPlaytimes(prev => {
      const current = prev[gameId] || 0;
      const updated = { ...prev, [gameId]: current + additionalSeconds };
      localStorage.setItem('gamestation_playtimes', JSON.stringify(updated));
      return updated;
    });

    try {
      await recordPlaytimeAPI(gameId, additionalSeconds);
    } catch (err) {
      console.error('Playtime telemetry sync failed:', err);
    }
  };

  // Available unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.game.genre) set.add(i.game.genre);
    });
    return ['ALL', ...Array.from(set)];
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesQuery = 
          item.game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.game.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.game.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGenre = selectedGenre === 'ALL' || item.game.genre === selectedGenre;
        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.game.title.localeCompare(b.game.title);
        }
        if (sortBy === 'playtime') {
          const ptA = playtimes[a.game.id] || 0;
          const ptB = playtimes[b.game.id] || 0;
          return ptB - ptA;
        }
        // default recent
        return new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime();
      });
  }, [items, searchQuery, selectedGenre, sortBy, playtimes]);

  // Aggregated library telemetry
  const totalStorage = useMemo(() => {
    return items.reduce((acc, curr) => {
      const storageStr = curr.game.requirements?.minStorage || '15';
      const num = parseFloat(storageStr.replace(/[^0-9.]/g, '')) || 15;
      return acc + num;
    }, 0);
  }, [items]);

  const totalPlayedHours = useMemo(() => {
    const totalSecs = Object.values(playtimes).reduce((a, b) => a + b, 0);
    return (totalSecs / 3600).toFixed(1);
  }, [playtimes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] font-mono text-emerald-500">
        <Terminal className="h-12 w-12 mb-4 animate-pulse text-purple-400" />
        <div className="w-full max-w-lg bg-[#0D1117] p-5 rounded-md border border-[#30363D] shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#21262D] text-xs text-[#8B949E]">
            <span>SYSTEM // LIBRARY_DAEMON</span>
            <span className="text-purple-400 animate-pulse">STATUS: INITIALIZING</span>
          </div>
          {logs.map((log, i) => (
            <p key={i} className="text-xs mb-1.5 text-emerald-400/90">{log}</p>
          ))}
          <p className="text-xs mt-2 animate-pulse text-purple-400">_</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono pb-16">
      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-300 px-4 py-3 rounded-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchLibrary} className="underline text-red-400 hover:text-white">
            Retry Handshake
          </button>
        </div>
      )}
      
      {/* Top Banner / Hero HUD */}
      <div className="relative bg-gradient-to-r from-purple-950/30 via-[#0D1117] to-emerald-950/20 border border-[#30363D] rounded-lg p-6 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-400 tracking-widest uppercase mb-1.5">
              <Gamepad2 className="w-4 h-4" /> LOCAL_VAULT // DIGITAL_ENTITLEMENTS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              PLAYER GAME LIBRARY
              <span className="text-xs px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-bold">
                {items.length} TITLES
              </span>
            </h1>
            <p className="text-xs text-[#8B949E] mt-1 max-w-2xl leading-relaxed">
              Permanent digital licenses, client binary repositories, and hardware telemetry verified via GameStation Core.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-[#161B22]/80 border border-[#30363D] px-4 py-2.5 rounded-md min-w-[130px]">
              <span className="text-[10px] text-[#556772] uppercase flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-purple-400" /> Disk Footprint
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{totalStorage} GB Allocated</p>
            </div>

            <div className="bg-[#161B22]/80 border border-[#30363D] px-4 py-2.5 rounded-md min-w-[130px]">
              <span className="text-[10px] text-[#556772] uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> Playtime Logged
              </span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{totalPlayedHours} hrs</p>
            </div>

            <div className="bg-[#161B22]/80 border border-[#30363D] px-4 py-2.5 rounded-md min-w-[130px]">
              <span className="text-[10px] text-[#556772] uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Keystore Health
              </span>
              <p className="text-sm font-bold text-cyan-300 mt-0.5">100% SECURE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0D1117] border border-[#30363D] p-3 rounded-lg text-xs">
        
        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#556772]" />
          <input
            type="text"
            placeholder="grep -i library --target=game_title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] focus:border-purple-500 rounded pl-9 pr-3 py-2 text-white placeholder-[#556772] outline-none transition-colors"
          />
        </div>

        {/* Filter Pills & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Genre select */}
          <div className="flex items-center gap-1.5 bg-[#161B22] border border-[#30363D] px-2 py-1 rounded">
            <Filter className="w-3.5 h-3.5 text-[#556772]" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer text-xs"
            >
              {genres.map(g => (
                <option key={g} value={g} className="bg-[#161B22] text-white">
                  {g === 'ALL' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[#161B22] border border-[#30363D] px-2 py-1 rounded">
            <span className="text-[#556772]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white outline-none cursor-pointer text-xs font-bold"
            >
              <option value="recent" className="bg-[#161B22] text-white">Recently Acquired</option>
              <option value="title" className="bg-[#161B22] text-white">Title (A-Z)</option>
              <option value="playtime" className="bg-[#161B22] text-white">Playtime Tracked</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#161B22] border border-[#30363D] rounded p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-purple-600/30 text-purple-300' : 'text-[#8B949E] hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-purple-600/30 text-purple-300' : 'text-[#8B949E] hover:text-white'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={fetchLibrary}
            className="p-2 bg-[#161B22] border border-[#30363D] hover:border-purple-500/50 text-[#8B949E] hover:text-purple-300 rounded transition-colors"
            title="Reload Library"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-12 text-center max-w-lg mx-auto">
          <Terminal className="w-12 h-12 text-[#556772] mx-auto mb-4 animate-pulse" />
          <h2 className="text-lg font-bold text-white mb-2">
            {items.length === 0 ? 'NO LICENSES FOUND IN VAULT' : 'NO MATCHING TITLES FOUND'}
          </h2>
          <p className="text-xs text-[#8B949E] mb-6 leading-relaxed">
            {items.length === 0 
              ? 'Your GameStation library is currently empty. Browse the catalog, claim free releases, or complete Stripe checkout to populate your vault.'
              : `Zero entities returned for query "${searchQuery}" in genre "${selectedGenre}".`}
          </p>
          <button
            onClick={() => navigate('/store')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all"
          >
            Explore GameStation Store <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const latestVersion = item.game.versions && item.game.versions.length > 0 ? item.game.versions[0] : null;
            const playedSecs = playtimes[item.game.id] || 0;
            const hoursDisplay = (playedSecs / 3600).toFixed(1);

            return (
              <div
                key={item.libraryId}
                className="bg-[#0D1117] border border-[#30363D] hover:border-purple-500/50 rounded-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
              >
                {/* Cover Art Box with quick launch hover */}
                <div className="relative aspect-[16/9] bg-[#05070A] overflow-hidden">
                  {item.game.media?.bannerImageUrl || item.game.media?.coverImageUrl ? (
                    <img
                      src={item.game.media.bannerImageUrl || item.game.media.coverImageUrl}
                      alt={item.game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#161B22]">
                      <Gamepad2 className="w-12 h-12 text-[#556772]" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md text-purple-400 border border-purple-500/40 rounded text-[10px] font-bold uppercase tracking-wider">
                      {item.ownedPricing ? item.ownedPricing.editionName : 'Standard Edition'}
                    </span>
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold">
                      {latestVersion ? latestVersion.version : 'v1.0.0'}
                    </span>
                  </div>

                  {/* Hover Overlay with Launch Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity flex items-center justify-center gap-3 p-4">
                    <button
                      onClick={() => setLaunchingItem(item)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-white" /> LAUNCH GAME
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#556772] mb-1">
                      <span>{item.game.genre}</span>
                      <span className="flex items-center gap-1 text-[#8B949E]">
                        <Clock className="w-3 h-3 text-emerald-400" /> {hoursDisplay} hrs
                      </span>
                    </div>

                    <h3 
                      onClick={() => navigate(`/store/games/${item.game.id}`)}
                      className="text-base font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 cursor-pointer"
                      title={item.game.title}
                    >
                      {item.game.title}
                    </h3>

                    <p className="text-xs text-[#8B949E] line-clamp-2 mt-1 leading-relaxed">
                      {item.game.description}
                    </p>
                  </div>

                  {/* Actions & Utilities */}
                  <div className="pt-3 border-t border-[#21262D] flex items-center justify-between gap-2 text-xs">
                    
                    {/* Launch trigger button */}
                    <button
                      onClick={() => setLaunchingItem(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#161B22] hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 rounded font-bold transition-all text-[11px]"
                    >
                      <Play className="w-3 h-3 fill-current" /> Play
                    </button>

                    {/* Versions / Downloads */}
                    <button
                      onClick={() => setVersionItem(item)}
                      className="p-1.5 bg-[#161B22] hover:bg-purple-600/20 text-[#8B949E] hover:text-purple-300 border border-[#30363D] hover:border-purple-500/40 rounded transition-colors"
                      title="Version Packages & Changelogs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Digital License / Receipt */}
                    <button
                      onClick={() => setLicenseItem(item)}
                      className="p-1.5 bg-[#161B22] hover:bg-cyan-600/20 text-[#8B949E] hover:text-cyan-300 border border-[#30363D] hover:border-cyan-500/40 rounded transition-colors"
                      title="Cryptographic License Key & Stripe Receipt"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>

                    {/* Refund Dispute Button */}
                    <button
                      onClick={() => setRefundItem(item)}
                      className="p-1.5 bg-[#161B22] hover:bg-red-600/20 text-[#8B949E] hover:text-red-400 border border-[#30363D] hover:border-red-500/40 rounded transition-colors"
                      title="Request 14-day / 2-hr Refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Store Page */}
                    <button
                      onClick={() => navigate(`/store/games/${item.game.id}`)}
                      className="p-1.5 bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-white border border-[#30363D] rounded transition-colors"
                      title="View Game Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#161B22] text-[#556772] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Title & Edition</th>
                <th className="py-3 px-4 hidden md:table-cell">Genre</th>
                <th className="py-3 px-4 hidden lg:table-cell">Version</th>
                <th className="py-3 px-4">Playtime</th>
                <th className="py-3 px-4 hidden sm:table-cell">Acquired</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {filteredItems.map(item => {
                const latestVersion = item.game.versions && item.game.versions.length > 0 ? item.game.versions[0] : null;
                const playedSecs = playtimes[item.game.id] || 0;
                const hoursDisplay = (playedSecs / 3600).toFixed(1);

                return (
                  <tr key={item.libraryId} className="hover:bg-[#161B22]/50 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#05070A] overflow-hidden border border-[#30363D] flex-shrink-0">
                          {item.game.media?.coverImageUrl ? (
                            <img src={item.game.media.coverImageUrl} alt={item.game.title} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-6 h-6 m-auto text-[#556772]" />
                          )}
                        </div>
                        <div>
                          <div 
                            onClick={() => navigate(`/store/games/${item.game.id}`)}
                            className="font-bold text-white group-hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            {item.game.title}
                          </div>
                          <div className="text-[10px] text-purple-400">
                            {item.ownedPricing ? item.ownedPricing.editionName : 'Standard Edition'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-[#8B949E]">
                      {item.game.genre}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-[#161B22] text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold">
                        {latestVersion ? latestVersion.version : 'v1.0.0'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {hoursDisplay} hrs
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell text-[#8B949E]">
                      {new Date(item.acquiredAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setLaunchingItem(item)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded font-bold transition-all flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-current" /> Launch
                        </button>
                        <button
                          onClick={() => setLicenseItem(item)}
                          className="p-1 bg-[#161B22] hover:bg-cyan-600/20 text-[#8B949E] hover:text-cyan-300 border border-[#30363D] rounded transition-colors"
                          title="View Digital License"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRefundItem(item)}
                          className="p-1 bg-[#161B22] hover:bg-red-600/20 text-[#8B949E] hover:text-red-400 border border-[#30363D] rounded transition-colors"
                          title="Request Refund"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setVersionItem(item)}
                          className="p-1 bg-[#161B22] hover:bg-purple-600/20 text-[#8B949E] hover:text-purple-300 border border-[#30363D] rounded transition-colors"
                          title="Version Builds"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Modals */}
      <GameLauncherModal
        item={launchingItem}
        onClose={() => setLaunchingItem(null)}
        onUpdatePlaytime={handleUpdatePlaytime}
      />

      <DigitalLicenseModal
        item={licenseItem}
        onClose={() => setLicenseItem(null)}
        onRequestRefund={(item) => setRefundItem(item)}
      />

      <VersionHistoryModal
        item={versionItem}
        onClose={() => setVersionItem(null)}
      />

      <RefundRequestModal
        gameId={refundItem?.game.id || null}
        gameTitle={refundItem?.game.title}
        isOpen={!!refundItem}
        onClose={() => setRefundItem(null)}
        onRefundSuccess={() => {
          if (refundItem) {
            setItems(prev => prev.filter(i => i.libraryId !== refundItem.libraryId));
          }
        }}
      />

    </div>
  );
}
