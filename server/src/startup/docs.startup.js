const { serve, setup } = require('swagger-ui-express')
const SwaggerParser = require('@apidevtools/swagger-parser')
const path = require('path')
const { logger } = require('../util/logger.util')
require('dotenv').config()

const initDocs = async (app) => {
  try {
    const mainYamlPath = path.resolve(__dirname, '../docs/swagger.docs.yaml')

    const bundledSpecs = await SwaggerParser.bundle(mainYamlPath)

    const serverUrl = process.env._SERVER_FULL_URL && process.env._SERVER_FULL_URL.startsWith('http')
      ? process.env._SERVER_FULL_URL
      : (process.env._SERVER_URL || '')
    const serverPort = process.env._SERVER_PORT || ''
    bundledSpecs.servers = [
      {
        url: serverUrl.startsWith('http')
          ? serverUrl
          : `http://${serverUrl}:${serverPort}`,
        description: 'Main API Server',
      },
    ]

    app.use(
      '/api-docs',
      serve,
      setup(bundledSpecs, {
        swaggerOptions: {
          withCredentials: true,
        },
      }),
    )

    const docsUrl = serverUrl.startsWith('http') 
      ? `${serverUrl}/api-docs` 
      : `http://${serverUrl}:${serverPort}/api-docs`
    logger.info(
      `✅ Swagger docs bundled and serving at: ${docsUrl}`,
    )
  } catch (err) {
    logger.error('❌ Swagger bundling error:', err)
  }
}

module.exports = { initDocs }
