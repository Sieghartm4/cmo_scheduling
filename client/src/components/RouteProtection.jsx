import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function RouteProtection({ children, routeName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const adminData = JSON.parse(localStorage.getItem('admin'));
    const sessionType = localStorage.getItem('sessionType');
    
    // If sessionType is 'admin', create a user object
    if (sessionType === 'admin' && adminData) {
      const adminUser = {
        ...adminData,
        sessionType: 'admin'
      };
      setUser(adminUser);
    } else {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if no user
      navigate('/admin/login');
      return;
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B]">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // User has access to all routes - no access control restrictions
  return children;
};

export default RouteProtection;
