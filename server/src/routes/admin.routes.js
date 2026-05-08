const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile } = require('../controller/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', adminLogin);

// Protected routes - require both authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/profile', getAdminProfile);

module.exports = {
  adminRouter: router
};
