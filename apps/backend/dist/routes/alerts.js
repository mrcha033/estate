"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRoutes = alertsRoutes;
async function alertsRoutes(fastify) {
    fastify.get('/alerts', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        // Placeholder for alerts data
        return { alerts: [] };
    });
}
