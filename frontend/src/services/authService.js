import api, { TOKEN_KEY } from './api.js';

async function startSession(route, credentials) {
  const { data } = await api.post(route, credentials, { skipAuth: true });
  if (!data.success || !data.user?.id || typeof data.token !== 'string') {
    throw new Error('The server did not return a valid session.');
  }
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export const authService = {
  login: (email, password) => startSession('/auth/login', { email, password }),
  signup: ({ name, email, password }) => startSession('/auth/signup', { name, email, password }),
  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
  logout: () => localStorage.removeItem(TOKEN_KEY),
  getToken: () => localStorage.getItem(TOKEN_KEY),
};
