import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; role: string };
  }
}

export async function preferencesRoutes (fastify: FastifyInstance) {
  // Get user preferences (favorites and search history)
  fastify.get('/preferences', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    const userId = request.user.id;
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!preferences) {
      return reply.code(404).send({ message: 'User preferences not found' });
    }
    return { preferences };
  });

  // Save user favorites
  fastify.post<{ Body: { favorite: string } }>('/preferences/favorites', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    const userId = request.user.id;
    const { favorite } = request.body;

    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: { userId, favorites: [favorite] },
      });
    } else {
      if (!preferences.favorites.includes(favorite)) {
        preferences = await prisma.userPreference.update({
          where: { userId },
          data: { favorites: { push: favorite } },
        });
      }
    }
    return { preferences };
  });

  // Add to search history
  fastify.post<{ Body: { search: string } }>('/preferences/history', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    const userId = request.user.id;
    const { search } = request.body;

    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: { userId, searchHistory: [search] },
      });
    } else {
      preferences = await prisma.userPreference.update({
        where: { userId },
        data: { searchHistory: { push: search } },
      });
    }
    return { preferences };
  });
}