
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import AdminLogin from './pages/login/AdminLogin'
import UserLogin from './pages/login/UserLogin'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import StrictRouteGuard from './components/StrictRouteGuard'
import Dashboard from './pages/dashboard/Dashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import Users from './pages/users/Users'
import Appointments from './pages/admin/Appointments'
import UserManagement from './pages/admin/UserManagement'
import { preventCaching, forceReloadOnBack } from './utils/cacheControl'

function App() {
  useEffect(() => {
    preventCaching();
    forceReloadOnBack();

    // Prevent browser caching
    const metaTags = [
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' }
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[http-equiv="${tag.httpEquiv}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = tag.httpEquiv;
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });

    // Prevent back button caching
    const handleUnload = () => {
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <StrictRouteGuard>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={
              <ProtectedRoute routeName="dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/dashboard" element={
              <ProtectedRoute routeName="admin-dashboard">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute routeName="users">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute routeName="admin-dashboard">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/appointments" element={
              <ProtectedRoute routeName="admin-dashboard">
                <Appointments />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </StrictRouteGuard>
    </BrowserRouter>
  );
}

export default App
