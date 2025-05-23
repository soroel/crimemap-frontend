import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading, refreshToken } = useAuth();
  const location = useLocation();

  // Try to refresh auth state when component mounts
  useEffect(() => {
    // If we have a user but not authenticated, try a token refresh
    if (!isAuthenticated && !isLoading) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log("AuthGuard: Found token but not authenticated, trying refresh");
        refreshToken().catch(err => {
          console.error("AuthGuard refresh failed:", err);
        });
      }
    }
  }, [isAuthenticated, isLoading, refreshToken]);

  // Show nothing while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Check if user is authenticated and has allowed role
  if (!isAuthenticated) {
    console.log("AuthGuard: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles specified, any authenticated user is allowed
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has an allowed role
  if (user && user.role && allowedRoles.includes(user.role)) {
    return children;
  }

  // If user doesn't have an allowed role, redirect to home
  console.log("AuthGuard: User role not allowed", user?.role, allowedRoles);
  return <Navigate to="/" replace />;
};

export default AuthGuard;
