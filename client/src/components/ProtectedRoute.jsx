import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRouteAccess, getAccessibleRoutes } from '../utils/routeProtection';
import { isAdmin, isRegularUser, getRoleBasedRedirect } from '../utils/authProtection';

const ProtectedRoute = ({ children, routeName }) => {
  // Check if this is an admin route
  const isAdminRoute = routeName === 'admin-dashboard';
  
  console.log('ProtectedRoute - Route:', routeName);
  console.log('ProtectedRoute - isAdminRoute:', isAdminRoute);
  console.log('ProtectedRoute - isAdmin():', isAdmin());
  console.log('ProtectedRoute - isRegularUser():', isRegularUser());
  
  if (isAdminRoute) {
    // Check admin authentication and role
    if (!isAdmin()) {
      console.log('ProtectedRoute - Admin access denied, redirecting to admin login');
      // If user is logged in but not admin, redirect to admin login
      if (isRegularUser()) {
        return <Navigate to="/admin/login" replace />;
      }
      // If not logged in at all, redirect to admin login
      return <Navigate to="/admin/login" replace />;
    }
    
    console.log('ProtectedRoute - Admin access granted');
    // Admin has access to all routes
    return children;
  }
  
  // Regular user authentication
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has access to this route
  if (!hasRouteAccess(routeName, user)) {
    // Get all accessible routes for this user
    const accessibleRoutes = getAccessibleRoutes(user);
    
    // Find the first accessible route
    let redirectTo = '/dashboard'; // default fallback
    
    if (accessibleRoutes.length > 0) {
      // Priority order: dashboard first, then first available route
      if (accessibleRoutes.includes('dashboard')) {
        redirectTo = '/dashboard';
      } else {
        redirectTo = `/${accessibleRoutes[0]}`;
      }
    }
    
    // Redirect to first accessible page
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
