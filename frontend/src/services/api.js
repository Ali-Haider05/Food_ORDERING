import axios from 'axios';

// Base API URL pointing to the backend server (defaults to http://localhost:5000/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000, // Quick timeout so it can gracefully fallback if backend service is offline
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('biit_foodhub_token') || localStorage.getItem('gourmet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, could clear token if needed
      console.warn('Unauthorized API request:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
