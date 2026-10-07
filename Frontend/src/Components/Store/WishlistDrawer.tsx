import React from 'react';
import { X, Trash2, Heart } from 'lucide-react';
import { useWishlist } from '../../Context/WishlistContext';
import { useNavigate } from 'react-router-dom';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { items, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0D1117] border-l border-[#30363D] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363D] bg-[#161b22]">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-pink-400">~/</span> Wishlist
          </h2>
          <button onClick={onClose} className="text-[#8B949E] hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#8B949E]">
              <Heart className="h-12 w-12 text-[#30363D] mb-4" />
              <p className="mb-2">Your wishlist is empty.</p>
              <p className="text-xs">Save games here to keep an eye on them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={`${item.gameId}-${idx}`} className="bg-[#161b22] border border-[#30363D] rounded-md p-3 flex gap-3">
                  {item.coverImageUrl ? (
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title} 
                      className="w-20 h-28 object-cover rounded-sm border border-[#30363D] cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => {
                        navigate(`/store/games/${item.gameId}`);
                        onClose();
                      }}
                    />
                  ) : (
                    <div 
                      className="w-20 h-28 bg-black border border-[#30363D] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#1A2634] transition-colors"
                      onClick={() => {
                        navigate(`/store/games/${item.gameId}`);
                        onClose();
                      }}
                    >
                      <span className="text-xs text-[#8B949E]">No IMG</span>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 
                        className="text-sm font-bold text-white leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => {
                          navigate(`/store/games/${item.gameId}`);
                          onClose();
                        }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#8B949E] mt-1">{item.editionName}</p>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className="text-[#8B949E] hover:text-pink-400 transition-colors flex items-center gap-1 text-xs uppercase tracking-wider"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
