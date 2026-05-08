/**
 * Authentication and role-based protection utilities
 */

/**
 * Check if user is authenticated (admin or regular user)
 * @returns {boolean} - Whether user is authenticated
 */
export const isAuthenticated = () => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  return !!(adminToken || userToken);
};

/**
 * Check if current user is an admin
 * @returns {boolean} - Whether current user is admin
 */
export const isAdmin = () => {
  const adminToken = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('admin');
  return !!(adminToken && adminData);
};

/**
 * Check if current user is a regular user
 * @returns {boolean} - Whether current user is regular user
 */
export const isRegularUser = () => {
  const userToken = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  return !!(userToken && userData) && !isAdmin();
};

/**
 * Get current user role
 * @returns {string|null} - 'admin', 'user', or null
 */
export const getUserRole = () => {
  if (isAdmin()) return 'admin';
  if (isRegularUser()) return 'user';
  return null;
};

/**
 * Check if user can access admin routes
 * @returns {boolean} - Whether user can access admin routes
 */
export const canAccessAdminRoutes = () => {
  return isAdmin();
};

/**
 * Check if user can access user routes
 * @returns {boolean} - Whether user can access user routes
 */
export const canAccessUserRoutes = () => {
  return isRegularUser() || isAdmin(); // Admins can access user routes too
};

/**
 * Get appropriate redirect URL based on user role
 * @returns {string} - Redirect URL
 */
export const getRoleBasedRedirect = () => {
  if (isAdmin()) return '/admin/dashboard';
  if (isRegularUser()) return '/dashboard';
  return '/';
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('sessionType');
};
