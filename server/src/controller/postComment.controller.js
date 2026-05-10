const { Query } = require('../database/util/queries.util');

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    console.log('GetPostComments - postId:', postId);
    
    const query = `
      SELECT pc.pc_id as id, pc.pc_post_id as post_id, pc.pc_mu_id as mu_id, 
             pc.pc_parent_id as parent_id, pc.pc_comment as text, pc.pc_created_at as created_at,
             mu.mu_fullname as author, mu.mu_email as email
      FROM post_comment pc
      LEFT JOIN master_user mu ON pc.pc_mu_id = mu.mu_id
      WHERE pc.pc_post_id = ?
      ORDER BY pc.pc_created_at ASC
    `;
    
    const comments = await Query(query, [postId]);
    console.log('Comments found:', comments.length);
    
    // Build comment tree structure (handle replies)
    const commentMap = {};
    const rootComments = [];
    
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });
    
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap[comment.parent_id];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: rootComments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error in getPostComments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments',
      error: error.message
    });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const { comment, parentId } = req.body;
    const userId = parseInt(req.context?.id, 10);
    
    console.log('AddComment - postId:', postId, 'userId:', userId, 'comment:', comment);
    
    if (isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    const query = `
      INSERT INTO post_comment (pc_post_id, pc_mu_id, pc_parent_id, pc_comment, pc_created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await Query(query, [postId, userId, parentId || null, comment.trim()]);
    console.log('Comment inserted with ID:', result.insertId);
    
    // Fetch the newly created comment with user info
    const fetchQuery = `
      SELECT pc.*, mu.mu_fullname as author, mu.mu_email 
      FROM post_comment pc
      LEFT JOIN master_user mu ON pc.pc_mu_id = mu.mu_id
      WHERE pc.pc_id = ?
    `;
    const newComment = await Query(fetchQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment[0] || { commentId: result.insertId }
    });
  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.context?.mu_id || req.context?.id;
    const userRole = req.context?.mu_role || req.context?.role;
    
    // Check if user owns the comment or is admin
    const checkQuery = `
      SELECT pc_mu_id FROM post_comment WHERE pc_id = ?
    `;
    const comment = await Query(checkQuery, [commentId]);
    
    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    if (comment[0].pc_mu_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    const deleteQuery = `DELETE FROM post_comment WHERE pc_id = ?`;
    await Query(deleteQuery, [commentId]);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

module.exports = {
  getPostComments,
  addComment,
  deleteComment
};
