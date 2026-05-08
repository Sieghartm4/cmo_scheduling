const { healthRouter } = require('../routes/health.routes')
const { usersRouter } = require('../routes/users.routes')
const { credentialsRouter } = require('../routes/credentials.routes')
const { authRouter } = require('../routes/auth.routes')
const { adminRouter } = require('../routes/admin.routes')
const { dashboardRouter } = require('../routes/dashboard.routes')
const { accessRouter } = require('../routes/access.routes')
const { routeAccessRouter } = require('../routes/route_access.routes')

const initRoutes = (app) => {
  app.use('/credentials', credentialsRouter)
  app.use('/health', healthRouter)
  app.use('/auth', authRouter)
  app.use('/admin', adminRouter)
  app.use('/dashboard', dashboardRouter)
  app.use('/users', usersRouter)
  app.use('/access', accessRouter)
  app.use('/route_access', routeAccessRouter)
}

module.exports = { initRoutes }
