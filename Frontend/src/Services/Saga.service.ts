import { api } from '../Api/Axios';

export interface SagaStepLogItem {
  id?: string;
  stepIndex: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED' | 'SKIPPED';
  input?: any;
  output?: any;
  error?: string;
  durationMs?: number;
  compensatedAt?: string;
}

export interface SagaInstanceItem {
  id: string;
  sagaType: string;
  idempotencyKey: string;
  userId?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'COMPENSATED' | 'FAILED';
  currentStep: number;
  totalSteps: number;
  payload?: any;
  error?: string;
  durationMs?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  steps: SagaStepLogItem[];
}

export const executePurchaseSagaAPI = async (payload: {
  gameId: string;
  pricingId?: string;
  idempotencyKey?: string;
  chaosFailStep?: string;
}): Promise<{
  success: boolean;
  message: string;
  saga: {
    id: string;
    status: string;
    durationMs: number;
    totalSteps: number;
    gameTitle?: string;
    cost?: number;
    remainingBalance?: number;
    error?: string;
    stepLogs: SagaStepLogItem[];
  };
}> => {
  const headers: Record<string, string> = {};
  if (payload.idempotencyKey) {
    headers['Idempotency-Key'] = payload.idempotencyKey;
  }
  const response = await api.post('/saga/purchase', payload, { headers });
  return response.data;
};

export const getSagaHistoryAPI = async (params?: {
  status?: string;
  sagaType?: string;
  limit?: number;
  userId?: string;
}): Promise<{ success: boolean; count: number; data: SagaInstanceItem[] }> => {
  const response = await api.get('/saga/history', { params });
  return response.data;
};

export const getSagaDetailsAPI = async (
  sagaId: string
): Promise<{ success: boolean; data: SagaInstanceItem }> => {
  const response = await api.get(`/saga/${sagaId}`);
  return response.data;
};

