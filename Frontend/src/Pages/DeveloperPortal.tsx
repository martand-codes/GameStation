import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getGamesAPI, createGameAPI } from '../Services/Game.service';
import { useNavigate } from 'react-router-dom';
import { Plus, Gamepad2, Settings, Send } from 'lucide-react';

export default function DeveloperPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await getGamesAPI();
      setGames(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      const title = prompt("Enter Game Title:");
      if (!title) return;
      const genre = prompt("Enter Game Genre (e.g. RPG, Action):");
      if (!genre) return;
      const data = await createGameAPI({ title, genre, description: "New game description" });
      navigate(`/developer/games/${data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create game");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'text-neutral-400 bg-neutral-900 border-neutral-700';
      case 'PENDING': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50';
      case 'PUBLISHED': return 'text-emerald-400 bg-emerald-900/30 border-emerald-700/50';
      case 'REJECTED': return 'text-red-400 bg-red-900/30 border-red-700/50';
      default: return 'text-neutral-400 bg-neutral-900 border-neutral-700';
    }
  }

  if (user?.role !== 'DEVELOPER' && user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
    return <div className="p-8 text-red-500">Access Denied. Developer privileges required.</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Code2 className="text-emerald-500 w-8 h-8" />
            Game Studio
          </h1>
          <p className="text-neutral-400">Manage your titles, deployments, and media.</p>
        </div>
        <button 
          onClick={handleCreateGame}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-5 h-5" />
          New Draft
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded mb-6">{error}</div>}

      {loading ? (
        <div className="text-center p-12 text-neutral-500 font-mono tracking-widest animate-pulse">LOADING_DATA...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.length === 0 ? (
            <div className="col-span-full text-center p-12 border border-neutral-800 border-dashed rounded-xl text-neutral-500">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No titles found. Initialize a new draft to begin.</p>
            </div>
          ) : (
            games.map(game => (
              <div key={game.id} className="border border-neutral-800 bg-neutral-900/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col">
                <div className="h-32 bg-neutral-950 flex items-center justify-center border-b border-neutral-800 relative shrink-0">
                  {game.media?.bannerUrl ? (
                    <img src={game.media.bannerUrl} alt="banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Gamepad2 className="w-10 h-10 text-neutral-700" />
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded border ${getStatusColor(game.status)}`}>
                    {game.status}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-1 truncate" title={game.title}>{game.title}</h3>
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2 flex-1">{game.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-800/50 mt-auto">
                    <span className="text-xs text-neutral-600 font-mono">
                      ID: {game.id.substring(0, 8)}...
                    </span>
                    <button 
                      onClick={() => navigate(`/developer/games/${game.id}`)}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" /> Config
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

function Code2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
}
