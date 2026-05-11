const os = require('os')
const { checkConnection, SelectAll, Transaction, Query, Insert, SelectWithCondition } = require('../database/util/queries.util')
const { formatMemoryUsage, formatTime, DataModeling } = require('../util/helper.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()
require('dotenv').config()

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    console.log('GetPostComments - postId:', postId);
    
    const query = sql.select([
      { col: Master.post_comment.selectOptionColumns.id, as: 'id' },
      { col: Master.post_comment.selectOptionColumns.post_id, as: 'post_id' },
      { col: Master.post_comment.selectOptionColumns.mu_id, as: 'mu_id' },
      { col: Master.post_comment.selectOptionColumns.parent_id, as: 'parent_id' },
      { col: Master.post_comment.selectOptionColumns.comment, as: 'text' },
      { col: Master.post_comment.selectOptionColumns.created_at, as: 'created_at' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'author' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' }
    ])
      .from(Master.post_comment.tablename)
      .leftJoin(Master.master_user.tablename, Master.post_comment.selectOptionColumns.mu_id, Master.master_user.selectOptionColumns.id)
      .where(Master.post_comment.selectOptionColumns.post_id, '=', postId)
      .orderBy(Master.post_comment.selectOptionColumns.created_at, 'ASC')
      .build();
    
    const comments = await Query(query, [postId], [Master.post_comment.prefix_, Master.master_user.prefix_]);
    console.log('Comments found:', comments.length);
    
    // Get parent comment IDs from replies
    const parentIds = comments
      .filter(c => c.parent_id)
      .map(c => c.parent_id)
      .filter((id, index, arr) => arr.indexOf(id) === index); // unique values
    
    console.log('Parent comment IDs needed:', parentIds);
    
    // Fetch parent comments if any
    let parentComments = [];
    if (parentIds.length > 0) {
      const parentQuery = sql.select([
        { col: Master.post_comment.selectOptionColumns.id, as: 'id' },
        { col: Master.post_comment.selectOptionColumns.post_id, as: 'post_id' },
        { col: Master.post_comment.selectOptionColumns.mu_id, as: 'mu_id' },
        { col: Master.post_comment.selectOptionColumns.parent_id, as: 'parent_id' },
        { col: Master.post_comment.selectOptionColumns.comment, as: 'text' },
        { col: Master.post_comment.selectOptionColumns.created_at, as: 'created_at' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'author' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' }
      ])
        .from(Master.post_comment.tablename)
        .leftJoin(Master.master_user.tablename, Master.post_comment.selectOptionColumns.mu_id, Master.master_user.selectOptionColumns.id)
        .where(Master.post_comment.selectOptionColumns.id, 'IN', parentIds)
        .build();
      
      parentComments = await Query(parentQuery, [parentIds], [Master.post_comment.prefix_, Master.master_user.prefix_]);
      console.log('Parent comments found:', parentComments.length);
    }
    
    // Combine all comments - keep everything including duplicates
    const allComments = [...comments, ...parentComments];
    console.log('Total comments (including parents):', allComments.length);
    console.log('All comments:', allComments.map(c => ({ id: c.id, parent_id: c.parent_id, text: c.text })));
    
    // Build comment tree structure (handle replies)
    const treeCommentMap = {};
    const rootComments = [];
    
    // First pass: add ALL comments to map, but for duplicate IDs, keep the one with null parent_id
    // as the "canonical" parent reference
    allComments.forEach(comment => {
      if (!comment.replies) comment.replies = [];
      
      // For treeCommentMap (used for parent lookup), prefer root comments
      if (!treeCommentMap[comment.id]) {
        treeCommentMap[comment.id] = comment;
      } else if (comment.parent_id === null) {
        // Replace with root version if we found one
        treeCommentMap[comment.id] = comment;
      }
    });
    
    console.log('Tree comment map keys:', Object.keys(treeCommentMap));
    
    // Second pass: build the tree
    // Track which comments have been added to avoid duplicates in output
    const addedToTree = new Set();
    
    allComments.forEach(comment => {
      if (comment.parent_id) {
        // This is a reply - attach to parent
        const parent = treeCommentMap[comment.parent_id];
        if (parent) {
          // Check if already added to this parent's replies
          const alreadyAdded = parent.replies.find(r => 
            r.id === comment.id && r.text === comment.text
          );
          if (!alreadyAdded) {
            parent.replies.push(comment);
            addedToTree.add(`${comment.id}-${comment.parent_id}`);
            console.log(`Added reply ${comment.id} to parent ${comment.parent_id}`);
          }
        } else {
          console.log(`Parent ${comment.parent_id} not found for comment ${comment.id}`);
        }
      } else {
        // This is a root comment - add to rootComments
        const key = `${comment.id}-root`;
        if (!addedToTree.has(key)) {
          rootComments.push(comment);
          addedToTree.add(key);
          console.log(`Added root comment ${comment.id} to tree`);
        }
      }
    });
    
    // Use rootComments which already contains the properly built tree
    console.log('Root comments tree:', JSON.stringify(rootComments, null, 2));
    console.log('Root comments count:', rootComments.length);
    console.log('Root comments details:', rootComments.map(c => ({ id: c.id, text: c.text, replies: c.replies, repliesCount: c.replies.length })));
    
    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: rootComments,  // Use rootComments instead of rebuilding
      count: allComments.length  // Return total count including replies
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
    
    const query = sql.insert(Master.post_comment.tablename, {
        columns: Master.post_comment.insertColumns,
        prefix: Master.post_comment.prefix_,
        isTransaction: false
      })
        .build();
    
    const result = await Insert(query, [postId, userId, parentId || null, comment.trim(), new Date()]);
    console.log('Comment inserted with ID:', result.insertId);
    
    // Fetch the newly created comment with user info
    const fetchQuery = sql.select([
      { col: Master.post_comment.selectOptionColumns.id, as: 'id' },
      { col: Master.post_comment.selectOptionColumns.post_id, as: 'post_id' },
      { col: Master.post_comment.selectOptionColumns.mu_id, as: 'mu_id' },
      { col: Master.post_comment.selectOptionColumns.parent_id, as: 'parent_id' },
      { col: Master.post_comment.selectOptionColumns.comment, as: 'comment' },
      { col: Master.post_comment.selectOptionColumns.created_at, as: 'created_at' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'author' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' }
    ])
      .from(Master.post_comment.tablename)
      .leftJoin(Master.master_user.tablename, Master.post_comment.selectOptionColumns.mu_id, Master.master_user.selectOptionColumns.id)
      .where(Master.post_comment.selectOptionColumns.id, '=', result.insertId)
      .build();
    const newComment = await Query(fetchQuery, [], [Master.post_comment.prefix_, Master.master_user.prefix_]);
    
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
