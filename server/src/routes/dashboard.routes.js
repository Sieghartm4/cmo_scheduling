const express = require('express')
const router = express.Router()
const {
  getDashboardStats,
  getRecentAppointments,
  getRecentPosts,
  getRecentComments,
  getRecentLikes,
  getDashboardOverview,
} = require('../controller/dashboard.controller')
const { authenticateToken, requireUser } = require('../middleware/auth.middleware')

// Dashboard routes are available to authenticated users
router.use(authenticateToken)
router.use(requireUser)

router.get('/overview', getDashboardOverview)
router.get('/stats', getDashboardStats)
router.get('/appointments', getRecentAppointments)
router.get('/posts', getRecentPosts)
router.get('/comments', getRecentComments)
router.get('/likes', getRecentLikes)

module.exports = {
  dashboardRouter: router,
}
