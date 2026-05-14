const { Query } = require('../database/util/queries.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()

// Helper function to get category name by ID
const getCategoryName = async (categoryId) => {
  if (!categoryId) return null
  try {
    const categoryQuery = `SELECT mc_name FROM ${Master.master_category.tablename} WHERE mc_id = ?`
    const result = await Query(
      categoryQuery,
      [categoryId],
      [Master.master_category.prefix_],
    )
    return result[0]?.mc_name || null
  } catch (error) {
    console.error('Error getting category name:', error)
    return null
  }
}

const createPost = async (req, res, next) => {
  try {
    console.log('Create post - Request body:', req.body)
    console.log('Create post - User:', req.user)

    // Validate request body structure
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body format',
      })
    }

    const { title, content, media = [], status = 1, category_id } = req.body
    const user_id = req.user?.id

    // Validate required fields
    if (!title || !content || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and user ID are required',
        received: { title, content, user_id },
      })
    }

    // Handle category_id - convert empty string to null
    const categoryIdValue = category_id && category_id !== '' ? category_id : null
    console.log('Category ID handling:', { category_id, categoryIdValue })

    // Validate media if present (can be base64 or links)
    if (media && !Array.isArray(media)) {
      return res.status(400).json({
        success: false,
        message: 'Media must be an array',
        received: { media },
      })
    }

    // Map frontend field names to database column names
    // Store title and content separately in the content field as JSON
    const postContent = JSON.stringify({
      title: title,
      content: content,
    })

    // Use proper SQL query with correct column names
    const insertQuery = `INSERT INTO ${Master.post.tablename} (post_mu_id, post_mc_id, post_content, post_status, post_created_at) VALUES (?, ?, ?, ?, ?)`
    const queryParams = [user_id, categoryIdValue, postContent, status, new Date()]

    console.log('Insert query:', insertQuery)
    console.log('Query params:', queryParams)

    const result = await Query(insertQuery, queryParams, [Master.post.prefix_])
    const postId = result.insertId

    console.log('Insert result:', result)

    // Insert media items into post_media table
    if (media && media.length > 0 && postId) {
      const mediaInsertQuery = `INSERT INTO ${Master.post_media.tablename} (pm_post_id, pm_media, pm_sort) VALUES (?, ?, ?)`

      for (let i = 0; i < media.length; i++) {
        const mediaItem = media[i]
        // mediaItem can be a URL or base64 string
        await Query(
          mediaInsertQuery,
          [postId, mediaItem, i],
          [Master.post_media.prefix_],
        )
      }

      console.log(`Inserted ${media.length} media items for post ${postId}`)
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: postId,
        title,
        content,
        media,
        category_name: await getCategoryName(categoryIdValue),
        status,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Create post error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, user_id } = req.query

    // Use direct SQL with JOIN to get category info
    const selectQuery = `SELECT
      p.post_id AS id,
      p.post_content AS content,
      p.post_status AS status,
      p.post_created_at AS created_at,
      p.post_mc_id AS category_id,
      mc.mc_name AS category_name
    FROM ${Master.post.tablename} p
    LEFT JOIN ${Master.master_category.tablename} mc ON p.post_mc_id = mc.mc_id
    WHERE p.post_status = 1
    ORDER BY p.post_created_at DESC
    LIMIT ? OFFSET ?`

    const rawPosts = await Query(
      selectQuery,
      [parseInt(limit), (page - 1) * limit],
      [Master.post.prefix_, Master.master_category.prefix_],
    )

    // Parse JSON content and format posts for frontend
    const posts = await Promise.all(
      rawPosts.map(async (post) => {
        let parsedContent = { title: '', content: '' }

        try {
          parsedContent = JSON.parse(post.content)
        } catch (e) {
          // Handle legacy format where content was plain text
          parsedContent = { title: 'Untitled', content: post.content }
        }

        // Fetch media from post_media table
        const mediaQuery = `SELECT pm_media FROM ${Master.post_media.tablename} WHERE pm_post_id = ? ORDER BY pm_sort ASC`
        const mediaRows = await Query(
          mediaQuery,
          [post.id],
          [Master.post_media.prefix_],
        )
        const media = mediaRows
          .map((row) => row.media)
          .filter((item) => item && typeof item === 'string')

        return {
          id: post.id,
          title: parsedContent.title || 'Untitled',
          content: parsedContent.content || '',
          media: media,
          category_name: post.category_name,
          status: post.status,
          created_at: post.created_at,
        }
      }),
    )

    res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user?.id // For checking if user liked the post

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      })
    }

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post identifier',
      })
    }

    const postId = Number(id)

    const selectQuery = `SELECT
      p.post_id AS id,
      p.post_content AS content,
      p.post_status AS status,
      p.post_created_at AS created_at,
      p.post_mc_id AS category_id,
      mc.mc_name AS category_name
    FROM ${Master.post.tablename} p
    LEFT JOIN ${Master.master_category.tablename} mc ON p.post_mc_id = mc.mc_id
    WHERE p.post_id = ?`

    const posts = await Query(
      selectQuery,
      [postId],
      [Master.post.prefix_, Master.master_user.prefix_],
    )

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const post = posts[0]

    // Parse JSON content
    let parsedContent = { title: '', content: '' }
    try {
      parsedContent = JSON.parse(post.content)
    } catch (e) {
      parsedContent = { title: 'Untitled', content: post.content }
    }

    // Fetch media from post_media table
    const mediaQuery = `SELECT pm_media FROM ${Master.post_media.tablename} WHERE pm_post_id = ? ORDER BY pm_sort ASC`
    const mediaRows = await Query(mediaQuery, [postId], [Master.post_media.prefix_])
    const media = mediaRows
      .map((row) => row.media)
      .filter((item) => item && typeof item === 'string')

    // Fetch comments with replies
    const commentsQuery = `SELECT
      pc.pc_id AS id,
      pc.pc_post_id AS post_id,
      pc.pc_mu_id AS commenter_id,
      pc.pc_parent_id AS parent_id,
      pc.pc_comment AS text,
      pc.pc_created_at AS created_at,
      mu.mu_fullname AS author,
      mu.mu_email AS email
    FROM ${Master.post_comment.tablename} pc
    LEFT JOIN ${Master.master_user.tablename} mu ON pc.pc_mu_id = mu.mu_id
    WHERE pc.pc_post_id = ?
    ORDER BY pc.pc_created_at ASC`

    const comments = await Query(
      commentsQuery,
      [postId],
      [Master.post_comment.prefix_, Master.master_user.prefix_],
    )

    // Build comment tree with replies
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
        } else {
          rootComments.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    // Get like count and user like status
    const likeQuery = `SELECT COUNT(*) as count FROM ${Master.post_like.tablename} WHERE pl_post_id = ?`
    const likeResult = await Query(likeQuery, [postId], [Master.post_like.prefix_])
    const likes = likeResult[0]?.count || 0

    let userLiked = false
    if (userId) {
      const userLikeQuery = `SELECT pl_id FROM ${Master.post_like.tablename} WHERE pl_post_id = ? AND pl_mu_id = ?`
      const userLikeResult = await Query(
        userLikeQuery,
        [postId, userId],
        [Master.post_like.prefix_],
      )
      userLiked = userLikeResult.length > 0
    }

    const formattedPost = {
      id: post.id,
      title: parsedContent.title || 'Untitled',
      content: parsedContent.content || '',
      media: media,
      category_name: post.category_name,
      status: post.status,
      created_at: post.created_at,
      comments: rootComments,
      likes: parseInt(likes),
      userLiked: userLiked,
      commentCount:
        rootComments.length +
        rootComments.reduce((sum, c) => sum + c.replies.length, 0),
      shares: 0,
    }

    res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: formattedPost,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get post by ID error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Public feed endpoint with engagement stats
const getPublicFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // Get posts with category info
    const selectQuery = `SELECT
      p.post_id AS id,
      p.post_content AS content,
      p.post_status AS status,
      p.post_created_at AS created_at,
      p.post_mc_id AS category_id,
      mc.mc_name AS category_name
    FROM ${Master.post.tablename} p
    LEFT JOIN ${Master.master_category.tablename} mc ON p.post_mc_id = mc.mc_id
    WHERE p.post_status = 1
    ORDER BY p.post_created_at DESC
    LIMIT ? OFFSET ?`

    const rawPosts = await Query(
      selectQuery,
      [parseInt(limit), (page - 1) * limit],
      [Master.post.prefix_, Master.master_category.prefix_],
    )

    // Format posts with media and engagement stats
    const posts = await Promise.all(
      rawPosts.map(async (post) => {
        let parsedContent = { title: '', content: '' }
        try {
          parsedContent = JSON.parse(post.content)
        } catch (e) {
          parsedContent = { title: 'Untitled', content: post.content }
        }

        // Fetch media
        const mediaQuery = `SELECT pm_media FROM ${Master.post_media.tablename} WHERE pm_post_id = ? ORDER BY pm_sort ASC`
        const mediaRows = await Query(
          mediaQuery,
          [post.id],
          [Master.post_media.prefix_],
        )
        const media = mediaRows
          .map((row) => row.media)
          .filter((item) => item && typeof item === 'string')

        // Get like count
        const likeQuery = `SELECT COUNT(*) as count FROM ${Master.post_like.tablename} WHERE pl_post_id = ?`
        const likeResult = await Query(
          likeQuery,
          [post.id],
          [Master.post_like.prefix_],
        )
        const likes = likeResult[0]?.count || 0

        // Get comment count
        const commentQuery = `SELECT COUNT(*) as count FROM ${Master.post_comment.tablename} WHERE pc_post_id = ?`
        const commentResult = await Query(
          commentQuery,
          [post.id],
          [Master.post_comment.prefix_],
        )
        const comments = commentResult[0]?.count || 0

        return {
          id: post.id,
          title: parsedContent.title || 'Untitled',
          content: parsedContent.content || '',
          media: media,
          category_name: post.category_name,
          likes: parseInt(likes),
          comments: parseInt(comments),
          shares: 0,
          status: post.status,
          created_at: post.created_at,
        }
      }),
    )

    res.status(200).json({
      success: true,
      message: 'Feed retrieved successfully',
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get public feed error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching feed',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const updatePost = async (req, res, next) => {
  try {
    // Validate request body structure
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body format',
      })
    }

    const { id } = req.params
    const { title, content, media = [], status, category_id } = req.body
    const user_id = req.user?.id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      })
    }

    // Validate media if present
    if (media && !Array.isArray(media)) {
      return res.status(400).json({
        success: false,
        message: 'Media must be an array',
        received: { media },
      })
    }

    // Handle category_id - convert empty string to null
    const categoryIdValue = category_id && category_id !== '' ? category_id : null
    console.log('Update Category ID handling:', { category_id, categoryIdValue })

    // Build update data with proper field mapping
    const updateData = {
      post_mc_id: categoryIdValue,
      post_content: JSON.stringify({
        title: title,
        content: content,
      }),
      post_status: status !== undefined ? status : 1,
      post_updated_at: new Date(),
    }

    // Build update query dynamically
    const setClause = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ')
    const values = Object.values(updateData)
    values.push(id)

    const updateQuery = `UPDATE ${Master.post.tablename} SET ${setClause} WHERE post_id = ?`

    console.log('Update query:', updateQuery)
    console.log('Update values:', values)

    await Query(updateQuery, values, [Master.post.prefix_])

    // Update media in post_media table
    if (media && Array.isArray(media)) {
      // Delete existing media for this post
      const deleteMediaQuery = `DELETE FROM ${Master.post_media.tablename} WHERE pm_post_id = ?`
      await Query(deleteMediaQuery, [id], [Master.post_media.prefix_])

      // Insert new media items
      if (media.length > 0) {
        const mediaInsertQuery = `INSERT INTO ${Master.post_media.tablename} (pm_post_id, pm_media, pm_sort) VALUES (?, ?, ?)`

        for (let i = 0; i < media.length; i++) {
          const mediaItem = media[i]
          await Query(
            mediaInsertQuery,
            [id, mediaItem, i],
            [Master.post_media.prefix_],
          )
        }

        console.log(
          `Updated media: deleted old, inserted ${media.length} new items for post ${id}`,
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Update post error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while updating post',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const user_id = req.user?.id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      })
    }

    // Check if post exists
    const checkQuery = sql
      .select([{ col: Master.post.selectOptionColumns.id, as: 'id' }])
      .from(Master.post.tablename)
      .where(`${Master.post.selectOptionColumns.id} = ?`)
      .build()

    const posts = await Query(checkQuery, [id], [Master.post.prefix_])

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const deleteQuery = `DELETE FROM ${Master.post.tablename} WHERE ${Master.post.selectOptionColumns.id} = ?`
    await Query(deleteQuery, [id], [Master.post.prefix_])

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPublicFeed,
}
