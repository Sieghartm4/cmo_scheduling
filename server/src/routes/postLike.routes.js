const express = require('express');
const router = express.Router();
const { getPostLikes, toggleLike } = require('../controller/postLike.controller');
const { auth } = require('../middlewares/auth.middleware');

// Get like count and user like status for a post (auth optional but needed for userLiked status)
router.get('/post/:postId', auth, getPostLikes);

// Toggle like on a post (requires authentication)
router.post('/post/:postId', auth, toggleLike);

module.exports = router;
