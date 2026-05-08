
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLogin from './pages/login/AdminLogin'
import UserLogin from './pages/login/UserLogin'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/dashboard/Dashboard'
import Users from './pages/users/Users'

function App() {
  return (
    <BrowserRouter>
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
          <Route path="users" element={
            <ProtectedRoute routeName="users">
              <Users />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
