import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameCard from '../../Components/GameCard';
import { StorefrontHeroBanner } from '../../Components/Store/StorefrontHeroBanner';
import { Terminal, Database, ArrowRight } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  pricing: Array<{ price: number; isFree: boolean; editionName?: string }> | { price: number; isFree: boolean };
  media: { coverImageUrl: string; bannerImageUrl: string };
}

export default function Home() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(['> Initializing GameStation runtime...', '> Establishing secure connection to DB...']);

  const getGamePricing = (game: Game) => {
    if (Array.isArray(game.pricing) && game.pricing.length > 0) {
      return {
        price: Number(game.pricing[0].price) || 0,
        isFree: Boolean(game.pricing[0].isFree)
      };
    }
    if (game.pricing && typeof game.pricing === 'object') {
      return {
        price: Number((game.pricing as any).price) || 0,
        isFree: Boolean((game.pricing as any).isFree)
      };
    }
    return { price: 0, isFree: false };
  };

  const getGameImage = (game: Game, preferred: 'banner' | 'cover') => {
    if (preferred === 'banner') {
      return game.media?.bannerImageUrl || game.media?.coverImageUrl || '';
    }
    return game.media?.coverImageUrl || game.media?.bannerImageUrl || '';
  };

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
      
      {/* Storefront Hero Spotlight / Dynamic Campaign Banner */}
      <StorefrontHeroBanner />

      {/* Featured / Hero Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold tracking-widest text-[#E6EDF3] uppercase">~ ./bin/featured_targets</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredGames.map(game => {
            const pricing = getGamePricing(game);
            const bannerUrl = getGameImage(game, 'banner');
            return (
              <div 
                key={game.id} 
                onClick={() => navigate(`/store/games/${game.id}`)}
                className="relative bg-[#0D1117] rounded-sm overflow-hidden group cursor-pointer aspect-video border border-[#30363D] hover:border-emerald-500/80 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
              >
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-50" />
                
                <img 
                  src={bannerUrl} 
                  alt={game.title} 
                  className="w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:mix-blend-normal group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-0" />
                
                <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black bg-emerald-500">
                      {game.genre}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-xs">
                      STATUS: ONLINE
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>
                      <span className="text-emerald-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                      {game.title}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                      VIEW TERMINAL <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </h3>
                  
                  <p className="text-[#8B949E] text-xs md:text-sm max-w-xl line-clamp-2 border-l-2 border-emerald-500/30 pl-3">
                    {game.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm font-bold text-emerald-400 bg-[#0D1117] border border-[#30363D] group-hover:border-emerald-500/50 px-3 py-1.5 rounded-sm shadow-md transition-colors">
                      {pricing.isFree ? 'FREE' : `₹${pricing.price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-xs text-[#8B949E] group-hover:text-emerald-300 transition-colors">
                      Click to inspect binaries, editions & system specs
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
            {trendingGames.map(game => {
              const pricing = getGamePricing(game);
              return (
                <GameCard 
                  key={game.id} 
                  game={{
                    id: game.id,
                    title: game.title,
                    genre: game.genre,
                    price: pricing.price,
                    isFree: pricing.isFree,
                    coverImageUrl: getGameImage(game, 'cover')
                  }} 
                />
              );
            })}
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
