const express = require('express');
const router = express.Router();
const { login, userLogin, getProfile } = require('../controller/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', login); // Admin login
router.post('/user-login', userLogin); // User login for appointments

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = {
  authRouter: router
};
