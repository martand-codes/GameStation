import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  gameId: string;
  title: string;
  editionName: string;
  price: number;
  coverImageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (gameId: string, editionName: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      // Prevent duplicates and only allow ONE edition per game
      // If a different edition of the same game is in the cart, replace it
      const filtered = prev.filter(i => i.gameId !== item.gameId);
      return [...filtered, item];
    });
  };

  const removeFromCart = (gameId: string, editionName: string) => {
    setItems((prev) => prev.filter(i => !(i.gameId === gameId && i.editionName === editionName)));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
