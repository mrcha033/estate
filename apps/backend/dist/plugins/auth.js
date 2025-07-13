"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPlugin = authPlugin;
const jwt_1 = require("../lib/jwt");
const redis_1 = __importDefault(require("../lib/redis"));
async function authPlugin(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
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
        const isBlacklisted = await redis_1.default.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return reply.code(401).send({ message: 'Token revoked' });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || typeof decoded !== 'object') {
            return reply.code(401).send({ message: 'Invalid token' });
        }
        request.user = decoded;
    });
}
