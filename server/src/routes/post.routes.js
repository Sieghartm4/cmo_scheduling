const express = require('express');
const { createPost, getPosts, getPostById, updatePost, deletePost, getPublicFeed } = require('../controller/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes - no authentication required
router.get('/feed', getPublicFeed);
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes - authentication required
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

module.exports = {
  postRouter: router
};
