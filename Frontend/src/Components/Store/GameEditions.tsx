import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X, Heart, Zap, CheckCircle2, Play } from 'lucide-react';
import AiEditionRecommender from './AiEditionRecommender';
import { useCart } from '../../Context/CartContext';
import { useWishlist } from '../../Context/WishlistContext';
import { api } from '../../Api/Axios';

interface Edition {
  id?: string;
  editionName: string;
  price: number;
  isFree: boolean;
  features: string[];
}

export default function GameEditions({ editions, title, gameId, coverImage }: { editions: Edition[], title: string, gameId: string, coverImage?: string }) {
  const [isComparing, setIsComparing] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [ownedPrice, setOwnedPrice] = useState<number>(0);
  const [buyingEdition, setBuyingEdition] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const { addToCart, items, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Check game ownership on mount
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const res = await api.get(`/payments/ownership/${gameId}`);
        if (res.data.success && res.data.isOwned) {
          setIsOwned(true);
          setOwnedPrice(Number(res.data.ownedPrice) || 0);
        }
      } catch (err) {
        // Silently catch ownership check failure
      }
    };

    if (gameId) {
      checkOwnership();
    }

    // Reset button state if user returns via Chrome Back button (bfcache)
    const handlePageShow = (e: PageTransitionEvent) => {
      setBuyingEdition(null);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [gameId]);

  const handleBuyNow = async (edition: Edition) => {
    try {
      setBuyingEdition(edition.editionName);
      setBuyError(null);

      const res = await api.post(`/payments/checkout/${gameId}`, {
        pricingId: edition.id,
      });

      if (res.data.isFree) {
        setIsOwned(true);
        setBuyingEdition(null);
        return;
      }

      if (res.data.success && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setBuyError(res.data.message || 'Failed to start payment');
        setBuyingEdition(null);
      }
    } catch (err: any) {
      console.error('Instant buy error:', err);
      setBuyError(err.response?.data?.message || 'Error initializing checkout');
      setBuyingEdition(null);
    }
  };

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
              {(() => {
                const editionPrice = Number(edition.price);
                const isThisOrLowerOwned = isOwned && (editionPrice <= ownedPrice || edition.isFree);
                const isUpgrade = isOwned && editionPrice > ownedPrice;
                const upgradeDiff = Math.max(editionPrice - ownedPrice, 0);

                if (isThisOrLowerOwned) {
                  return (
                    <div className="flex items-center gap-3 px-3 py-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> IN LIBRARY
                      </span>
                      <button 
                        onClick={() => alert(`Launching ${title} (${edition.editionName})...`)}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-sm flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" /> Play
                      </button>
                    </div>
                  );
                }

                if (isUpgrade) {
                  return (
                    <div className="flex items-center gap-3 px-3 py-1">
                      <div className="flex flex-col text-right">
                        <span className="text-[11px] text-[#8B949E] line-through">₹{editionPrice.toFixed(2)}</span>
                        <span className="text-emerald-400 font-bold text-base">
                          ₹{upgradeDiff.toFixed(2)} <span className="text-[10px] text-blue-400 font-normal uppercase">(Upgrade)</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuyNow(edition)}
                        disabled={buyingEdition === edition.editionName}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        {buyingEdition === edition.editionName ? 'Redirecting...' : 'Upgrade Edition'}
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    <span className="px-4 text-emerald-400 font-bold text-lg">
                      {edition.isFree ? 'Free to Play' : `₹${Number(edition.price).toFixed(2)}`}
                    </span>

                    {/* Add to Cart / Remove */}
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
                      className={`px-4 py-2 text-white text-xs font-bold rounded-sm ml-2 transition-all flex items-center gap-1.5
                        ${items.some(i => i.gameId === gameId && i.editionName === edition.editionName) 
                          ? 'bg-red-500/80 hover:bg-red-500' 
                          : 'bg-[#2A475E] hover:bg-[#3d6582] text-[#C9D1D9] hover:text-white border border-[#30363D]'
                        }`}
                    >
                      {items.some(i => i.gameId === gameId && i.editionName === edition.editionName) ? (
                        <>Remove <X className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Add to Cart</>
                      )}
                    </button>

                    {/* Instant 1-Click Buy Now */}
                    <button
                      onClick={() => handleBuyNow(edition)}
                      disabled={buyingEdition === edition.editionName}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white text-xs font-bold rounded-sm ml-2 transition-all shadow-[0_0_10px_rgba(117,176,34,0.3)] hover:shadow-[0_0_15px_rgba(142,214,41,0.5)] flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      {buyingEdition === edition.editionName ? 'Connecting...' : edition.isFree ? 'Claim Free' : 'Buy Now'}
                    </button>

                    {/* Wishlist */}
                    <button 
                      onClick={() => {
                        toggleWishlist({ gameId, editionName: edition.editionName, title, coverImageUrl: coverImage });
                      }}
                      className={`ml-2 px-3 py-2 border border-[#30363D] hover:bg-[#3d6582] text-sm font-bold rounded-sm transition-colors
                        ${isInWishlist(gameId, edition.editionName) ? 'bg-[#3d6582] text-pink-400' : 'bg-[#2A475E] text-[#8B949E] hover:text-pink-400'}
                      `}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(gameId, edition.editionName) ? 'fill-pink-400' : ''}`} />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        ))}
        {buyError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-mono">
            {buyError}
          </div>
        )}
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
