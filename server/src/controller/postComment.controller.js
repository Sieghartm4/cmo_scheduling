const os = require('os')
const {
  checkConnection,
  SelectAll,
  Transaction,
  Query,
  Insert,
  SelectWithCondition,
} = require('../database/util/queries.util')
const {
  formatMemoryUsage,
  formatTime,
  DataModeling,
} = require('../util/helper.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()
require('dotenv').config()

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10)

    console.log('GetPostComments - postId:', postId)

    const query = sql
      .select([
        { col: Master.post_comment.selectOptionColumns.id, as: 'id' },
        { col: Master.post_comment.selectOptionColumns.post_id, as: 'post_id' },
        { col: Master.post_comment.selectOptionColumns.mu_id, as: 'commenter_id' },
        { col: Master.post_comment.selectOptionColumns.parent_id, as: 'parent_id' },
        { col: Master.post_comment.selectOptionColumns.comment, as: 'text' },
        {
          col: Master.post_comment.selectOptionColumns.created_at,
          as: 'created_at',
        },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'author' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      ])
      .from(Master.post_comment.tablename)
      .leftJoin(
        Master.master_user.tablename,
        Master.post_comment.selectOptionColumns.mu_id,
        Master.master_user.selectOptionColumns.id,
      )
      .where(Master.post_comment.selectOptionColumns.post_id, '=', postId)
      .orderBy(Master.post_comment.selectOptionColumns.created_at, 'ASC')
      .build()

    const comments = await Query(
      query,
      [postId],
      [Master.post_comment.prefix_, Master.master_user.prefix_],
    )
    console.log('Comments found:', comments.length)
    console.log(
      'Comments rows:',
      comments.map((c) => ({
        id: c.id,
        parent_id: c.parent_id,
        commenter_id: c.commenter_id,
        text: c.text,
      })),
    )

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: [],
    }))

    const commentById = commentsWithReplies.reduce((map, comment) => {
      map[comment.id] = comment
      return map
    }, {})

    const rootComments = []

    commentsWithReplies.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentById[comment.parent_id]
        if (parent) {
          parent.replies.push(comment)
          console.log(`Added reply ${comment.id} to parent ${comment.parent_id}`)
        } else {
          console.warn(
            `Parent ${comment.parent_id} not found for comment ${comment.id}`,
          )
          rootComments.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    console.log('Root comments tree:', JSON.stringify(rootComments, null, 2))
    console.log('Root comments count:', rootComments.length)
    console.log(
      'Root comments details:',
      rootComments.map((c) => ({
        id: c.id,
        text: c.text,
        replies: c.replies,
        repliesCount: c.replies.length,
      })),
    )

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: rootComments,
      count: comments.length,
    })
  } catch (error) {
    console.error('Error in getPostComments:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments',
      error: error.message,
    })
  }
}

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10)
    const { comment, parentId } = req.body
    const userId = parseInt(req.context?.id, 10)

    console.log(
      'AddComment - postId:',
      postId,
      'userId:',
      userId,
      'comment:',
      comment,
    )

    if (isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      })
    }

    const query = sql
      .insert(Master.post_comment.tablename, {
        columns: Master.post_comment.insertColumns,
        prefix: Master.post_comment.prefix_,
        isTransaction: false,
      })
      .build()

    const result = await Insert(query, [
      postId,
      userId,
      parentId || null,
      comment.trim(),
      new Date(),
    ])
    const insertedCommentId = result.insertId || result.id
    console.log('Comment inserted with ID:', insertedCommentId)

    // Fetch the newly created comment with user info
    const fetchQuery = sql
      .select([
        { col: Master.post_comment.selectOptionColumns.id, as: 'id' },
        { col: Master.post_comment.selectOptionColumns.post_id, as: 'post_id' },
        { col: Master.post_comment.selectOptionColumns.mu_id, as: 'commenter_id' },
        { col: Master.post_comment.selectOptionColumns.parent_id, as: 'parent_id' },
        { col: Master.post_comment.selectOptionColumns.comment, as: 'comment' },
        {
          col: Master.post_comment.selectOptionColumns.created_at,
          as: 'created_at',
        },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'author' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      ])
      .from(Master.post_comment.tablename)
      .leftJoin(
        Master.master_user.tablename,
        Master.post_comment.selectOptionColumns.mu_id,
        Master.master_user.selectOptionColumns.id,
      )
      .where(Master.post_comment.selectOptionColumns.id, '=', insertedCommentId)
      .build()
    const newComment = await Query(
      fetchQuery,
      [insertedCommentId],
      [Master.post_comment.prefix_, Master.master_user.prefix_],
    )

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment[0] || { commentId: result.insertId },
    })
  } catch (error) {
    console.error('Error in addComment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message,
    })
  }
}

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const userId = req.context?.mu_id || req.context?.id
    const userRole = req.context?.mu_role || req.context?.role

    // Check if user owns the comment or is admin
    const checkQuery = `
      SELECT pc_mu_id FROM post_comment WHERE pc_id = ?
    `
    const comment = await Query(checkQuery, [commentId])

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (comment[0].pc_mu_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      })
    }

    const deleteQuery = `DELETE FROM post_comment WHERE pc_id = ?`
    await Query(deleteQuery, [commentId])

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error('Error in deleteComment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message,
    })
  }
}

module.exports = {
  getPostComments,
  addComment,
  deleteComment,
}
