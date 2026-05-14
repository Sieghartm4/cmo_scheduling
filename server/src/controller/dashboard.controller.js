const { Query } = require('../database/util/queries.util')
const { Master } = require('../database/model/Master')

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsersQuery = `SELECT COUNT(*) AS total_users FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.status} = 'active'`
    const totalAppointmentsQuery = `SELECT COUNT(*) AS total_appointments FROM ${Master.appointment.tablename}`
    const pendingAppointmentsQuery = `SELECT COUNT(*) AS pending_appointments FROM ${Master.appointment.tablename} WHERE ${Master.appointment.selectOptionColumns.status} = 'pending'`
    const totalPostsQuery = `SELECT COUNT(*) AS total_posts FROM ${Master.post.tablename} WHERE ${Master.post.selectOptionColumns.status} = 'published'`
    const totalCommentsQuery = `SELECT COUNT(*) AS total_comments FROM ${Master.post_comment.tablename}`
    const totalLikesQuery = `SELECT COUNT(*) AS total_likes FROM ${Master.post_like.tablename}`

    const [
      usersResult,
      appointmentsResult,
      pendingAppointmentsResult,
      postsResult,
      commentsResult,
      likesResult,
    ] = await Promise.all([
      Query(totalUsersQuery),
      Query(totalAppointmentsQuery),
      Query(pendingAppointmentsQuery),
      Query(totalPostsQuery),
      Query(totalCommentsQuery),
      Query(totalLikesQuery),
    ])

    const stats = {
      total_users: usersResult[0]?.total_users || 0,
      total_appointments: appointmentsResult[0]?.total_appointments || 0,
      pending_appointments: pendingAppointmentsResult[0]?.pending_appointments || 0,
      total_posts: postsResult[0]?.total_posts || 0,
      total_comments: commentsResult[0]?.total_comments || 0,
      total_likes: likesResult[0]?.total_likes || 0,
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getRecentAppointments = async (req, res, next) => {
  try {
    const query = `
      SELECT
        a.${Master.appointment.selectOptionColumns.id} AS id,
        a.${Master.appointment.selectOptionColumns.date} AS date,
        a.${Master.appointment.selectOptionColumns.start_time} AS start_time,
        a.${Master.appointment.selectOptionColumns.end_time} AS end_time,
        a.${Master.appointment.selectOptionColumns.reason} AS reason,
        a.${Master.appointment.selectOptionColumns.status} AS status,
        a.${Master.appointment.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS user_fullname
      FROM ${Master.appointment.tablename} a
      LEFT JOIN ${Master.master_user.tablename} u ON a.${Master.appointment.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      ORDER BY a.${Master.appointment.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const appointments = await Query(query)

    res.status(200).json({
      success: true,
      message: 'Recent appointments retrieved successfully',
      data: appointments,
      count: appointments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recent appointments error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent appointments',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getRecentPosts = async (req, res, next) => {
  try {
    const query = `
      SELECT
        p.${Master.post.selectOptionColumns.id} AS id,
        p.${Master.post.selectOptionColumns.content} AS content,
        p.${Master.post.selectOptionColumns.status} AS type,
        p.${Master.post.selectOptionColumns.status} AS status,
        p.${Master.post.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS user_fullname,
        (SELECT COUNT(*) FROM ${Master.post_like.tablename} pl WHERE pl.${Master.post_like.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}) AS likes,
        (SELECT COUNT(*) FROM ${Master.post_comment.tablename} pc WHERE pc.${Master.post_comment.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}) AS comments
      FROM ${Master.post.tablename} p
      LEFT JOIN ${Master.master_user.tablename} u ON p.${Master.post.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      ORDER BY p.${Master.post.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const posts = await Query(query)

    res.status(200).json({
      success: true,
      message: 'Recent posts retrieved successfully',
      data: posts,
      count: posts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recent posts error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent posts',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getRecentComments = async (req, res, next) => {
  try {
    const query = `
      SELECT
        c.${Master.post_comment.selectOptionColumns.id} AS id,
        c.${Master.post_comment.selectOptionColumns.comment} AS comment,
        c.${Master.post_comment.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS commenter_name,
        p.${Master.post.selectOptionColumns.id} AS post_id,
        p.${Master.post.selectOptionColumns.content} AS post_content
      FROM ${Master.post_comment.tablename} c
      LEFT JOIN ${Master.master_user.tablename} u ON c.${Master.post_comment.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      LEFT JOIN ${Master.post.tablename} p ON c.${Master.post_comment.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}
      ORDER BY c.${Master.post_comment.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const comments = await Query(query)

    res.status(200).json({
      success: true,
      message: 'Recent comments retrieved successfully',
      data: comments,
      count: comments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recent comments error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent comments',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getRecentLikes = async (req, res, next) => {
  try {
    const query = `
      SELECT
        pl.${Master.post_like.selectOptionColumns.id} AS id,
        pl.${Master.post_like.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS liked_by,
        p.${Master.post.selectOptionColumns.id} AS post_id,
        p.${Master.post.selectOptionColumns.content} AS post_content
      FROM ${Master.post_like.tablename} pl
      LEFT JOIN ${Master.master_user.tablename} u ON pl.${Master.post_like.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      LEFT JOIN ${Master.post.tablename} p ON pl.${Master.post_like.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}
      ORDER BY pl.${Master.post_like.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const likes = await Query(query)

    res.status(200).json({
      success: true,
      message: 'Recent likes retrieved successfully',
      data: likes,
      count: likes.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Recent likes error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recent likes',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getDashboardOverview = async (req, res, next) => {
  try {
    const totalUsersQuery = `SELECT COUNT(*) AS total_users FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.status} = 'active'`
    const totalAppointmentsQuery = `SELECT COUNT(*) AS total_appointments FROM ${Master.appointment.tablename}`
    const pendingAppointmentsQuery = `SELECT COUNT(*) AS pending_appointments FROM ${Master.appointment.tablename} WHERE ${Master.appointment.selectOptionColumns.status} = 'pending'`
    const totalPostsQuery = `SELECT COUNT(*) AS total_posts FROM ${Master.post.tablename} WHERE ${Master.post.selectOptionColumns.status} = 'published'`
    const totalCommentsQuery = `SELECT COUNT(*) AS total_comments FROM ${Master.post_comment.tablename}`
    const totalLikesQuery = `SELECT COUNT(*) AS total_likes FROM ${Master.post_like.tablename}`
    const publishedPostsQuery = `SELECT ${Master.post.selectOptionColumns.status} AS status, COUNT(*) AS count FROM ${Master.post.tablename} GROUP BY ${Master.post.selectOptionColumns.status}`
    const appointmentStatusQuery = `SELECT ${Master.appointment.selectOptionColumns.status} AS status, COUNT(*) AS count FROM ${Master.appointment.tablename} GROUP BY ${Master.appointment.selectOptionColumns.status}`
    const postsActivityQuery = `
      SELECT
        DATE(${Master.post.selectOptionColumns.created_at}) AS date,
        COUNT(*) AS posts
      FROM ${Master.post.tablename}
      WHERE ${Master.post.selectOptionColumns.created_at} >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
      GROUP BY DATE(${Master.post.selectOptionColumns.created_at})
      ORDER BY date ASC
    `
    const commentsActivityQuery = `
      SELECT
        DATE(${Master.post_comment.selectOptionColumns.created_at}) AS date,
        COUNT(*) AS comments
      FROM ${Master.post_comment.tablename}
      WHERE ${Master.post_comment.selectOptionColumns.created_at} >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
      GROUP BY DATE(${Master.post_comment.selectOptionColumns.created_at})
      ORDER BY date ASC
    `
    const likesActivityQuery = `
      SELECT
        DATE(${Master.post_like.selectOptionColumns.created_at}) AS date,
        COUNT(*) AS likes
      FROM ${Master.post_like.tablename}
      WHERE ${Master.post_like.selectOptionColumns.created_at} >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
      GROUP BY DATE(${Master.post_like.selectOptionColumns.created_at})
      ORDER BY date ASC
    `

    const recentAppointmentsQuery = `
      SELECT
        a.${Master.appointment.selectOptionColumns.id} AS id,
        a.${Master.appointment.selectOptionColumns.date} AS date,
        a.${Master.appointment.selectOptionColumns.start_time} AS start_time,
        a.${Master.appointment.selectOptionColumns.reason} AS reason,
        a.${Master.appointment.selectOptionColumns.status} AS status,
        u.${Master.master_user.selectOptionColumns.fullname} AS user_fullname
      FROM ${Master.appointment.tablename} a
      LEFT JOIN ${Master.master_user.tablename} u ON a.${Master.appointment.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      ORDER BY a.${Master.appointment.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const recentPostsQuery = `
      SELECT
        p.${Master.post.selectOptionColumns.id} AS id,
        p.${Master.post.selectOptionColumns.content} AS content,
        p.${Master.post.selectOptionColumns.status} AS status,
        p.${Master.post.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS user_fullname,
        (SELECT COUNT(*) FROM ${Master.post_like.tablename} pl WHERE pl.${Master.post_like.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}) AS likes,
        (SELECT COUNT(*) FROM ${Master.post_comment.tablename} pc WHERE pc.${Master.post_comment.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}) AS comments
      FROM ${Master.post.tablename} p
      LEFT JOIN ${Master.master_user.tablename} u ON p.${Master.post.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      ORDER BY p.${Master.post.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const recentCommentsQuery = `
      SELECT
        c.${Master.post_comment.selectOptionColumns.id} AS id,
        c.${Master.post_comment.selectOptionColumns.comment} AS comment,
        c.${Master.post_comment.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS commenter_name,
        p.${Master.post.selectOptionColumns.id} AS post_id,
        p.${Master.post.selectOptionColumns.content} AS post_content
      FROM ${Master.post_comment.tablename} c
      LEFT JOIN ${Master.master_user.tablename} u ON c.${Master.post_comment.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      LEFT JOIN ${Master.post.tablename} p ON c.${Master.post_comment.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}
      ORDER BY c.${Master.post_comment.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const recentLikesQuery = `
      SELECT
        pl.${Master.post_like.selectOptionColumns.id} AS id,
        pl.${Master.post_like.selectOptionColumns.created_at} AS created_at,
        u.${Master.master_user.selectOptionColumns.fullname} AS liked_by,
        p.${Master.post.selectOptionColumns.id} AS post_id,
        p.${Master.post.selectOptionColumns.content} AS post_content
      FROM ${Master.post_like.tablename} pl
      LEFT JOIN ${Master.master_user.tablename} u ON pl.${Master.post_like.selectOptionColumns.mu_id} = u.${Master.master_user.selectOptionColumns.id}
      LEFT JOIN ${Master.post.tablename} p ON pl.${Master.post_like.selectOptionColumns.post_id} = p.${Master.post.selectOptionColumns.id}
      ORDER BY pl.${Master.post_like.selectOptionColumns.created_at} DESC
      LIMIT 5
    `

    const [
      usersResult,
      appointmentsResult,
      pendingAppointmentsResult,
      postsResult,
      commentsResult,
      likesResult,
      postStatusCounts,
      appointmentStatusCounts,
      postsActivity,
      commentsActivity,
      likesActivity,
      recentAppointments,
      recentPosts,
      recentComments,
      recentLikes,
    ] = await Promise.all([
      Query(totalUsersQuery),
      Query(totalAppointmentsQuery),
      Query(pendingAppointmentsQuery),
      Query(totalPostsQuery),
      Query(totalCommentsQuery),
      Query(totalLikesQuery),
      Query(publishedPostsQuery),
      Query(appointmentStatusQuery),
      Query(postsActivityQuery),
      Query(commentsActivityQuery),
      Query(likesActivityQuery),
      Query(recentAppointmentsQuery),
      Query(recentPostsQuery),
      Query(recentCommentsQuery),
      Query(recentLikesQuery),
    ])

    const parsePostContent = (value) => {
      if (!value) {
        return { title: 'Untitled', content: '' }
      }

      try {
        const parsed = JSON.parse(value)
        return {
          title: parsed.title || 'Untitled',
          content: parsed.content || '',
        }
      } catch (err) {
        return { title: 'Untitled', content: value }
      }
    }

    const parsedRecentPosts = recentPosts.map((post) => {
      const parsed = parsePostContent(post.content)
      return {
        ...post,
        title: parsed.title,
        content: parsed.content,
      }
    })

    const stats = {
      total_users: usersResult[0]?.total_users || 0,
      total_appointments: appointmentsResult[0]?.total_appointments || 0,
      pending_appointments: pendingAppointmentsResult[0]?.pending_appointments || 0,
      total_posts: postsResult[0]?.total_posts || 0,
      total_comments: commentsResult[0]?.total_comments || 0,
      total_likes: likesResult[0]?.total_likes || 0,
      total_interactions:
        (commentsResult[0]?.total_comments || 0) +
        (likesResult[0]?.total_likes || 0),
      published_posts: postStatusCounts.reduce((acc, item) => {
        return item.status === 'published' ? item.count : acc
      }, 0),
      draft_posts: postStatusCounts.reduce((acc, item) => {
        return item.status !== 'published' ? acc + item.count : acc
      }, 0),
    }

    const activityStats = []
    const activityMap = {}

    postsActivity.forEach((item) => {
      const date = item.date || item.date_created || item.date_created_at
      activityMap[date] = {
        date,
        posts: Number(item.posts || 0),
        comments: 0,
        likes: 0,
      }
    })

    commentsActivity.forEach((item) => {
      const date = item.date || item.date_created || item.date_created_at
      activityMap[date] = {
        ...(activityMap[date] || { date, posts: 0, comments: 0, likes: 0 }),
        comments: Number(item.comments || 0),
      }
    })

    likesActivity.forEach((item) => {
      const date = item.date || item.date_created || item.date_created_at
      activityMap[date] = {
        ...(activityMap[date] || { date, posts: 0, comments: 0, likes: 0 }),
        likes: Number(item.likes || 0),
      }
    })

    Object.keys(activityMap)
      .sort()
      .forEach((date) => {
        activityStats.push(activityMap[date])
      })

    res.status(200).json({
      success: true,
      message: 'Dashboard overview retrieved successfully',
      data: {
        stats,
        appointmentStatusCounts,
        postStatusCounts,
        activityStats,
        recentAppointments,
        recentPosts: parsedRecentPosts,
        recentComments,
        recentLikes,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard overview',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

module.exports = {
  getDashboardStats,
  getRecentAppointments,
  getRecentPosts,
  getRecentComments,
  getRecentLikes,
  getDashboardOverview,
}
