import { api } from '../Api/Axios';

export const loginAPI = async (identifier: string, password: string) => {
  const response = await api.post('/auth/login', { identifier, password });
  return response.data;
};

export const registerAPI = async (username: string, email: string, password: string, role: string) => {
  const response = await api.post('/auth/register', { username, email, password, role });
  return response.data;
};