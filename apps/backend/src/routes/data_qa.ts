import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { log_audit_event } from '../lib/audit_logger'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; role: string };
  }
}

export async function dataQARoutes (fastify: FastifyInstance) {
  // Middleware to ensure only admins can access these routes
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user?.role !== 'admin') {
      log_audit_event(request.user?.id || 'anonymous', 'unauthorized_access', { path: request.url, method: request.method });
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }
  });

  // Get ETL logs
  fastify.get('/admin/etl-logs', async (request, reply) => {
    log_audit_event(request.user?.id || 'unknown', 'view_etl_logs', {});
    // Placeholder for fetching ETL logs
    return { logs: [] };
  });

  // Get error reports
  fastify.get('/admin/error-reports', async (request, reply) => {
    log_audit_event(request.user?.id || 'unknown', 'view_error_reports', {});
    // Placeholder for fetching error reports
    return { reports: [] };
  });

  // Trigger data reprocessing
  fastify.post('/admin/reprocess-data', async (request, reply) => {
    log_audit_event(request.user?.id || 'unknown', 'trigger_data_reprocessing', request.body);
    // Placeholder for triggering data reprocessing
    return { message: 'Data reprocessing triggered.' };
  });

  // Manual data correction (example)
  fastify.put<{ Body: { recordId: string; correctedData: any } }>('/admin/correct-data', async (request, reply) => {
    const { recordId, correctedData } = request.body;
    log_audit_event(request.user?.id || 'unknown', 'manual_data_correction', { recordId, correctedData });
    // Placeholder for applying manual correction
    return { message: `Data record ${recordId} corrected.` };
  });
}
