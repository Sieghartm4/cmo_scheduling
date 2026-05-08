const { checkConnection, SelectAll, SelectWithCondition, Query } = require('../database/util/queries.util');

// Get admin dashboard statistics
const getAdminStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsersQuery = `SELECT COUNT(*) as total_users FROM master_user`;
    const totalAppointmentsQuery = `SELECT COUNT(*) as total_appointments FROM appointment`;
    const pendingAppointmentsQuery = `SELECT COUNT(*) as pending_appointments FROM appointment WHERE app_status = 'pending'`;
    const approvedAppointmentsQuery = `SELECT COUNT(*) as approved_appointments FROM appointment WHERE app_status = 'approved'`;
    
    const [totalUsers, totalAppointments, pendingAppointments, approvedAppointments] = await Promise.all([
      SelectWithCondition(totalUsersQuery),
      SelectWithCondition(totalAppointmentsQuery),
      SelectWithCondition(pendingAppointmentsQuery),
      SelectWithCondition(approvedAppointmentsQuery)
    ]);

    // Get appointments by status breakdown
    const statusBreakdownQuery = 'SELECT app_status, COUNT(*) as count FROM appointment GROUP BY app_status';
    const statusBreakdown = await Query(statusBreakdownQuery);

    // Get monthly appointment trends (last 6 months)
    const monthlyTrendsQuery = 'SELECT DATE_FORMAT(app_date, "%Y-%m") as month, COUNT(*) as count FROM appointment WHERE app_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(app_date, "%Y-%m") ORDER BY month ASC';
    const monthlyTrends = await Query(monthlyTrendsQuery);

    const stats = {
      total_users: totalUsers[0]?.total_users || 0,
      total_appointments: totalAppointments[0]?.total_appointments || 0,
      pending_appointments: pendingAppointments[0]?.pending_appointments || 0,
      approved_appointments: approvedAppointments[0]?.approved_appointments || 0,
      status_breakdown: statusBreakdown,
      monthly_trends: monthlyTrends
    };
    
    res.status(200).json({
      success: true,
      message: 'Admin stats retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats',
      error: error.message
    });
  }
};

// Get recent users
const getRecentUsers = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = 'SELECT mu_id, mu_fullname, mu_email, mu_role, mu_status, mu_created_at FROM master_user ORDER BY mu_created_at DESC LIMIT ?';
    
    const recentUsers = await SelectWithCondition(query, [parseInt(limit)]);
    
    res.status(200).json({
      success: true,
      message: 'Recent users retrieved successfully',
      data: recentUsers,
      count: recentUsers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getRecentUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent users',
      error: error.message
    });
  }
};

// Get recent appointments
const getRecentAppointments = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = 'SELECT a.*, mu.mu_fullname, mu.mu_email FROM appointment a LEFT JOIN master_user mu ON a.app_mu_id = mu.mu_id ORDER BY a.app_created_at DESC LIMIT ?';
    
    const recentAppointments = await SelectWithCondition(query, [parseInt(limit)]);
    
    res.status(200).json({
      success: true,
      message: 'Recent appointments retrieved successfully',
      data: recentAppointments,
      count: recentAppointments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getRecentAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent appointments',
      error: error.message
    });
  }
};

module.exports = {
  getAdminStats,
  getRecentUsers,
  getRecentAppointments
};
