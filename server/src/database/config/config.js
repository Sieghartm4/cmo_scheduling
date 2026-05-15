require('dotenv').config()
const { DecryptString, EncryptString } = require('../../util/cryptography.util')

console.log('DecryptString', DecryptString('bb6d234bfea5cb8eb7981bce76e5c9c6'))
module.exports = {
  development: {
    username: process.env._USER_ADMIN,
    password: DecryptString(process.env._PASSWORD_ADMIN),
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    mongoUrl: process.env._MONGODB_URL,
    sessionCookieName: process.env._SESSION_COLLECTION,
    sessionSecret: process.env._SESSION_SECRET,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
  test: {
    username: process.env._USER_ADMIN,
    password: DecryptString(process.env._PASSWORD_ADMIN),
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    mongoUrl: process.env._MONGODB_URL,
    sessionCookieName: process.env._SESSION_COLLECTION,
    sessionSecret: process.env._SESSION_SECRET,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
  production: {
    username: process.env._USER_ADMIN,
    password: DecryptString(process.env._PASSWORD_ADMIN),
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    mongoUrl: process.env._MONGODB_URL,
    sessionCookieName: process.env._SESSION_COLLECTION,
    sessionSecret: process.env._SESSION_SECRET,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
}
