"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightsRoutes = insightsRoutes;
async function insightsRoutes(fastify) {
    fastify.get('/insights', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        // Placeholder for insights data
        return { insights: [] };
    });
}
