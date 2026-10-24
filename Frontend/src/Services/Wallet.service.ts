import { api } from '../Api/Axios';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'TOP_UP' | 'GAME_PURCHASE' | 'REFUND' | 'BONUS';
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export const getWalletAPI = async (): Promise<{ success: boolean; data: WalletData }> => {
  const response = await api.get('/wallet');
  return response.data;
};

export const topUpWalletAPI = async (amount: number): Promise<{ success: boolean; checkoutUrl: string; sessionId: string }> => {
  const response = await api.post('/wallet/topup', { amount });
  return response.data;
};

export const checkoutWithWalletAPI = async (payload: {
  gameId?: string;
  pricingId?: string;
  items?: Array<{ gameId: string; editionName?: string; pricingId?: string }>;
}): Promise<{ success: boolean; message: string; newBalance: number }> => {
  const response = await api.post('/wallet/checkout', payload);
  return response.data;
};
