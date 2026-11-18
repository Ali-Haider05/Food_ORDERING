import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = import.meta.env?.VITE_API_URL || 
  (isLocalhost ? 'http://localhost:5000/api' : 'https://food-ordering-s8ga.onrender.com/api');
export const TOKEN_KEY = 'biit_foodhub_token';
export const SESSION_EXPIRED = 'foodhub:session-expired';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = config.skipAuth ? null : localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const status = error.response?.status;
  const sent = error.config?.headers?.Authorization;
  const current = localStorage.getItem(TOKEN_KEY);
  if (status === 401 && current && sent === 'Bearer ' + current) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(SESSION_EXPIRED));
  }

  error.message = error.response?.data?.message ||
    (error.response ? 'The request failed. Please try again.' : 'Could not reach the server. Please try again.');
  throw error;
});

export default api;
export { API_BASE_URL };
