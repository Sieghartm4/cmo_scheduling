const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} = require('../controller/userManagement.controller');

// GET /api/users - Get all users
router.get('/', getUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/users - Create new user
router.post('/', createUser);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// PATCH /api/users/:id/status - Update user status
router.patch('/:id/status', updateUserStatus);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
