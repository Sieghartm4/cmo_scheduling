const { checkConnection, SelectAll, SelectWithCondition, Insert, Update, Delete, Query } = require('../database/util/queries.util');
const { DecryptString, CreateHashPassword } = require('../util/cryptography.util');

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const query = `SELECT mu_id, mu_fullname, mu_email, mu_role, mu_profile, mu_status, mu_created_at FROM master_user ORDER BY mu_created_at DESC`;
    
    const users = await Query(query);
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT mu_id, mu_fullname, mu_email, mu_role, mu_profile, mu_status, mu_created_at
      FROM master_user 
      WHERE mu_id = ?
    `;
    
    const user = await SelectWithCondition(query, [id]);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res, next) => {
  try {
    const {
      mu_fullname,
      mu_email,
      mu_password,
      mu_role,
      mu_profile
    } = req.body;

    // Validate required fields
    if (!mu_fullname || !mu_password || !mu_role) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Check if email already exists (if provided)
    if (mu_email) {
      const checkQuery = `SELECT mu_email FROM master_user WHERE mu_email = ?`;
      const existing = await SelectWithCondition(checkQuery, [mu_email]);
      
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Hash password
    const hashedPassword = await CreateHashPassword(mu_password);

    const query = `
      INSERT INTO master_user (mu_fullname, mu_email, mu_password, mu_role, mu_profile)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await Insert(query, [mu_fullname, mu_email || null, hashedPassword, mu_role, mu_profile || null]);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { insertId: result.insertId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      mu_fullname,
      mu_email,
      mu_password,
      mu_role,
      mu_profile,
      mu_status
    } = req.body;

    // Check if user exists
    const checkQuery = `SELECT mu_id FROM master_user WHERE mu_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists for other users (if provided)
    if (mu_email) {
      const emailCheckQuery = `SELECT mu_id FROM master_user WHERE mu_email = ? AND mu_id != ?`;
      const emailExisting = await SelectWithCondition(emailCheckQuery, [mu_email, id]);
      
      if (emailExisting.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    let query = `
      UPDATE master_user 
      SET mu_fullname = ?, mu_email = ?, mu_role = ?, mu_profile = ?, mu_status = ?
    `;
    let params = [mu_fullname, mu_email || null, mu_role, mu_profile || null, mu_status || 1];

    // Add password to update if provided
    if (mu_password) {
      const hashedPassword = await CreateHashPassword(mu_password);
      query += `, mu_password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE mu_id = ?`;
    params.push(id);
    
    await Update(query, params);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const checkQuery = `SELECT mu_id FROM master_user WHERE mu_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has appointments
    const appointmentCheckQuery = `SELECT app_id FROM appointment WHERE app_mu_id = ?`;
    const appointments = await SelectWithCondition(appointmentCheckQuery, [id]);
    
    if (appointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with existing appointments'
      });
    }

    const query = `DELETE FROM master_user WHERE mu_id = ?`;
    await Delete(query, [id]);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mu_status } = req.body;

    if (mu_status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if user exists
    const checkQuery = `SELECT mu_id FROM master_user WHERE mu_id = ?`;
    const existing = await SelectWithCondition(checkQuery, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = `UPDATE master_user SET mu_status = ? WHERE mu_id = ?`;
    await Update(query, [mu_status, id]);
    
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
};
