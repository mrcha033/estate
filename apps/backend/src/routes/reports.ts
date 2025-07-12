import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export async function reportsRoutes (fastify: FastifyInstance) {
  fastify.get('/reports', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    // Placeholder for reports data
    return { reports: [] } 
  })
}