import { FastifyInstance } from 'fastify'
import client from 'prom-client'

export async function metricsPlugin (fastify: FastifyInstance) {
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return reply.send(await client.register.metrics());
  });
}
