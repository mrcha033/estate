"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataQARoutes = dataQARoutes;
const audit_logger_1 = require("../lib/audit_logger");
async function dataQARoutes(fastify) {
    // Middleware to ensure only admins can access these routes
    fastify.addHook('preHandler', async (request, reply) => {
        if (request.user?.role !== 'admin') {
            (0, audit_logger_1.log_audit_event)(request.user?.id || 'anonymous', 'unauthorized_access', { path: request.url, method: request.method });
            return reply.code(403).send({ message: 'Forbidden: Admins only' });
        }
    });
    // Get ETL logs
    fastify.get('/admin/etl-logs', async (request, reply) => {
        (0, audit_logger_1.log_audit_event)(request.user?.id || 'unknown', 'view_etl_logs', {});
        // Placeholder for fetching ETL logs
        return { logs: [] };
    });
    // Get error reports
    fastify.get('/admin/error-reports', async (request, reply) => {
        (0, audit_logger_1.log_audit_event)(request.user?.id || 'unknown', 'view_error_reports', {});
        // Placeholder for fetching error reports
        return { reports: [] };
    });
    // Trigger data reprocessing
    fastify.post('/admin/reprocess-data', async (request, reply) => {
        (0, audit_logger_1.log_audit_event)(request.user?.id || 'unknown', 'trigger_data_reprocessing', request.body);
        // Placeholder for triggering data reprocessing
        return { message: 'Data reprocessing triggered.' };
    });
    // Manual data correction (example)
    fastify.put('/admin/correct-data', async (request, reply) => {
        const { recordId, correctedData } = request.body;
        (0, audit_logger_1.log_audit_event)(request.user?.id || 'unknown', 'manual_data_correction', { recordId, correctedData });
        // Placeholder for applying manual correction
        return { message: `Data record ${recordId} corrected.` };
    });
}
