require('dotenv').config()

const corsOptions = {
  origin: process.env._CORS_ALLOWED_ORIGINS 
    ? process.env._CORS_ALLOWED_ORIGINS.split(',') 
    : [
        `http://${process.env._CLIENT_URL}:${process.env._CLIENT_PORT}`,
        `http://${process.env._SERVER_URL}:${process.env._SERVER_PORT}`,
        `http://localhost:${process.env._SERVER_PORT}`,
        'https://theanxietynurse.com',
        'https://api.theanxietynurse.com',
      ],
  credentials: process.env._CORS_CREDENTIALS === 'true' ? true : true,
  methods: process.env._CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: process.env._CORS_ALLOWED_HEADERS 
    ? process.env._CORS_ALLOWED_HEADERS.split(',') 
    : ['Content-Type', 'Authorization', 'x-api-key', 'x-requested-with'],
}

module.exports = {
  corsOptions,
}
