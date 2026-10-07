import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 1. Request Interceptor: Attach the access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 2. Response Interceptor: The "Silent Refresh" logic
api.interceptors.response.use(
  (response) => response, // If the request succeeds, just return it
  async (error) => {
    const originalRequest = error.config;

    // If the backend says 401 Unauthorized, and we haven't already retried this exact request...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token available");

        // Hit the exact refresh route we built in Phase 3
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, { 
          refreshToken 
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;

        // Save the new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update the failed request with the new access token and retry it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If the refresh token is dead or invalid, wipe everything and force login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.reload(); 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);