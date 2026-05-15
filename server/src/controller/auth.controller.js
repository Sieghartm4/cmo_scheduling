const jwt = require('jsonwebtoken')
const { Query, Insert } = require('../database/util/queries.util')
const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../util/helper.util')
const {
  CheckPassword,
  DecryptString,
  CreateHashPassword,
} = require('../util/cryptography.util')
const sql = new SQLQueryBuilder()

require('dotenv').config()

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.id, as: 'id' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
        { col: Master.master_user.selectOptionColumns.password, as: 'password' },
        { col: Master.master_user.selectOptionColumns.role, as: 'role' },
        { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
        { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.email} = ?`)
      .build()

    const users = await Query(query, [email], [Master.master_user.prefix_])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const user = users[0]

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive',
      })
    }

    let isPasswordValid = false
    try {
      const decryptedPassword = DecryptString(user.password)
      isPasswordValid = password === decryptedPassword
    } catch (error) {
      console.error('Password decryption error:', error)
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id

    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.id, as: 'id' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
        { col: Master.master_user.selectOptionColumns.role, as: 'role' },
        { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
        { col: Master.master_user.selectOptionColumns.status, as: 'status' },
        { col: Master.master_user.selectOptionColumns.created_at, as: 'created_at' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.id} = ?`)
      .build()

    const users = await Query(query, [userId], [Master.master_user.prefix_])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: users[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.id, as: 'id' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
        { col: Master.master_user.selectOptionColumns.password, as: 'password' },
        { col: Master.master_user.selectOptionColumns.role, as: 'role' },
        { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
        { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.email} = ?`)
      .build()

    const users = await Query(query, [email], [Master.master_user.prefix_])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const user = users[0]

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive',
      })
    }

    // Decrypt stored password and compare with input
    let isPasswordValid = false
    try {
      const decryptedPassword = DecryptString(user.password)
      isPasswordValid = password === decryptedPassword
    } catch (error) {
      console.error('Password decryption error:', error)
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'user',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('User login error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// User register
const userRegister = async (req, res, next) => {
  try {
    const { mu_fullname, mu_email, mu_password } = req.body

    if (!mu_fullname || !mu_email || !mu_password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      })
    }

    // Check if email already exists
    const checkQuery = `SELECT ${Master.master_user.selectOptionColumns.id} FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.email} = ?`
    const existing = await Query(
      checkQuery,
      [mu_email],
      [Master.master_user.prefix_],
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      })
    }

    // Hash password
    const hashedPassword = await new Promise((resolve, reject) => {
      CreateHashPassword(mu_password, (err, hash) => {
        if (err) reject(err)
        resolve(hash)
      })
    })

    const insertQuery = `INSERT INTO ${Master.master_user.tablename}(
      ${Master.master_user.selectOptionColumns.fullname},
      ${Master.master_user.selectOptionColumns.email},
      ${Master.master_user.selectOptionColumns.password},
      ${Master.master_user.selectOptionColumns.role},
      ${Master.master_user.selectOptionColumns.status}
    ) VALUES (?, ?, ?, ?, ?)`

    const result = await Query(insertQuery, [
      mu_fullname,
      mu_email,
      hashedPassword,
      'user',
      'active',
    ])

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login with your credentials.',
      data: { insertId: result.insertId },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('User registration error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Google Auth - handles both login and register
const googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, picture } = req.body

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required',
      })
    }

    // Check if user exists
    const checkQuery = `SELECT ${Master.master_user.selectOptionColumns.id}, ${Master.master_user.selectOptionColumns.fullname}, ${Master.master_user.selectOptionColumns.role}, ${Master.master_user.selectOptionColumns.profile}, ${Master.master_user.selectOptionColumns.status} FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.email} = ?`
    const existingUsers = await Query(
      checkQuery,
      [email],
      [Master.master_user.prefix_],
    )

    let user
    if (existingUsers.length > 0) {
      user = existingUsers[0]

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive',
        })
      }
    } else {
      // Create new user from Google data
      const defaultPassword = 'GOOGLE_AUTH_' + googleId.substring(0, 12)

      const hashedPassword = await new Promise((resolve, reject) => {
        CreateHashPassword(defaultPassword, (err, hash) => {
          if (err) reject(err)
          resolve(hash)
        })
      })

      const insertQuery = `INSERT INTO ${Master.master_user.tablename}(
        ${Master.master_user.selectOptionColumns.fullname},
        ${Master.master_user.selectOptionColumns.email},
        ${Master.master_user.selectOptionColumns.password},
        ${Master.master_user.selectOptionColumns.role},
        ${Master.master_user.selectOptionColumns.profile},
        ${Master.master_user.selectOptionColumns.status}
      ) VALUES (?, ?, ?, ?, ?, ?)`

      const result = await Query(insertQuery, [
        name || email.split('@')[0],
        email,
        hashedPassword,
        'user',
        picture || null,
        'active',
      ])

      // Fetch the newly created user
      const newUserQuery = `SELECT ${Master.master_user.selectOptionColumns.id}, ${Master.master_user.selectOptionColumns.fullname}, ${Master.master_user.selectOptionColumns.role}, ${Master.master_user.selectOptionColumns.profile} FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.id} = ?`
      const newUsers = await Query(
        newUserQuery,
        [result.insertId],
        [Master.master_user.prefix_],
      )
      user = newUsers[0]
    }

    // Generate token with type: 'user'
    const token = jwt.sign(
      {
        id: user.id,
        email: email,
        role: user.role,
        type: 'user',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    const userWithoutPassword = {
      id: user.id,
      fullname: user.fullname,
      email: email,
      role: user.role,
      profile: user.profile,
    }

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: userWithoutPassword,
        token,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Verify current password
const verifyPassword = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { currentPassword } = req.body

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required',
      })
    }

    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.password, as: 'password' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.id} = ?`)
      .build()

    const users = await Query(query, [userId], [Master.master_user.prefix_])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = users[0]
    let isPasswordValid = false

    try {
      const decryptedPassword = DecryptString(user.password)
      isPasswordValid = currentPassword === decryptedPassword
    } catch (error) {
      console.error('Password decryption error:', error)
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
      })
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Verify password error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying password',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { fullname, email } = req.body

    if (!fullname && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (fullname or email) is required to update',
      })
    }

    // Check if email already exists (if updating email)
    if (email) {
      const checkEmailQuery = `SELECT ${Master.master_user.selectOptionColumns.id} FROM ${Master.master_user.tablename} WHERE ${Master.master_user.selectOptionColumns.email} = ? AND ${Master.master_user.selectOptionColumns.id} != ?`
      const existingUsers = await Query(
        checkEmailQuery,
        [email, userId],
        [Master.master_user.prefix_],
      )

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        })
      }
    }

    const updateFields = []
    const updateValues = []

    if (fullname) {
      updateFields.push(`${Master.master_user.selectOptionColumns.fullname} = ?`)
      updateValues.push(fullname)
    }

    if (email) {
      updateFields.push(`${Master.master_user.selectOptionColumns.email} = ?`)
      updateValues.push(email)
    }

    updateValues.push(userId)

    const updateQuery = `UPDATE ${Master.master_user.tablename} SET ${updateFields.join(', ')} WHERE ${Master.master_user.selectOptionColumns.id} = ?`

    await Query(updateQuery, updateValues, [Master.master_user.prefix_])

    // Fetch updated user
    const selectQuery = sql
      .select([
        { col: Master.master_user.selectOptionColumns.id, as: 'id' },
        { col: Master.master_user.selectOptionColumns.fullname, as: 'fullname' },
        { col: Master.master_user.selectOptionColumns.email, as: 'email' },
        { col: Master.master_user.selectOptionColumns.role, as: 'role' },
        { col: Master.master_user.selectOptionColumns.profile, as: 'profile' },
        { col: Master.master_user.selectOptionColumns.status, as: 'status' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.id} = ?`)
      .build()

    const users = await Query(selectQuery, [userId], [Master.master_user.prefix_])

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword, confirmPassword } = req.body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required',
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      })
    }

    // Get current password from database
    const query = sql
      .select([
        { col: Master.master_user.selectOptionColumns.password, as: 'password' },
      ])
      .from(Master.master_user.tablename)
      .where(`${Master.master_user.selectOptionColumns.id} = ?`)
      .build()

    const users = await Query(query, [userId], [Master.master_user.prefix_])

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const user = users[0]
    let isPasswordValid = false

    try {
      const decryptedPassword = DecryptString(user.password)
      isPasswordValid = currentPassword === decryptedPassword
    } catch (error) {
      console.error('Password decryption error:', error)
      return res.status(500).json({
        success: false,
        message: 'Error verifying current password',
      })
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Encrypt new password
    const { EncryptString } = require('../util/cryptography.util')
    const encryptedPassword = EncryptString(newPassword)

    // Update password
    const updateQuery = `UPDATE ${Master.master_user.tablename} SET ${Master.master_user.selectOptionColumns.password} = ? WHERE ${Master.master_user.selectOptionColumns.id} = ?`
    await Query(
      updateQuery,
      [encryptedPassword, userId],
      [Master.master_user.prefix_],
    )

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    })
  }
}

module.exports = {
  login,
  userLogin,
  getProfile,
  userRegister,
  googleAuth,
  verifyPassword,
  updateProfile,
  changePassword,
}
