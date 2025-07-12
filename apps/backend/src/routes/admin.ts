import { FastifyInstance } from 'fastify'

export async function adminRoutes (fastify: FastifyInstance) {
  fastify.get('/admin', async (request, reply) => {
    // Placeholder for admin data
    return { message: 'Admin dashboard' } 
  })
}
