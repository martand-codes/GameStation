import { api } from '../Api/Axios';

export interface UserSession {
  id: string;
  deviceType: 'DESKTOP' | 'MOBILE' | string;
  deviceName?: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'PLAYER' | 'DEVELOPER' | 'ADMIN' | 'OWNER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    library: number;
    payments: number;
    sessions: number;
    games: number;
  };
  payments: Array<{
    id: string;
    amount: number | string;
    currency: string;
    status: string;
    providerPaymentId?: string | null;
    createdAt: string;
    game?: {
      id: string;
      title: string;
      genre: string;
      media?: {
        coverImageUrl?: string;
      } | null;
    } | null;
    pricing?: {
      editionName: string;
    } | null;
  }>;
  sessions?: UserSession[];
  totalSpent: number;
}

export const getProfileAPI = async (): Promise<{ success: boolean; data: UserProfile }> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfileAPI = async (data: { username?: string; email?: string; role?: string }): Promise<{ success: boolean; message: string; user: any }> => {
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

export const changePasswordAPI = async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

export const revokeOtherSessionsAPI = async (): Promise<{ success: boolean; message: string }> => {
  const refreshToken = localStorage.getItem('refreshToken') || '';
  const response = await api.post('/auth/revoke-sessions', { refreshToken });
  return response.data;
};
