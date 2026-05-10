'use strict'

const jwt = require('jsonwebtoken')
const { SQLQueryBuilder } = require('../util/helper.util')
const { logger } = require('../util/logger.util')
require('dotenv').config()

const SQL = new SQLQueryBuilder()

const auth = async (req, res, next) => {
  try {
    let token = req.session.jwt

    // console.log(req.headers)
    if (!token && req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Please login.' })
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

    req.context = {
      ...decodedUser,
    }

    return next()
  } catch (err) {
    logger.error('Auth Middleware Error', err)
    return res.status(401).json({ message: 'Authentication failed.' })
  }
}

// Optional auth - allows requests without token but processes token if present
const authOptional = async (req, res, next) => {
  try {
    let token = req.session.jwt

    if (!token && req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1]
    }

    if (token) {
      try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        req.context = {
          ...decodedUser,
        }
      } catch (err) {
        // Invalid token, but we allow the request to continue
        req.context = null
      }
    } else {
      req.context = null
    }

    return next()
  } catch (err) {
    // Continue without auth
    req.context = null
    return next()
  }
}

module.exports = { auth, authOptional }
