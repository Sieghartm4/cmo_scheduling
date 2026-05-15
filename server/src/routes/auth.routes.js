const express = require('express')
const router = express.Router()
const {
  login,
  userLogin,
  getProfile,
  userRegister,
  googleAuth,
  verifyPassword,
  updateProfile,
  changePassword,
} = require('../controller/auth.controller')
const { authenticateToken } = require('../middleware/auth.middleware')

// Public routes
router.post('/login', login) // Admin login
router.post('/user-login', userLogin) // User login for appointments
router.post('/user-register', userRegister) // User registration
router.post('/google-auth', googleAuth) // Google OAuth login/register

// Protected routes
router.get('/profile', authenticateToken, getProfile)
router.post('/verify-password', authenticateToken, verifyPassword)
router.put('/profile', authenticateToken, updateProfile)
router.post('/change-password', authenticateToken, changePassword)

module.exports = {
  authRouter: router,
}
