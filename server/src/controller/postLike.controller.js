const os = require('os')
const { checkConnection, SelectAll, Transaction, Query, Insert, SelectWithCondition } = require('../database/util/queries.util')
const { formatMemoryUsage, formatTime, DataModeling } = require('../util/helper.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()
require('dotenv').config()

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
    const countQuery = sql.select([
      { col: 'COUNT(*)', as: 'count' }
    ])
      .from(Master.post_like.tablename)
      .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
      .build();
    const countResult = await Query(countQuery, [postId], [Master.post_like.prefix_]);
    const likeCount = countResult[0]?.count || 0;
    
    // Check if current user liked this post
    let userLiked = false;
    if (!isNaN(userId)) {
      const userLikeQuery = sql.select([
        { col: Master.post_like.selectOptionColumns.id, as: 'pl_id' }
      ])
        .from(Master.post_like.tablename)
        .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
        .andWhere(Master.post_like.selectOptionColumns.mu_id, '=', userId)
        .build();
      const userLikeResult = await Query(userLikeQuery, [postId, userId], [Master.post_like.prefix_]);
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
    const checkQuery = sql.select([
        { col: Master.post_like.selectOptionColumns.id, as: 'pl_id' }
      ])
        .from(Master.post_like.tablename)
        .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
        .andWhere(Master.post_like.selectOptionColumns.mu_id, '=', userId)
        .build();
    const existingLike = await Query(checkQuery, [postId, userId], [Master.post_like.prefix_]);
    console.log('Existing like found:', existingLike.length > 0, existingLike);
    
    if (existingLike.length > 0) {
      // Unlike: remove the like
      console.log('Removing like for user', userId, 'on post', postId);
      const deleteQuery = sql.delete(Master.post_like.tablename)
        .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
        .andWhere(Master.post_like.selectOptionColumns.mu_id, '=', userId)
        .build();
      await Query(deleteQuery, [], [Master.post_like.prefix_]);
      console.log('Like removed successfully');
      
      // Get updated count
      const countQuery = sql.select([
        { col: 'COUNT(*)', as: 'count' }
      ])
        .from(Master.post_like.tablename)
        .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
        .build();
      const countResult = await Query(countQuery, [], [Master.post_like.prefix_]);
      
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
      const postCheckQuery = sql.select([
        { col: Master.post.selectOptionColumns.id, as: 'post_id' }
      ])
        .from(Master.post.tablename)
        .where(Master.post.selectOptionColumns.id, '=', postId)
        .build();
      const postExists = await Query(postCheckQuery, [], [Master.post.prefix_]);
      
      if (postExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      const insertQuery = sql.insert(Master.post_like.tablename, {
        columns: Master.post_like.insertColumns,
        prefix: Master.post_like.prefix_,
        isTransaction: false
      })
        .build();
      await Insert(insertQuery, [postId, userId, new Date()]);
      console.log('Like added successfully');
      
      // Get updated count
      const countQuery = sql.select([
        { col: 'COUNT(*)', as: 'count' }
      ])
        .from(Master.post_like.tablename)
        .where(Master.post_like.selectOptionColumns.post_id, '=', postId)
        .build();
      const countResult = await Query(countQuery, [], [Master.post_like.prefix_]);
      
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
