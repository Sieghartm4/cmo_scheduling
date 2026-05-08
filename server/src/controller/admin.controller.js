const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Query } = require('../database/util/queries.util');
const { Master } = require('../database/model/Master');
const { SQLQueryBuilder } = require('../util/helper.util');
const sql = new SQLQueryBuilder();

require('dotenv').config();

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query for admin user specifically
    const query = sql.select([
      { col: Master.master_user.selectOptionColumns.id, as: 'id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      { col: Master.master_user.selectOptionColumns.password, as: 'password' },
      { col: Master.master_user.selectOptionColumns.role, as: 'role' },
      { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
      { col: Master.master_user.selectOptionColumns.status, as: 'status' }
    ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.email} = ? AND ${Master.master_user.selectOptionColumns.role} = ?`)
      .build();

    const users = await Query(query, [email, 'admin'], [Master.master_user.prefix_]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const admin = users[0];

    if (admin.status !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Create admin-specific token with different claims
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin',
        sessionType: 'admin',
        permissions: ['manage_appointments', 'manage_users', 'manage_system']
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...adminWithoutPassword } = admin;

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminWithoutPassword,
        token,
        sessionType: 'admin'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during admin login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    // Verify user is still admin
    const query = sql.select([
      { col: Master.master_user.selectOptionColumns.id, as: 'id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      { col: Master.master_user.selectOptionColumns.role, as: 'role' },
      { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
      { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      { col: Master.master_user.selectOptionColumns.created_at, as: 'created_at' }
    ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.id} = ? AND ${Master.master_user.selectOptionColumns.role} = ?`)
      .build();

    const admins = await Query(query, [adminId, 'admin'], [Master.master_user.prefix_]);

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        ...admins[0],
        sessionType: 'admin'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching admin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
};
