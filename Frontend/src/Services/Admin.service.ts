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

// Staff Identity & Clearance
export const getAdminProfileAPI = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

// Operations Dashboard Metrics
export const getAdminDashboardMetricsAPI = async () => {
  const response = await api.get('/admin/metrics/dashboard');
  return response.data;
};

// Certification Workflow
export const getPendingGamesAPI = async () => {
  const response = await api.get('/admin/games/pending');
  return response.data;
};

// Staff Roster & Task Assignment / Claim Lock
export const getStaffRosterAPI = async () => {
  const response = await api.get('/admin/staff/roster');
  return response.data;
};

export const claimGameReviewAPI = async (gameId: string) => {
  const response = await api.post(`/admin/games/${gameId}/claim`);
  return response.data;
};

export const releaseGameReviewAPI = async (gameId: string) => {
  const response = await api.post(`/admin/games/${gameId}/release`);
  return response.data;
};

export const assignGameReviewAPI = async (gameId: string, targetAdminId: string) => {
  const response = await api.post(`/admin/games/${gameId}/assign`, { targetAdminId });
  return response.data;
};

export const saveQANotesAPI = async (gameId: string, qaNotes: string) => {
  const response = await api.post(`/admin/games/${gameId}/qa-notes`, { qaNotes });
  return response.data;
};

export const approveGameAPI = async (gameId: string) => {
  const response = await api.post(`/admin/games/${gameId}/approve`);
  return response.data;
};

export const rejectGameAPI = async (gameId: string, reason: string) => {
  const response = await api.post(`/admin/games/${gameId}/reject`, { reason });
  return response.data;
};

// Storefront Catalog Moderation
export const getAdminCatalogAPI = async (search?: string, status?: string) => {
  const params: any = {};
  if (search) params.search = search;
  if (status && status !== 'ALL') params.status = status;
  const response = await api.get('/admin/catalog', { params });
  return response.data;
};

export const moderateGameVisibilityAPI = async (gameId: string, status: string, reason?: string) => {
  const response = await api.post(`/admin/catalog/${gameId}/status`, { status, reason });
  return response.data;
};

// User Support & Moderation
export const getAdminUsersAPI = async (search?: string, role?: string, status?: string) => {
  const params: any = {};
  if (search) params.search = search;
  if (role && role !== 'ALL') params.role = role;
  if (status && status !== 'ALL') params.status = status;
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleUserSuspensionAPI = async (userId: string, reason?: string) => {
  const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
  return response.data;
};

export const updateUserRoleAPI = async (userId: string, role: string, reason?: string) => {
  const response = await api.post(`/admin/users/${userId}/role`, { role, reason });
  return response.data;
};

// Operations Flight Recorder / Audit Logs
export const getAdminAuditLogsAPI = async (limit = 100, action?: string) => {
  const params: any = { limit };
  if (action && action !== 'ALL') params.action = action;
  const response = await api.get('/admin/logs', { params });
  return response.data;
};

