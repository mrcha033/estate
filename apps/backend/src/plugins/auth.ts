import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../lib/jwt'
import redisClient from '../lib/redis'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; role: string };
  }
}

export async function authPlugin (fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url.startsWith('/auth')) {
      return; // Skip authentication for auth routes
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return reply.code(401).send({ message: 'Token missing' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return reply.code(401).send({ message: 'Token revoked' });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded !== 'object') {
      return reply.code(401).send({ message: 'Invalid token' });
    }

    request.user = decoded as { id: string; email: string; role: string };
  });
}
