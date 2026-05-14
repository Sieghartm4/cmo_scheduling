const {
  checkConnection,
  SelectAll,
  SelectWithCondition,
  Insert,
  Delete,
  Query,
} = require('../database/util/queries.util')
const { DecryptString, CreateHashPassword } = require('../util/cryptography.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const sql = new SQLQueryBuilder()

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.id, as: 'id' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
        { col: Master.master_user.selectOptionColumns.role, as: 'role' },
        { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      ])
      .from(Master.master_user.tablename)
      .build()

    let users = await Query(
      query,
      [],
      [Master.master_user.prefix_, Master.master_access.prefix_],
    )

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    const query = `SELECT ${Master.master_user.prefix_}id AS id, ${Master.master_user.prefix_}fullname AS fullname, ${Master.master_user.prefix_}email AS email, ${Master.master_user.prefix_}profile AS profile, ${Master.master_user.prefix_}status AS status, ${Master.master_user.prefix_}created_at AS created_at FROM ${Master.master_user.tablename} WHERE ${Master.master_user.prefix_}id = ?`

    const user = await Query(query, [id])

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in getUserById:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message,
    })
  }
}

// Create new user
const createUser = async (req, res, next) => {
  try {
    const { mu_fullname, mu_email, mu_password, mu_role, mu_profile } = req.body

    // Validate required fields
    if (!mu_fullname || !mu_password || !mu_role) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      })
    }

    // Check if email already exists (if provided)
    if (mu_email) {
      const checkQuery = `SELECT ${Master.master_user.prefix_}email FROM ${Master.master_user.tablename} WHERE ${Master.master_user.prefix_}email = ?`
      const existing = await Query(checkQuery, [mu_email])

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        })
      }
    }

    // Hash password
    const hashedPassword = await new Promise((resolve, reject) => {
      CreateHashPassword(mu_password, (err, hash) => {
        if (err) reject(err)
        resolve(hash)
      })
    })

    const query = `INSERT INTO ${Master.master_user.tablename}(${Master.master_user.selectOptionColumns.fullname}, ${Master.master_user.selectOptionColumns.email}, ${Master.master_user.selectOptionColumns.password}, ${Master.master_user.selectOptionColumns.role}, ${Master.master_user.selectOptionColumns.profile}, ${Master.master_user.selectOptionColumns.status}) VALUES (?, ?, ?, ?, ?, ?)`

    const result = await Insert(query, [
      mu_fullname,
      mu_email || null,
      hashedPassword,
      mu_role,
      mu_profile || null,
      'active',
    ])

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { insertId: result.insertId },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in createUser:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    })
  }
}

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { mu_fullname, mu_email, mu_role, mu_profile, mu_status } = req.body

    // Check if user exists
    const checkQuery = `SELECT ${Master.master_user.prefix_}id FROM ${Master.master_user.tablename} WHERE ${Master.master_user.prefix_}id = ?`
    const existing = await Query(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if email already exists for other users (if provided)
    if (mu_email) {
      const emailCheckQuery = `SELECT ${Master.master_user.prefix_}id FROM ${Master.master_user.tablename} WHERE ${Master.master_user.prefix_}email = ? AND ${Master.master_user.prefix_}id != ?`
      const emailExisting = await Query(emailCheckQuery, [mu_email, id])

      if (emailExisting.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        })
      }
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (mu_fullname !== undefined) {
      updateFields.push(`${Master.master_user.prefix_}fullname = ?`)
      updateValues.push(mu_fullname)
    }

    if (mu_email !== undefined) {
      updateFields.push(`${Master.master_user.prefix_}email = ?`)
      updateValues.push(mu_email || null)
    }

    if (mu_role !== undefined) {
      updateFields.push(`${Master.master_user.prefix_}role = ?`)
      updateValues.push(mu_role)
    }

    if (mu_profile !== undefined) {
      updateFields.push(`${Master.master_user.prefix_}profile = ?`)
      updateValues.push(mu_profile || null)
    }

    if (mu_status !== undefined) {
      updateFields.push(`${Master.master_user.prefix_}status = ?`)
      updateValues.push(mu_status)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
    }

    updateValues.push(id) // Add id for WHERE clause

    const query = `UPDATE ${Master.master_user.tablename}
      SET ${updateFields.join(', ')}
      WHERE ${Master.master_user.prefix_}id = ?`

    await Query(query, updateValues)

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in updateUser:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    })
  }
}

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if user exists
    const checkQuery = `SELECT mu_id FROM master_user WHERE mu_id = ?`
    const existing = await SelectWithCondition(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user has appointments
    const appointmentCheckQuery = `SELECT app_id FROM appointment WHERE app_mu_id = ?`
    const appointments = await SelectWithCondition(appointmentCheckQuery, [id])

    if (appointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with existing appointments',
      })
    }

    const query = `DELETE FROM master_user WHERE mu_id = ?`
    await Delete(query, [id])

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in deleteUser:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    })
  }
}

// Update user status
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { mu_status } = req.body

    if (mu_status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      })
    }

    // Check if user exists
    const checkQuery = `SELECT ${Master.master_user.prefix_}id FROM ${Master.master_user.tablename} WHERE ${Master.master_user.prefix_}id = ?`
    const existing = await Query(checkQuery, [id])

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const query = `UPDATE ${Master.master_user.tablename}
      SET ${Master.master_user.prefix_}status = ?
      WHERE ${Master.master_user.prefix_}id = ?`

    await Query(query, [mu_status, id])

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in updateUserStatus:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
}
