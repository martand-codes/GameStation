import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getWalletAPI, type WalletTransaction } from '../Services/Wallet.service';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  loading: boolean;
  refreshWallet: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWallet = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await getWalletAPI();
      if (res.success && res.data) {
        setBalance(res.data.balance);
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallet();
    } else {
      setBalance(0);
      setTransactions([]);
    }
  }, [isAuthenticated]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        refreshWallet,
        updateBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
