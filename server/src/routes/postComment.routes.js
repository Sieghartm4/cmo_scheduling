const express = require('express');
const router = express.Router();
const { getPostComments, addComment, deleteComment } = require('../controller/postComment.controller');
const { auth, authOptional } = require('../middlewares/auth.middleware');

// Get all comments for a post (public - no auth required)
router.get('/post/:postId', authOptional, getPostComments);

// Add a comment to a post (requires authentication)
router.post('/post/:postId', auth, addComment);

// Delete a comment (requires authentication)
router.delete('/:commentId', auth, deleteComment);

module.exports = router;
