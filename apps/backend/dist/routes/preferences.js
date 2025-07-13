"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferencesRoutes = preferencesRoutes;
const prisma_1 = require("../lib/prisma");
async function preferencesRoutes(fastify) {
    // Get user preferences (favorites and search history)
    fastify.get('/preferences', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        const userId = request.user.id;
        const preferences = await prisma_1.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!preferences) {
            return reply.code(404).send({ message: 'User preferences not found' });
        }
        return { preferences };
    });
    // Save user favorites
    fastify.post('/preferences/favorites', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        const userId = request.user.id;
        const { favorite } = request.body;
        let preferences = await prisma_1.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!preferences) {
            preferences = await prisma_1.prisma.userPreference.create({
                data: { userId, favorites: [favorite] },
            });
        }
        else {
            if (!preferences.favorites.includes(favorite)) {
                preferences = await prisma_1.prisma.userPreference.update({
                    where: { userId },
                    data: { favorites: { push: favorite } },
                });
            }
        }
        return { preferences };
    });
    // Add to search history
    fastify.post('/preferences/history', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        const userId = request.user.id;
        const { search } = request.body;
        let preferences = await prisma_1.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!preferences) {
            preferences = await prisma_1.prisma.userPreference.create({
                data: { userId, searchHistory: [search] },
            });
        }
        else {
            preferences = await prisma_1.prisma.userPreference.update({
                where: { userId },
                data: { searchHistory: { push: search } },
            });
        }
        return { preferences };
    });
}
