import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      addToast({ title: 'Admin access required', message: 'This page is restricted to administrators.', type: 'warning' });
    }
  }, [loading, isAuthenticated, isAdmin, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
