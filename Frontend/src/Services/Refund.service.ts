import { api } from '../Api/Axios';

export interface RefundEligibility {
  gameId: string;
  gameTitle: string;
  paymentId: string;
  refundableAmount: number;
  provider: 'stripe' | 'wallet' | string;
  purchasedAt: string;
  daysSincePurchase: number;
  daysRemaining: number;
  playTimeSeconds: number;
  playTimeMinutes: number;
  maxPlayTimeMinutes: number;
  playTimePass: boolean;
  purchaseDatePass: boolean;
  isEligible: boolean;
}

export const getRefundEligibilityAPI = async (
  gameId: string
): Promise<{ success: boolean; data: RefundEligibility }> => {
  const response = await api.get(`/payments/refund-eligibility/${gameId}`);
  return response.data;
};

export const requestRefundAPI = async (
  gameId: string,
  refundTarget: 'WALLET' | 'ORIGINAL_PAYMENT',
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  refundMethod: 'WALLET' | 'STRIPE';
  refundedAmount: number;
  newBalance?: number;
}> => {
  const response = await api.post(`/payments/refund/${gameId}`, {
    refundTarget,
    reason,
  });
  return response.data;
};
