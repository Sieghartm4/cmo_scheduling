const { Query } = require('../database/util/queries.util');

// Get like count for a post and check if current user liked it
const getPostLikes = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = parseInt(req.context?.id, 10);
    
    console.log('GetPostLikes - postId:', postId, 'userId:', userId, 'context:', req.context);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    // Get total like count
    const countQuery = `
      SELECT COUNT(*) as count FROM post_like WHERE pl_post_id = ?
    `;
    const countResult = await Query(countQuery, [postId]);
    const likeCount = countResult[0]?.count || 0;
    
    // Check if current user liked this post
    let userLiked = false;
    if (!isNaN(userId)) {
      const userLikeQuery = `
        SELECT pl_id FROM post_like WHERE pl_post_id = ? AND pl_mu_id = ?
      `;
      const userLikeResult = await Query(userLikeQuery, [postId, userId]);
      userLiked = userLikeResult.length > 0;
    }
    
    console.log('GetPostLikes result - likeCount:', likeCount, 'userLiked:', userLiked);
    
    res.status(200).json({
      success: true,
      message: 'Likes retrieved successfully',
      data: {
        likeCount,
        userLiked
      }
    });
  } catch (error) {
    console.error('Error in getPostLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve likes',
      error: error.message
    });
  }
};

// Toggle like on a post
const toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = parseInt(req.context?.id, 10);
    
    console.log('Toggle Like - postId:', postId, 'userId:', userId, 'context:', req.context);
    
    if (isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    // Check if user already liked this post
    const checkQuery = `
      SELECT pl_id FROM post_like WHERE pl_post_id = ? AND pl_mu_id = ?
    `;
    const existingLike = await Query(checkQuery, [postId, userId]);
    console.log('Existing like found:', existingLike.length > 0, existingLike);
    
    if (existingLike.length > 0) {
      // Unlike: remove the like
      console.log('Removing like for user', userId, 'on post', postId);
      const deleteQuery = `DELETE FROM post_like WHERE pl_post_id = ? AND pl_mu_id = ?`;
      await Query(deleteQuery, [postId, userId]);
      console.log('Like removed successfully');
      
      // Get updated count
      const countQuery = `SELECT COUNT(*) as count FROM post_like WHERE pl_post_id = ?`;
      const countResult = await Query(countQuery, [postId]);
      
      res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: {
          liked: false,
          likeCount: countResult[0]?.count || 0
        }
      });
    } else {
      // Like: add new like
      console.log('Adding like for user', userId, 'on post', postId);
      
      // Check if post exists first
      const postCheckQuery = `SELECT post_id FROM post WHERE post_id = ?`;
      const postExists = await Query(postCheckQuery, [postId]);
      
      if (postExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      const insertQuery = `
        INSERT INTO post_like (pl_post_id, pl_mu_id, pl_created_at) VALUES (?, ?, NOW())
      `;
      await Query(insertQuery, [postId, userId]);
      console.log('Like added successfully');
      
      // Get updated count
      const countQuery = `SELECT COUNT(*) as count FROM post_like WHERE pl_post_id = ?`;
      const countResult = await Query(countQuery, [postId]);
      
      res.status(201).json({
        success: true,
        message: 'Post liked successfully',
        data: {
          liked: true,
          likeCount: countResult[0]?.count || 0
        }
      });
    }
  } catch (error) {
    console.error('Error in toggleLike:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

module.exports = {
  getPostLikes,
  toggleLike
};
