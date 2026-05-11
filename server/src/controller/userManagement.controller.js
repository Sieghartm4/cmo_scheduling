const { checkConnection, SelectAll, SelectWithCondition, Insert, Update, Delete, Query } = require('../database/util/queries.util');
const { DecryptString, CreateHashPassword } = require('../util/cryptography.util');
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()

// Get all users
const getUsers = async (req, res, next) => {
  try {

    const query = sql.select([
      { col: Master.master_user.selectOptionColumns.id, as: 'id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      { col: Master.master_user.selectOptionColumns.role, as: 'role' },
      { col: Master.master_user.selectOptionColumns.status, as: 'status' }
    ])
      .from(Master.master_user.tablename)
      .build();

    let users = await Query(query, [], [Master.master_user.prefix_, Master.master_access.prefix_]);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = sql.select([
      { col: Master.master_user.selectOptionColumns.id, as: 'id' },
      { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
      { col: Master.master_user.selectOptionColumns.email, as: 'email' },
      { col: Master.master_access.selectOptionColumns.access_name, as: 'role' },
      { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
      { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      { col: Master.master_user.selectOptionColumns.created_at, as: 'created_at' }
    ])
      .from(Master.master_user.tablename)
      .where(Master.master_user.selectOptionColumns.id, '=', id)
      .build();
    
    const user = await Query(query, [], [Master.master_user.prefix_, Master.master_access.prefix_]);
    
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
      const checkQuery = sql.select([
          { col: Master.master_user.selectOptionColumns.email, as: 'mu_email' }
        ])
          .from(Master.master_user.tablename)
          .where(Master.master_user.selectOptionColumns.email, '=', mu_email)
          .build();
      const existing = await Query(checkQuery, [], [Master.master_user.prefix_]);
      
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Hash password
    const hashedPassword = await CreateHashPassword(mu_password);

    const query = sql.insert(Master.master_user.tablename, {
        columns: Master.master_user.insertColumns,
        prefix: Master.master_user.prefix_,
        isTransaction: false
      })
        .build();
    
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
    const checkQuery = sql.select([
        { col: Master.master_user.selectOptionColumns.id, as: 'mu_id' }
      ])
        .from(Master.master_user.tablename)
        .where(Master.master_user.selectOptionColumns.id, '=', id)
        .build();
    const existing = await Query(checkQuery, [id], [Master.master_user.prefix_]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists for other users (if provided)
    if (mu_email) {
      const emailCheckQuery = sql.select([
          { col: Master.master_user.selectOptionColumns.id, as: 'mu_id' }
        ])
          .from(Master.master_user.tablename)
          .where(Master.master_user.selectOptionColumns.email, '=', mu_email)
          .andWhere(Master.master_user.selectOptionColumns.id, '!=', id)
          .build();
      const emailExisting = await Query(emailCheckQuery, [], [Master.master_user.prefix_]);
      
      if (emailExisting.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    let updateFields = {
        [Master.master_user.updateOptionColumns.fullname]: mu_fullname,
        [Master.master_user.updateOptionColumns.email]: mu_email || null,
        [Master.master_user.updateOptionColumns.role]: mu_role,
        [Master.master_user.updateOptionColumns.profile]: mu_profile || null,
        [Master.master_user.updateOptionColumns.status]: mu_status || 'active'
      };

    // Add password to update if provided
    if (mu_password) {
      const hashedPassword = await CreateHashPassword(mu_password);
      updateFields[Master.master_user.updateOptionColumns.password] = hashedPassword;
    }

    const query = sql.update(Master.master_user.tablename)
      .set(updateFields)
      .where(`${Master.master_user.updateOptionColumns.id} = ?`)
      .build();
    
    await Update(query, [id], [Master.master_user.prefix_]);
    
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
    const checkQuery = sql.select([
        { col: Master.master_user.selectOptionColumns.id, as: 'mu_id' }
      ])
        .from(Master.master_user.tablename)
        .where(Master.master_user.selectOptionColumns.id, '=', id)
        .build();
    const existing = await Query(checkQuery, [id], [Master.master_user.prefix_]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = sql.update(Master.master_user.tablename)
      .set({
        [Master.master_user.updateOptionColumns.status]: mu_status
      })
      .where(`${Master.master_user.updateOptionColumns.id} = ?`)
      .build();
    
    await Update(query, [id], [Master.master_user.prefix_]);
    
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
