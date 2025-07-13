import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/reports', async (request, reply) => {
    try {
      const reports = await prisma.report.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
      });
      reply.send(reports);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch reports' });
    }
  });
}