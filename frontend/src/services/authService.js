import api from './api';
import { MOCK_USERS } from './mockData';

const USERS_STORAGE_KEY = 'biit_foodhub_users_store_v2';
const TOKEN_KEY = 'biit_foodhub_token';
const USER_KEY = 'biit_foodhub_user';

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: String(u.id || u._id || `usr-${Date.now()}`),
    name: u.name || 'Student User',
    email: u.email || '',
    role: u.role || 'customer',
    phone: u.phone || '+92 301 5551234',
    address: u.address || 'BIIT Campus, Shamsabad, Rawalpindi',
  };
};

const getUsersStore = () => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_USERS;
  }
};

const saveUsersStore = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authService = {
  // Login user (Calls real backend first)
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      const token = data?.token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token && user) {
        const normalized = normalizeUser(user);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(normalized));
        return { success: true, user: normalized, token };
      }
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.status === 401)) {
        throw new Error(err.response.data?.message || 'Invalid email or password');
      }
    }

    // Local user store verification fallback
    const users = getUsersStore();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password. Use demo buttons for 1-click access!');
    }

    const normalized = normalizeUser(user);
    const mockToken = `jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));

    return { success: true, user: normalized, token: mockToken };
  },

  // Signup user (Calls real backend first)
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data;
      const token = data?.token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token && user) {
        const normalized = normalizeUser(user);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(normalized));
        return { success: true, user: normalized, token };
      }
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.status === 409)) {
        throw new Error(err.response.data?.message || 'Email already registered');
      }
    }

    const users = getUsersStore();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = normalizeUser({
      ...userData,
      id: `usr-${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    users.push({ ...userData, id: newUser.id, avatar: newUser.avatar });
    saveUsersStore(users);

    const mockToken = `jwt-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser, token: mockToken };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current session user
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  },

  // Get active JWT token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('biit_foodhub_token');
  },
};
