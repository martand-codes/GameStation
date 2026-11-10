import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public Genesis & Token Handshakes
export const getGovernanceStatusAPI = async () => {
  const response = await api.get('/governance/status');
  return response.data;
};

export const claimRootOwnershipAPI = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post('/governance/claim-ownership', data);
  return response.data;
};

export const verifyStaffInviteAPI = async (token: string) => {
  const response = await api.get(`/governance/staff/verify-token?token=${encodeURIComponent(token)}`);
  return response.data;
};

export const acceptStaffInviteAPI = async (data: {
  token: string;
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post('/governance/staff/accept-invitation', data);
  return response.data;
};

// Protected Owner Operations
export const verifyMasterKeyAPI = async (masterKey: string) => {
  const response = await api.post('/governance/verify-master-key', { masterKey });
  return response.data;
};

export const getSecurityChallengeAPI = async () => {
  const response = await api.get('/governance/security-challenge');
  return response.data;
};

export const verifySecurityChallengeAPI = async (data: { questionIndex: number; answer: string }) => {
  const response = await api.post('/governance/verify-challenge', data);
  return response.data;
};

export const breakGlassOverrideAPI = async (seedPhrase: string) => {
  const response = await api.post('/governance/break-glass-override', { seedPhrase });
  return response.data;
};

export const getEmpireMetricsAPI = async () => {
  const response = await api.get('/governance/metrics');
  return response.data;
};

export const getEmpireChartMetricsAPI = async () => {
  const response = await api.get('/governance/metrics/charts');
  return response.data;
};

export const getAuditLogsAPI = async () => {
  const response = await api.get('/governance/audit-logs');
  return response.data;
};

export const createStaffInviteAPI = async (data: {
  role?: 'ADMIN';
  expiresInHours?: number;
}) => {
  const response = await api.post('/governance/staff/invite', data);
  return response.data;
};

export const getStaffInvitesAPI = async () => {
  const response = await api.get('/governance/staff/invites');
  return response.data;
};

export const revokeStaffInviteAPI = async (id: string) => {
  const response = await api.delete(`/governance/staff/invites/${id}`);
  return response.data;
};

export const getStaffMembersAPI = async () => {
  const response = await api.get('/governance/staff/roster');
  return response.data;
};

export const revokeStaffMemberAPI = async (id: string) => {
  const response = await api.delete(`/governance/staff/roster/${id}`);
  return response.data;
};

// --- Certification Desk Operations ---
export const getPendingCertificationGamesAPI = async () => {
  const response = await api.get('/admin/games/pending');
  return response.data;
};

export const approveGameCertificationAPI = async (gameId: string) => {
  const response = await api.post(`/admin/games/${gameId}/approve`);
  return response.data;
};

export const rejectGameCertificationAPI = async (gameId: string, reason: string) => {
  const response = await api.post(`/admin/games/${gameId}/reject`, { reason });
  return response.data;
};

// --- Sovereign Killswitches & Security ---
export const getPublicBroadcastAPI = async () => {
  const response = await api.get('/governance/broadcast');
  return response.data;
};

export const updateBroadcastAPI = async (data: {
  active: boolean;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}) => {
  const response = await api.post('/governance/system/broadcast', data);
  return response.data;
};

export const getSystemTelemetryAPI = async () => {
  const response = await api.get('/governance/system/telemetry');
  return response.data;
};

export const updatePlatformRoyaltyRateAPI = async (rate: number) => {
  const response = await api.post('/governance/system/royalty-rate', { rate });
  return response.data;
};

export const getSystemKillswitchesAPI = async () => {
  const response = await api.get('/governance/system/killswitches');
  return response.data;
};

export const toggleSystemKillswitchAPI = async (data: {
  switchName: 'marketplaceFrozen' | 'submissionsFrozen' | 'maintenanceMode';
  state: boolean;
  notice?: string;
}) => {
  const response = await api.post('/governance/system/killswitch', data);
  return response.data;
};

export const purgeAllSessionsAPI = async () => {
  const response = await api.post('/governance/system/purge-sessions');
  return response.data;
};

// --- Game Catalog Moderation (DMCA / Delisting) ---
export const getAllPlatformGamesAPI = async (search?: string) => {
  const url = search ? `/governance/games/catalog?search=${encodeURIComponent(search)}` : '/governance/games/catalog';
  const response = await api.get(url);
  return response.data;
};

export const moderateGameStatusAPI = async (gameId: string, data: {
  status: 'PUBLISHED' | 'HIDDEN' | 'REJECTED';
  reason?: string;
}) => {
  const response = await api.post(`/governance/games/${gameId}/status`, data);
  return response.data;
};

// --- Sovereign Treasury Ledger & Developer Disbursals ---
export const getTreasuryLedgerAPI = async () => {
  const response = await api.get('/governance/treasury/ledger');
  return response.data;
};

export const getDeveloperPayoutsAPI = async () => {
  const response = await api.get('/governance/treasury/developer-payouts');
  return response.data;
};

export const disburseDeveloperPayoutAPI = async (data: {
  developerId: string;
  amount: number;
  notes?: string;
}) => {
  const response = await api.post('/governance/treasury/disburse', data);
  return response.data;
};

// --- User Management & Moderation ---
export const getPlatformUsersAPI = async (search?: string) => {
  const url = search ? `/governance/users?search=${encodeURIComponent(search)}` : '/governance/users';
  const response = await api.get(url);
  return response.data;
};

export const toggleUserSuspensionAPI = async (userId: string, reason?: string) => {
  const response = await api.post(`/governance/users/${userId}/toggle-status`, { reason });
  return response.data;
};

export const changeUserRoleAPI = async (userId: string, role: 'PLAYER' | 'DEVELOPER' | 'ADMIN') => {
  const response = await api.post(`/governance/users/${userId}/role`, { role });
  return response.data;
};
