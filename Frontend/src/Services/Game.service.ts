import { api } from '../Api/Axios';

export const createGameAPI = async (data: any) => {
  const response = await api.post('/developer/games', data);
  return response.data;
};

export const getGamesAPI = async () => {
  const response = await api.get('/developer/games');
  return response.data;
};

export const getGameByIdAPI = async (id: string) => {
  const response = await api.get(`/developer/games/${id}`);
  return response.data;
};

export const updateGameAPI = async (id: string, data: any) => {
  const response = await api.patch(`/developer/games/${id}`, data);
  return response.data;
};

export const deleteGameAPI = async (id: string) => {
  const response = await api.delete(`/developer/games/${id}`);
  return response.data;
};

export const updatePricingAPI = async (id: string, data: any) => {
  const response = await api.put(`/developer/games/${id}/pricing`, data);
  return response.data;
};

export const addDiscountAPI = async (id: string, data: any) => {
  const response = await api.post(`/developer/games/${id}/discounts`, data);
  return response.data;
};

export const updateMediaAPI = async (id: string, data: any) => {
  const response = await api.put(`/developer/games/${id}/media`, data);
  return response.data;
};

export const addVersionAPI = async (id: string, data: any) => {
  const response = await api.post(`/developer/games/${id}/versions`, data);
  return response.data;
};

export const submitGameAPI = async (id: string) => {
  const response = await api.post(`/developer/games/${id}/submit`);
  return response.data;
};
