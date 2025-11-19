import React from 'react';
import { Navigate } from 'react-router-dom';

// role = "admin" or "user" (optional)
const ProtectedRoute = ({ element: Component, requiredRole }) => {
  const token = localStorage.getItem('auth-token');
  const userRole = localStorage.getItem('user-role');

  // ✅ Not logged in → go back to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Logged in but doesn’t have required role → redirect accordingly
  if (requiredRole && userRole !== requiredRole) {
    return userRole === 'admin' ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  // ✅ Otherwise, allow access
  return <Component />;
};

export default ProtectedRoute;
