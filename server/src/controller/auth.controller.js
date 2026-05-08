const jwt = require('jsonwebtoken');
const { Query } = require('../database/util/queries.util');
const { Master } = require('../database/model/Master');
const { SQLQueryBuilder } = require('../util/helper.util');
const { CheckPassword, DecryptString } = require('../util/cryptography.util');
const sql = new SQLQueryBuilder();

require('dotenv').config();

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

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
      .where(`${Master.master_user.selectOptionColumns.email} = ?`)
      .build();

    const users = await Query(query, [email], [Master.master_user.prefix_]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Decrypt stored password and compare with input
    let isPasswordValid = false;
    try {
      const decryptedPassword = DecryptString(user.password);
      isPasswordValid = password === decryptedPassword;
    } catch (error) {
      console.error('Password decryption error:', error);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

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
      .where(`${Master.master_user.selectOptionColumns.id} = ?`)
      .build();

    const users = await Query(query, [userId], [Master.master_user.prefix_]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: users[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

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
      .where(`${Master.master_user.selectOptionColumns.email} = ?`)
      .build();

    const users = await Query(query, [email], [Master.master_user.prefix_]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Decrypt stored password and compare with input
    let isPasswordValid = false;
    try {
      const decryptedPassword = DecryptString(user.password);
      isPasswordValid = password === decryptedPassword;
    } catch (error) {
      console.error('Password decryption error:', error);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        type: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  login,
  userLogin,
  getProfile,
};
