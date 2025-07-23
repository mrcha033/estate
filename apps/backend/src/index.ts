import Fastify from 'fastify'
import { userRoutes } from './routes/user'
import { insightsRoutes } from './routes/insights'
import { searchRoutes } from './routes/search'
import reportsRoutes from './routes/reports'
import apartmentDataRoutes from './routes/apartment-data'
import { alertsRoutes } from './routes/alerts'
import { adminRoutes } from './routes/admin'
import { preferencesRoutes } from './routes/preferences'
import { subscriptionRoutes } from './routes/subscriptions'
import { dataQARoutes } from './routes/data_qa'
import { authPlugin } from './plugins/auth'
import { metricsPlugin } from './plugins/metrics'
import { loadSecrets } from './lib/secrets'

const fastify = Fastify({
  logger: true
})

fastify.register(authPlugin) // Register authentication plugin first
fastify.register(userRoutes)
fastify.register(insightsRoutes)
fastify.register(searchRoutes)
fastify.register(reportsRoutes)
fastify.register(apartmentDataRoutes)
fastify.register(alertsRoutes)
fastify.register(adminRoutes)
fastify.register(preferencesRoutes)
fastify.register(subscriptionRoutes)
fastify.register(dataQARoutes)
fastify.register(metricsPlugin) // Register metrics plugin

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const start = async () => {
  await loadSecrets();
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()