import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  title: string;
  genre: string;
  price: number;
  isFree: boolean;
  coverImageUrl: string;
}

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/store/games/${game.id}`)}
      className="group relative bg-[#0D1117] border border-[#30363D] hover:border-emerald-500/50 rounded-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] font-mono flex flex-col h-full"
    >
      {/* Code-like header */}
      <div className="px-3 py-1.5 border-b border-[#30363D] bg-[#050505] flex justify-between items-center text-[10px]">
        <span className="text-[#8B949E]">id: {game.id.substring(0, 8)}...</span>
        <span className="text-blue-400 font-bold uppercase">{game.genre}</span>
      </div>

      {/* Cover Image with scanline effect */}
      <div className="aspect-[3/4] w-full relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-50" />
        <img 
          src={game.coverImageUrl} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
        />
        {/* Terminal overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/40 to-transparent z-0" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow relative z-20 -mt-8">
        <h3 className="text-base font-bold text-[#E6EDF3] group-hover:text-emerald-400 transition-colors line-clamp-1">
          <span className="text-emerald-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
          {game.title}
        </h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#30363D] border-dashed">
          <span className="text-sm font-bold text-emerald-400">
            {game.isFree ? '0x00.00' : `0x${Number(game.price).toString(16).toUpperCase()}`} <span className="text-[#8B949E] text-xs">({game.isFree ? 'FREE' : `₹${game.price}`})</span>
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            <span className="text-xs font-bold text-black bg-emerald-500 px-2 py-1 rounded-sm">
              EXECUTE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
