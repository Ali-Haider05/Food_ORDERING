import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Check local storage on startup
    const storedUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

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
