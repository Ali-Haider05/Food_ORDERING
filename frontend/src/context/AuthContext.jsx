import React, { createContext, useContext, useState, useEffect } from 'react';
import { SESSION_EXPIRED } from '../services/api';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    const expire = () => {
      setUser(null);
      addToast({ title: 'Session expired', message: 'Sign in again to continue.', type: 'info' });
    };
    window.addEventListener(SESSION_EXPIRED, expire);
    for (const key of ['biit_foodhub_users_store_v2', 'biit_foodhub_user', 'gourmet_token']) {
      localStorage.removeItem(key);
    }

    const token = authService.getToken();
    if (token) {
      authService.getCurrentUser().then((current) => {
        if (active && authService.getToken() === token) setUser(current);
      }).catch((error) => {
        if (active && error.response?.status !== 401) {
          addToast({ title: 'Session unavailable', message: error.message, type: 'error' });
        }
      }).finally(() => {
        if (active) setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED, expire);
    };
  }, [addToast]);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      addToast({
        title: 'Welcome Back!',
        message: `Signed in as ${result.user.name} (${result.user.role})`,
        type: 'success',
      });
      return result;
    } catch (err) {
      addToast({
        title: 'Login Failed',
        message: err.message || 'Could not sign in',
        type: 'error',
      });
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      const result = await authService.signup(userData);
      setUser(result.user);
      addToast({
        title: 'Account Created',
        message: `Welcome to GourmetBite, ${result.user.name}!`,
        type: 'success',
      });
      return result;
    } catch (err) {
      addToast({
        title: 'Registration Error',
        message: err.message || 'Could not register account',
        type: 'error',
      });
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    addToast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
