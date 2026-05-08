const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentAppointments, getRecentPosts } = require('../controller/dashboard.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// All dashboard routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/appointments', getRecentAppointments);
router.get('/posts', getRecentPosts);

module.exports = {
  dashboardRouter: router
};
