import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, EyeOff, CheckCircle, ShieldAlert, Layers } from 'lucide-react';
import { getAllPlatformGamesAPI, moderateGameStatusAPI } from '../../../Services/Governance.service';

export default function GameModerationDeck() {
  const [games, setGames] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async (query?: string) => {
    try {
      setLoading(true);
      const data = await getAllPlatformGamesAPI(query);
      setGames(data);
    } catch (err) {
      console.error('Failed to load games catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames(search);
  };

  const handleModerate = async (gameId: string, title: string, status: 'PUBLISHED' | 'HIDDEN' | 'REJECTED') => {
    const reason = prompt(`MODERATION ACTION for "${title}":\nTransition status to [${status}]. Enter administrative note:`);
    if (reason === null) return; // user cancelled

    try {
      await moderateGameStatusAPI(gameId, { status, reason: reason.trim() || undefined });
      await fetchGames(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to moderate game');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: '#0d0d12',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 36px -4px rgba(0, 0, 0, 0.65)',
      }}
    >
      {/* Header & Search */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Root Game Catalog & DMCA Takedown Console
            </h2>
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-800/80 px-2.5 py-0.5 rounded-full uppercase">
              {games.length} Titles
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Sovereign catalog moderation, copyright delisting, and platform-wide distribution overrides
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, genre, developer..."
              className="bg-[#14141c] border border-white/[0.08] focus:border-[#FF1E27] rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none font-mono w-60 sm:w-72"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold uppercase text-white transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#121218] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.06]">
            <tr>
              <th className="py-4 px-6">Game Title</th>
              <th className="py-4 px-6">Developer</th>
              <th className="py-4 px-6">Marketplace Status</th>
              <th className="py-4 px-6">Sales Volume</th>
              <th className="py-4 px-6 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {games.map((game) => {
              const statusColor =
                game.status === 'PUBLISHED'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : game.status === 'PENDING'
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                  : game.status === 'HIDDEN'
                  ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60'
                  : 'bg-red-950/40 text-red-400 border-red-500/30';

              return (
                <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#14141c] border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                        {game.media?.coverImageUrl ? (
                          <img
                            src={game.media.coverImageUrl}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{game.title}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">{game.genre}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-zinc-300">
                    @{game.developer.username}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border uppercase ${statusColor}`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-zinc-400">
                    {game._count?.payments || 0} purchases
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {game.status === 'PUBLISHED' ? (
                      <button
                        onClick={() => handleModerate(game.id, game.title, 'HIDDEN')}
                        className="py-1 px-3 rounded-lg text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
                      >
                        Force Delist (Hide)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(game.id, game.title, 'PUBLISHED')}
                        className="py-1 px-3 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        Publish Title
                      </button>
                    )}

                    <button
                      onClick={() => handleModerate(game.id, game.title, 'REJECTED')}
                      className="py-1 px-3 rounded-lg text-[10px] font-mono font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                    >
                      Reject (DMCA)
                    </button>
                  </td>
                </tr>
              );
            })}
            {games.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-zinc-500 font-mono">
                  {loading ? 'Searching catalog...' : 'No titles found matching query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

