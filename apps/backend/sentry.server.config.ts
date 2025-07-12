import * as Sentry from "@sentry/node";
import { Integrations } from "@sentry/integrations";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new Integrations.Http({ tracing: true }),
    new Integrations.Express({ app: "fastify" }), // Use Express integration for Fastify
  ],
});
