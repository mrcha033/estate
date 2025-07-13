"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function default_1(fastify) {
    fastify.get('/api/reports', async (request, reply) => {
        try {
            const reports = await prisma.report.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 2,
            });
            reply.send(reports);
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch reports' });
        }
    });
}
