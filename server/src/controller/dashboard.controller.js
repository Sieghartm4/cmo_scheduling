const { Query } = require('../database/util/queries.util');
const { Master } = require('../database/model/Master');
const { SQLQueryBuilder } = require('../util/helper.util');
const sql = new SQLQueryBuilder();

const getDashboardStats = async (req, res, next) => {
  try {
    // Get total users count
    const usersQuery = sql.select([
      { col: 'COUNT(*)', as: 'total_users' }
    ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.status} = 1`)
      .build();

    // Get total appointments count
    const appointmentsQuery = sql.select([
      { col: 'COUNT(*)', as: 'total_appointments' }
    ])
      .from(Master.appointment.tablename)
      .build();

    // Get pending appointments count
    const pendingAppointmentsQuery = sql.select([
      { col: 'COUNT(*)', as: 'pending_appointments' }
    ])
      .from(Master.appointment.tablename)
      .where(`${Master.appointment.selectOptionColumns.status} = 'pending'`)
      .build();

    // Get total posts count
    const postsQuery = sql.select([
      { col: 'COUNT(*)', as: 'total_posts' }
    ])
      .from(Master.post.tablename)
      .where(`${Master.post.selectOptionColumns.status} = 'published'`)
      .build();

    // Execute all queries in parallel
    const [usersResult, appointmentsResult, pendingAppointmentsResult, postsResult] = await Promise.all([
      Query(usersQuery, [], [Master.master_user.prefix_]),
      Query(appointmentsQuery, [], [Master.appointment.prefix_]),
      Query(pendingAppointmentsQuery, [], [Master.appointment.prefix_]),
      Query(postsQuery, [], [Master.post.prefix_])
    ]);

    const stats = {
      total_users: usersResult[0]?.total_users || 0,
      total_appointments: appointmentsResult[0]?.total_appointments || 0,
      pending_appointments: pendingAppointmentsResult[0]?.pending_appointments || 0,
      total_posts: postsResult[0]?.total_posts || 0
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getRecentAppointments = async (req, res, next) => {
  try {
    const query = sql.select([
      { col: Master.appointment.selectOptionColumns.id, as: 'id' },
      { col: Master.appointment.selectOptionColumns.mu_id, as: 'mu_id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'user_fullname' },
      { col: Master.appointment.selectOptionColumns.date, as: 'date' },
      { col: Master.appointment.selectOptionColumns.start_time, as: 'start_time' },
      { col: Master.appointment.selectOptionColumns.end_time, as: 'end_time' },
      { col: Master.appointment.selectOptionColumns.reason, as: 'reason' },
      { col: Master.appointment.selectOptionColumns.status, as: 'status' },
      { col: Master.appointment.selectOptionColumns.created_at, as: 'created_at' }
    ])
      .innerJoin(Master.master_user.tablename, Master.appointment.selectOptionColumns.mu_id, Master.master_user.selectOptionColumns.id)
      .from(Master.appointment.tablename)
      .orderBy(Master.appointment.selectOptionColumns.created_at, 'DESC')
      .limit(10)
      .build();

    const appointments = await Query(query, [], [Master.appointment.prefix_, Master.master_user.prefix_]);

    res.status(200).json({
      success: true,
      message: 'Recent appointments retrieved successfully',
      data: appointments,
      count: appointments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recent appointments error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching recent appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getRecentPosts = async (req, res, next) => {
  try {
    const query = sql.select([
      { col: Master.post.selectOptionColumns.id, as: 'id' },
      { col: Master.post.selectOptionColumns.mu_id, as: 'mu_id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'user_fullname' },
      { col: Master.post.selectOptionColumns.content, as: 'content' },
      { col: Master.post.selectOptionColumns.type, as: 'type' },
      { col: Master.post.selectOptionColumns.status, as: 'status' },
      { col: Master.post.selectOptionColumns.created_at, as: 'created_at' }
    ])
      .innerJoin(Master.master_user.tablename, Master.post.selectOptionColumns.mu_id, Master.master_user.selectOptionColumns.id)
      .from(Master.post.tablename)
      .orderBy(Master.post.selectOptionColumns.created_at, 'DESC')
      .limit(10)
      .build();

    const posts = await Query(query, [], [Master.post.prefix_, Master.master_user.prefix_]);

    res.status(200).json({
      success: true,
      message: 'Recent posts retrieved successfully',
      data: posts,
      count: posts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recent posts error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching recent posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentAppointments,
  getRecentPosts,
};
