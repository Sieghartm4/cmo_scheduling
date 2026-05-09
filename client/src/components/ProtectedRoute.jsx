import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, isRegularUser } from '../utils/authProtection';

function ProtectedRoute({ children, routeName }) {
  // Check if this is an admin route
  const isAdminRoute = routeName === 'admin-dashboard';
  
  if (isAdminRoute) {
    // Check admin authentication and role
    if (!isAdmin()) {
      // If user is logged in but not admin, redirect to admin login
      if (isRegularUser()) {
        return <Navigate to="/admin/login" replace />;
      }
      // If not logged in at all, redirect to admin login
      return <Navigate to="/admin/login" replace />;
    }
    
    // Admin has access to all routes
    return children;
  }
  
  // Regular user authentication
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // User has access to all routes - no access control restrictions
  return children;
};

export default ProtectedRoute;
