import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export async function alertsRoutes (fastify: FastifyInstance) {
  fastify.get('/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    // Placeholder for alerts data
    return { alerts: [] } 
  })
}