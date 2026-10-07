import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WishlistItem {
  gameId: string;
  editionName: string;
  title: string;
  coverImageUrl?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (gameId: string, editionName: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some(i => i.gameId === item.gameId && i.editionName === item.editionName);
      if (exists) {
        return prev.filter(i => !(i.gameId === item.gameId && i.editionName === item.editionName));
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (gameId: string, editionName: string) => {
    return items.some(i => i.gameId === gameId && i.editionName === editionName);
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
