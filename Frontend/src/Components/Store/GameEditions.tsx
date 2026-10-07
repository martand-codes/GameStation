import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, ShoppingCart, Heart } from 'lucide-react';
import AiEditionRecommender from './AiEditionRecommender';
import { useCart } from '../../Context/CartContext';
import { useWishlist } from '../../Context/WishlistContext';

interface Edition {
  editionName: string;
  price: number;
  isFree: boolean;
  features: string[];
}

export default function GameEditions({ editions, title, gameId, coverImage }: { editions: Edition[], title: string, gameId: string, coverImage?: string }) {
  const [isComparing, setIsComparing] = useState(false);
  const { addToCart, items, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!editions || editions.length === 0) return null;

  // Extract all unique features across all editions for the comparison table
  const allFeatures = Array.from(new Set(editions.flatMap(e => e.features)));

  return (
    <div className="flex flex-col gap-4 mt-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Recommender */}
      <AiEditionRecommender 
        editions={editions} 
        onAddToCart={(edition) => {
          addToCart({
            gameId,
            title,
            editionName: edition.editionName,
            price: Number(edition.price),
            coverImageUrl: coverImage
          });
        }} 
      />

      {/* List out each edition individually */}
      <div className="space-y-4">
        {editions.map((edition, idx) => (
          <div key={idx} className="bg-gradient-to-r from-[#16202D] to-[#1A2634] rounded-sm p-6 flex flex-col md:flex-row justify-between items-center relative overflow-hidden border border-[#30363D] shadow-lg">
            <div className="z-10 mb-4 md:mb-0">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Buy {title} - {edition.editionName}
              </h2>
            </div>
            <div className="z-10 bg-black/60 p-1.5 rounded-sm flex items-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <span className="px-4 text-emerald-400 font-bold text-lg">
                {edition.isFree ? 'Free to Play' : `₹${Number(edition.price).toFixed(2)}`}
              </span>
              <button 
                onClick={() => {
                  if (items.some(i => i.gameId === gameId && i.editionName === edition.editionName)) {
                    removeFromCart(gameId, edition.editionName);
                  } else {
                    addToCart({
                      gameId,
                      title,
                      editionName: edition.editionName,
                      price: Number(edition.price),
                      coverImageUrl: coverImage
                    });
                  }
                }}
                className={`px-6 py-2 text-white text-sm font-bold rounded-sm ml-2 transition-all shadow-[0_0_10px_rgba(117,176,34,0.3)] flex items-center gap-2
                  ${items.some(i => i.gameId === gameId && i.editionName === edition.editionName) 
                    ? 'bg-red-500/80 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'bg-gradient-to-r from-[#75b022] to-[#588a1b] hover:from-[#8ed629] hover:to-[#6aa621] hover:shadow-[0_0_15px_rgba(142,214,41,0.5)]'
                  }`}
              >
                {items.some(i => i.gameId === gameId && i.editionName === edition.editionName) ? (
                  <>Remove <X className="w-4 h-4" /></>
                ) : (
                  <>{edition.isFree ? 'Play Game' : 'Add to Cart'}</>
                )}
              </button>
              <button 
                onClick={() => {
                  toggleWishlist({ gameId, editionName: edition.editionName, title, coverImageUrl: coverImage });
                }}
                className={`ml-2 px-3 py-2 border border-[#30363D] hover:bg-[#3d6582] text-sm font-bold rounded-sm transition-colors
                  ${isInWishlist(gameId, edition.editionName) ? 'bg-[#3d6582] text-pink-400' : 'bg-[#2A475E] text-[#8B949E] hover:text-pink-400'}
                `}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(gameId, edition.editionName) ? 'fill-pink-400' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compare Editions Dropdown */}
      {editions.length > 1 && (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-md overflow-hidden shadow-lg mt-2">
          <button 
            onClick={() => setIsComparing(!isComparing)}
            className="w-full flex items-center justify-center gap-2 p-4 text-[#8B949E] hover:text-white transition-colors bg-[#161b22] hover:bg-[#1f2428]"
          >
            <span className="font-bold tracking-widest uppercase text-sm">Compare Editions</span>
            {isComparing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {isComparing && (
            <div className="p-4 overflow-x-auto bg-[#0D1117]">
              <table className="w-full text-left text-sm text-[#C9D1D9]">
                <thead>
                  <tr className="border-b border-[#30363D]">
                    <th className="p-4 font-bold text-white w-1/3 uppercase tracking-wider text-xs">Features</th>
                    {editions.map((edition, idx) => (
                      <th key={idx} className="p-4 font-bold text-center text-emerald-400 uppercase tracking-wider text-xs">
                        {edition.editionName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, featureIdx) => (
                    <tr key={featureIdx} className="border-b border-[#30363D]/50 hover:bg-[#161b22] transition-colors">
                      <td className="p-4 font-medium text-[#8B949E]">{feature}</td>
                      {editions.map((edition, edIdx) => (
                        <td key={edIdx} className="p-4 text-center">
                          {edition.features.includes(feature) ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
