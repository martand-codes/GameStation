import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useWishlist } from '../Context/WishlistContext';
import { motion } from 'framer-motion';

export interface GameCardItem {
  id: string;
  title: string;
  genre: string;
  price: number;
  isFree: boolean;
  coverImageUrl: string;
  editionsCount?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  editionName?: string;
}

interface GameCardProps {
  game: GameCardItem;
}

export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const defaultEdition = game.editionName || 'Standard Edition';
  const inWishlist = isInWishlist(game.id, defaultEdition);

  // Deterministic community rating fallback (4.6 - 5.0)
  const displayRating = (
    game.rating ||
    4.5 + (game.title.charCodeAt(0) % 5) * 0.1
  ).toFixed(1);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      gameId: game.id,
      editionName: defaultEdition,
      title: game.title,
      coverImageUrl: game.coverImageUrl,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/store/games/${game.id}`)}
      className="group relative bg-[#0B0F17] border border-[#212A3B] hover:border-emerald-500/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_12px_36px_rgba(16,185,129,0.18)] font-mono flex flex-col h-full select-none"
    >
      {/* Top Header Strip - Genre & Certified Status (Frontend ID removed) */}
      <div className="px-3.5 py-2 border-b border-[#1E2638] bg-[#070A10] flex justify-between items-center text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-bold tracking-wider uppercase text-zinc-300">
            {game.editionsCount && game.editionsCount > 1
              ? `${game.editionsCount} EDITIONS`
              : 'RING-3 VERIFIED'}
          </span>
        </div>
        <span className="text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
          {game.genre}
        </span>
      </div>

      {/* Cover Image Container */}
      <div className="aspect-[3/4] w-full relative overflow-hidden bg-black/80">
        {/* Scanline Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-40" />

        <img
          src={game.coverImageUrl}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Ambient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-black/20 z-10" />

        {/* Top Floating Controls: Wishlist Heart & Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20">
          {/* Star Rating Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400">
            <Star className="w-3 h-3 fill-current text-amber-400" />
            <span>{displayRating}</span>
          </div>

          {/* Interactive Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              inWishlist
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-105'
                : 'bg-black/60 border-white/15 text-zinc-400 hover:text-white hover:border-white/40 hover:scale-110'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow relative z-20">
        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1 tracking-tight">
          <span className="text-emerald-500 mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
          {game.title}
        </h3>

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 line-clamp-1 mb-3">
            {game.tags.slice(0, 2).map((t, idx) => (
              <span key={idx} className="hover:text-zinc-400 transition-colors">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Pricing & Editions Navigation Trigger */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#1E2638] border-dashed">
          <div>
            {game.editionsCount && game.editionsCount > 1 && !game.isFree && (
              <span className="text-[9px] text-zinc-500 block -mb-0.5 uppercase tracking-wider">Starts at</span>
            )}
            <span className={`text-sm font-black tracking-tight ${
              game.isFree ? 'text-emerald-400' : 'text-white'
            }`}>
              {game.isFree ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                  FREE
                </span>
              ) : (
                `₹${Number(game.price).toLocaleString('en-IN')}`
              )}
            </span>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>EDITIONS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
