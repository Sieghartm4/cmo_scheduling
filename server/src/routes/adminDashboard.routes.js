const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getRecentUsers,
  getRecentAppointments
} = require('../controller/adminDashboard.controller');

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', getAdminStats);

// GET /api/admin/recent-users - Get recent users
router.get('/recent-users', getRecentUsers);

// GET /api/admin/recent-appointments - Get recent appointments
router.get('/recent-appointments', getRecentAppointments);

// GET /api/admin/test - Test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
