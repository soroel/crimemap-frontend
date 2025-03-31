import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthGuard = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log("AuthGuard Status:", { isAuthenticated, user, isLoading });

  if (isLoading) {
    return <div className="auth-loading">Verifying permissions...</div>;
  }

  if (!isAuthenticated) {
    console.log("Redirecting to login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log(`Redirecting: User role "${user.role}" not in allowedRoles:`, allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;
