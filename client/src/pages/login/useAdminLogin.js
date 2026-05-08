import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAdminLogin = () => {
  const [loginData, setLoginData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_LINK}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLoginData(result.data);
        // Store admin session data separately
        localStorage.setItem('adminToken', result.data.token);
        localStorage.setItem('admin', JSON.stringify(result.data.admin));
        localStorage.setItem('sessionType', 'admin');
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Admin login failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loginData, loading, error, login };
};

export default useAdminLogin;
