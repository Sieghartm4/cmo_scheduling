import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdmin, isRegularUser, getRoleBasedRedirect } from '../utils/authProtection';

export default function RouteGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Debug: Log current authentication state
    console.log('RouteGuard - Current path:', pathname);
    console.log('RouteGuard - isAdmin:', isAdmin());
    console.log('RouteGuard - isRegularUser:', isRegularUser());
    console.log('RouteGuard - adminToken:', localStorage.getItem('adminToken'));
    console.log('RouteGuard - userToken:', localStorage.getItem('token'));
    
    // Force authentication check on every route change (including back button)
    const checkAuthAndRedirect = () => {
      // Check if user is trying to access login pages while authenticated
      if (pathname === '/' || pathname === '/admin' || pathname === '/admin/login') {
        if (isAdmin()) {
          console.log('RouteGuard - Admin trying to access login, redirecting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
          return true; // Redirected
        }
        if (isRegularUser()) {
          console.log('RouteGuard - User trying to access login, redirecting to user dashboard');
          navigate('/dashboard', { replace: true });
          return true; // Redirected
        }
      }
      
      // Check if regular user is trying to access admin routes
      if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
        if (!isAdmin()) {
          if (isRegularUser()) {
            // Regular user trying to access admin routes - redirect to admin login
            console.log('RouteGuard - Regular user trying to access admin route, redirecting to admin login');
            navigate('/admin/login', { replace: true });
            return true; // Redirected
          } else {
            // Not logged in - redirect to admin login
            console.log('RouteGuard - Non-authenticated trying to access admin route, redirecting to admin login');
            navigate('/admin/login', { replace: true });
            return true; // Redirected
          }
        }
      }
      
      // Check if user is trying to access protected routes without authentication
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/users') || pathname.startsWith('/settings')) {
        if (!isAdmin() && !isRegularUser()) {
          console.log('RouteGuard - Non-authenticated trying to access protected route, redirecting to login');
          navigate('/', { replace: true });
          return true; // Redirected
        }
      }
      
      return false; // No redirect
    };

    const wasRedirected = checkAuthAndRedirect();
    
    if (!wasRedirected) {
      console.log('RouteGuard - Route access granted');
    }
  }, [navigate, location]);

  // Also listen for browser back/forward events
  useEffect(() => {
    const handlePopState = () => {
      console.log('RouteGuard - Browser navigation detected (back/forward)');
      // Force re-check authentication on browser navigation
      const pathname = window.location.pathname;
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
          if (!isAdmin()) {
            console.log('RouteGuard - Back button access to admin route blocked, redirecting to admin login');
            navigate('/admin/login', { replace: true });
          }
        }
        
        if ((pathname.startsWith('/dashboard') || pathname.startsWith('/users') || pathname.startsWith('/settings')) && !isAdmin() && !isRegularUser()) {
          console.log('RouteGuard - Back button access to protected route blocked, redirecting to login');
          navigate('/', { replace: true });
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return <>{children}</>;
}
