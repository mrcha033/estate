"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const user_1 = require("./routes/user");
const insights_1 = require("./routes/insights");
const search_1 = require("./routes/search");
const reports_1 = __importDefault(require("./routes/reports"));
const alerts_1 = require("./routes/alerts");
const admin_1 = require("./routes/admin");
const preferences_1 = require("./routes/preferences");
const subscriptions_1 = require("./routes/subscriptions");
const data_qa_1 = require("./routes/data_qa");
const auth_1 = require("./plugins/auth");
const metrics_1 = require("./plugins/metrics");
const secrets_1 = require("./lib/secrets");
const fastify = (0, fastify_1.default)({
    logger: true
});
fastify.register(auth_1.authPlugin); // Register authentication plugin first
fastify.register(user_1.userRoutes);
fastify.register(insights_1.insightsRoutes);
fastify.register(search_1.searchRoutes);
fastify.register(reports_1.default);
fastify.register(alerts_1.alertsRoutes);
fastify.register(admin_1.adminRoutes);
fastify.register(preferences_1.preferencesRoutes);
fastify.register(subscriptions_1.subscriptionRoutes);
fastify.register(data_qa_1.dataQARoutes);
fastify.register(metrics_1.metricsPlugin); // Register metrics plugin
fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});
const start = async () => {
    await (0, secrets_1.loadSecrets)();
    try {
        await fastify.listen({ port: 3000 });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
