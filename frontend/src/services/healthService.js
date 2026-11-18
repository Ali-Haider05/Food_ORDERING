import api from './api';

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      online: true,
      data: response.data,
      message: response.data?.message || 'Food Ordering Backend is running',
      database: response.data?.database || 'NeDB',
    };
  } catch (error) {
    return {
      online: false,
      message: 'The backend is unavailable',
      database: null,
      error: error.message,
    };
  }
};
