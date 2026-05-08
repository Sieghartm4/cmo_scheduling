import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function StrictRouteGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Simple, strict authentication check
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    
    // Block ALL admin routes if not authenticated as admin
    if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
      if (!adminToken) {
        // Immediately redirect to admin login - no questions asked
        navigate('/admin/login', { replace: true });
        return;
      }
    }
    
    // Block ALL protected routes if not authenticated
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/users') || pathname.startsWith('/settings')) {
      if (!adminToken && !userToken) {
        // Immediately redirect to user login
        navigate('/', { replace: true });
        return;
      }
    }
    
    // Redirect authenticated users away from login pages
    if (pathname === '/' || pathname === '/admin' || pathname === '/admin/login') {
      if (adminToken) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      if (userToken) {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [navigate, location]);

  return <>{children}</>;
}
