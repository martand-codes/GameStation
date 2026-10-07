import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GameCard from '../../Components/GameCard';
import { Terminal, Database } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  pricing: { price: number; isFree: boolean };
  media: { coverImageUrl: string; bannerImageUrl: string };
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(['> Initializing GameStation runtime...', '> Establishing secure connection to DB...']);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLogs(prev => [...prev, '> Executing SELECT * FROM games WHERE status="PUBLISHED"']);
        const response = await axios.get('http://localhost:5000/api/store/games', {
          withCredentials: true
        });
        if (response.data.success) {
          setGames(response.data.data);
          setLogs(prev => [...prev, `> Query OK, ${response.data.data.length} rows in set (0.04 sec)`]);
        }
      } catch (error) {
        console.error("Failed to fetch games", error);
        setLogs(prev => [...prev, '> ERROR 1064 (42000): Failed to connect to game server.']);
      } finally {
        setTimeout(() => setLoading(false), 800); // Artificial delay for hacker effect
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 font-mono text-emerald-500">
        <Terminal className="h-12 w-12 mb-4 animate-pulse" />
        <div className="w-full max-w-md bg-[#0D1117] p-4 rounded-md border border-[#30363D]">
          {logs.map((log, i) => (
            <p key={i} className="text-sm mb-1">{log}</p>
          ))}
          <p className="text-sm mt-2 animate-pulse">_</p>
        </div>
      </div>
    );
  }

  const featuredGames = games.slice(0, 2);
  const trendingGames = games.slice(2);

  return (
    <div className="space-y-12 font-mono">
      
      {/* AD / Announcement Banner */}
      <section>
        <div className="relative bg-[#0D1117] border border-[#30363D] overflow-hidden rounded-md group">
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-30" />
          
          <div className="absolute top-0 right-0 p-2 z-20">
             <span className="text-[10px] text-[#484F58] font-bold border border-[#30363D] px-1.5 py-0.5 uppercase tracking-widest">Sponsored System Broadcast</span>
          </div>

          <div className="px-8 py-10 md:py-16 flex flex-col items-center justify-center text-center relative z-20">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              [GAMESTATION.CORE_UNDER_CONSTRUCTION]
            </h1>
            <div className="text-[#8B949E] max-w-2xl text-xs md:text-sm border-l-2 border-emerald-500/50 pl-4 py-1 text-left font-mono">
              <span className="text-emerald-500 font-bold">root@gamestation:~#</span> 
              {" "}tail -f /var/log/development.log<br />
              <span className="animate-pulse">_</span> GameStation is currently under heavy development. The matrix is being rebuilt. Expect layout shifts, new game nodes, and experimental terminal features. Proceed with caution.
            </div>
            <button className="mt-8 border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-6 py-2.5 text-xs font-bold hover:bg-emerald-500/20 hover:border-emerald-500/80 transition-all uppercase tracking-widest flex items-center gap-2 group shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <Terminal className="h-4 w-4 group-hover:animate-pulse" /> Acknowledge Status
            </button>
          </div>
          
          {/* Decorative background grid/gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent z-0" />
        </div>
      </section>

      {/* Featured / Hero Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold tracking-widest text-[#E6EDF3] uppercase">~ ./bin/featured_targets</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredGames.map(game => (
            <div key={game.id} className="relative bg-[#0D1117] rounded-sm overflow-hidden group cursor-pointer aspect-video border border-[#30363D] hover:border-emerald-500/50 transition-colors">
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-50" />
              
              <img src={game.media?.bannerImageUrl} alt={game.title} className="w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:mix-blend-normal group-hover:opacity-60 transition-all duration-700 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-0" />
              
              <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black bg-emerald-500">
                    {game.genre}
                  </span>
                  <span className="text-[10px] text-[#8B949E]">STATUS: ONLINE</span>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
                  <span className="text-emerald-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                  {game.title}
                </h3>
                
                <p className="text-[#8B949E] text-xs md:text-sm max-w-xl line-clamp-2 border-l-2 border-emerald-500/30 pl-3">
                  {game.description}
                </p>
                
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm font-bold text-emerald-400 bg-[#0D1117] border border-[#30363D] px-3 py-1.5 rounded-sm shadow-md">
                    {game.pricing?.isFree ? 'FREE' : `₹${Number(game.pricing?.price).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-[#30363D] pb-2 mt-8">
          <Database className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold tracking-widest text-[#E6EDF3] uppercase">~ ./data/trending_nodes</h2>
        </div>
        
        {trendingGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {trendingGames.map(game => (
              <GameCard 
                key={game.id} 
                game={{
                  id: game.id,
                  title: game.title,
                  genre: game.genre,
                  price: game.pricing?.price || 0,
                  isFree: game.pricing?.isFree || false,
                  coverImageUrl: game.media?.coverImageUrl || ''
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0D1117] border border-[#30363D] border-dashed">
            <Terminal className="h-8 w-8 text-[#484F58] mx-auto mb-3" />
            <p className="text-[#8B949E] text-sm">No active nodes found in this sector.</p>
          </div>
        )}
      </section>

    </div>
  );
}
