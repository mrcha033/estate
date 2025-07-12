import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export async function searchRoutes (fastify: FastifyInstance) {
  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    // Placeholder for area/complex search logic
    return { results: [] } 
  })
}