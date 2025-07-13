"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsPlugin = metricsPlugin;
const prom_client_1 = __importDefault(require("prom-client"));
async function metricsPlugin(fastify) {
    const collectDefaultMetrics = prom_client_1.default.collectDefaultMetrics;
    collectDefaultMetrics();
    fastify.get('/metrics', async (request, reply) => {
        reply.header('Content-Type', prom_client_1.default.register.contentType);
        return reply.send(await prom_client_1.default.register.metrics());
    });
}
