import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; role: string };
  }
}

interface CreateAlertBody {
  district_name?: string;
  apartment_name?: string;
  price_threshold?: number;
  threshold_type: 'above' | 'below' | 'change_percent';
  change_percent?: number;
  email: string;
}

interface PriceAlert {
  id: string;
  district_name?: string;
  apartment_name?: string;
  price_threshold?: number;
  threshold_type: string;
  change_percent?: number;
  email: string;
  active: boolean;
  created_at: Date;
}

export async function alertsRoutes (fastify: FastifyInstance) {
  
  // Get user's active alerts
  fastify.get('/api/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = request.query as { email?: string };
      
      if (!email) {
        return reply.code(400).send({ message: 'Email parameter is required' });
      }
      
      // Fetch user's alerts from database
      const alerts = await prisma.$queryRaw`
        SELECT 
          id, district_name, apartment_name, price_threshold, 
          threshold_type, change_percent, email, active, created_at
        FROM price_alerts 
        WHERE email = ${email} AND active = true
        ORDER BY created_at DESC
      ` as PriceAlert[];

      return reply.send({ alerts });
    } catch (error) {
      fastify.log.error('Error fetching alerts:', error);
      return reply.code(500).send({ message: 'Failed to fetch alerts' });
    }
  });

  // Create new price alert
  fastify.post<{ Body: CreateAlertBody }>('/api/alerts', async (request, reply) => {
    try {
      const {
        district_name,
        apartment_name,
        price_threshold,
        threshold_type,
        change_percent,
        email
      } = request.body;

      // Validation
      if (!email || !threshold_type) {
        return reply.code(400).send({ 
          message: 'Email and threshold_type are required' 
        });
      }

      if (threshold_type === 'change_percent' && (!change_percent || change_percent <= 0)) {
        return reply.code(400).send({ 
          message: 'change_percent is required and must be positive for change_percent alerts' 
        });
      }

      if ((threshold_type === 'above' || threshold_type === 'below') && (!price_threshold || price_threshold <= 0)) {
        return reply.code(400).send({ 
          message: 'price_threshold is required and must be positive for price threshold alerts' 
        });
      }

      // Create alert using raw SQL
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.$executeRaw`
        INSERT INTO price_alerts (
          id, district_name, apartment_name, price_threshold, 
          threshold_type, change_percent, email, active, created_at
        ) VALUES (
          ${alertId}, ${district_name || null}, ${apartment_name || null}, 
          ${price_threshold || null}, ${threshold_type}, ${change_percent || null}, 
          ${email}, true, NOW()
        )
      `;

      return reply.code(201).send({ 
        message: 'Price alert created successfully',
        alert_id: alertId
      });

    } catch (error) {
      fastify.log.error('Error creating alert:', error);
      return reply.code(500).send({ message: 'Failed to create alert' });
    }
  });

  // Delete/deactivate alert
  fastify.delete<{ Params: { alertId: string } }>('/api/alerts/:alertId', async (request, reply) => {
    try {
      const { alertId } = request.params;
      const { email } = request.query as { email?: string };

      if (!email) {
        return reply.code(400).send({ message: 'Email parameter is required' });
      }

      // Deactivate alert instead of deleting for audit purposes
      const result = await prisma.$executeRaw`
        UPDATE price_alerts 
        SET active = false, updated_at = NOW()
        WHERE id = ${alertId} AND email = ${email} AND active = true
      `;

      if (result === 0) {
        return reply.code(404).send({ message: 'Alert not found or already inactive' });
      }

      return reply.send({ message: 'Alert deactivated successfully' });

    } catch (error) {
      fastify.log.error('Error deleting alert:', error);
      return reply.code(500).send({ message: 'Failed to delete alert' });
    }
  });

  // Check for alert triggers (internal endpoint for ETL pipeline)
  fastify.post('/api/alerts/check-triggers', async (request, reply) => {
    try {
      // This endpoint would be called by the ETL pipeline after new data is processed
      // Get all active alerts
      const activeAlerts = await prisma.$queryRaw`
        SELECT * FROM price_alerts WHERE active = true
      ` as PriceAlert[];

      const triggeredAlerts = [];

      for (const alert of activeAlerts) {
        let shouldTrigger = false;
        let triggerMessage = '';
        let currentData: any = null;

        if (alert.threshold_type === 'above' || alert.threshold_type === 'below') {
          // Check current average prices
          const priceQuery = `
            SELECT 
              AVG(transaction_amount_won) as avg_price,
              COUNT(*) as transaction_count
            FROM apartment_transactions 
            WHERE data_quality_score >= 80
            AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'
            ${alert.district_name ? `AND district_name ILIKE '%${alert.district_name}%'` : ''}
            ${alert.apartment_name ? `AND apartment_name ILIKE '%${alert.apartment_name}%'` : ''}
          `;

          const priceResult = await prisma.$queryRawUnsafe(priceQuery) as any[];
          currentData = priceResult[0];

          if (currentData && currentData.avg_price) {
            const currentPrice = Number(currentData.avg_price);
            const threshold = alert.price_threshold!;

            if (alert.threshold_type === 'above' && currentPrice > threshold) {
              shouldTrigger = true;
              triggerMessage = `평균 가격이 설정한 임계값 ${threshold:,}원을 초과했습니다. 현재 평균: ${currentPrice:,}원`;
            } else if (alert.threshold_type === 'below' && currentPrice < threshold) {
              shouldTrigger = true;
              triggerMessage = `평균 가격이 설정한 임계값 ${threshold:,}원 아래로 떨어졌습니다. 현재 평균: ${currentPrice:,}원`;
            }
          }
        } else if (alert.threshold_type === 'change_percent') {
          // Check percentage change from previous period
          const changeQuery = `
            WITH current_week AS (
              SELECT AVG(transaction_amount_won) as avg_price
              FROM apartment_transactions 
              WHERE data_quality_score >= 80
              AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'
              ${alert.district_name ? `AND district_name ILIKE '%${alert.district_name}%'` : ''}
              ${alert.apartment_name ? `AND apartment_name ILIKE '%${alert.apartment_name}%'` : ''}
            ),
            previous_week AS (
              SELECT AVG(transaction_amount_won) as avg_price
              FROM apartment_transactions 
              WHERE data_quality_score >= 80
              AND transaction_date >= CURRENT_DATE - INTERVAL '14 days'
              AND transaction_date < CURRENT_DATE - INTERVAL '7 days'
              ${alert.district_name ? `AND district_name ILIKE '%${alert.district_name}%'` : ''}
              ${alert.apartment_name ? `AND apartment_name ILIKE '%${alert.apartment_name}%'` : ''}
            )
            SELECT 
              c.avg_price as current_price,
              p.avg_price as previous_price,
              CASE 
                WHEN p.avg_price > 0 THEN ((c.avg_price - p.avg_price) / p.avg_price * 100)
                ELSE NULL 
              END as price_change_percent
            FROM current_week c, previous_week p
          `;

          const changeResult = await prisma.$queryRawUnsafe(changeQuery) as any[];
          currentData = changeResult[0];

          if (currentData && currentData.price_change_percent !== null) {
            const changePercent = Math.abs(Number(currentData.price_change_percent));
            
            if (changePercent >= alert.change_percent!) {
              shouldTrigger = true;
              const direction = Number(currentData.price_change_percent) > 0 ? '상승' : '하락';
              triggerMessage = `가격이 ${changePercent.toFixed(1)}% ${direction}하여 설정한 임계값 ${alert.change_percent}%를 초과했습니다.`;
            }
          }
        }

        if (shouldTrigger) {
          triggeredAlerts.push({
            alert,
            message: triggerMessage,
            data: currentData
          });

          // Log the triggered alert (in production, this would send an email/notification)
          fastify.log.info(`Alert triggered for ${alert.email}: ${triggerMessage}`);
        }
      }

      return reply.send({ 
        message: `Checked ${activeAlerts.length} alerts, ${triggeredAlerts.length} triggered`,
        triggered_alerts: triggeredAlerts.length,
        total_alerts: activeAlerts.length
      });

    } catch (error) {
      fastify.log.error('Error checking alert triggers:', error);
      return reply.code(500).send({ message: 'Failed to check alert triggers' });
    }
  });

  // Get alert statistics
  fastify.get('/api/alerts/stats', async (request, reply) => {
    try {
      const { email } = request.query as { email?: string };

      if (!email) {
        return reply.code(400).send({ message: 'Email parameter is required' });
      }

      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN active = true THEN 1 END) as active_alerts,
          COUNT(CASE WHEN threshold_type = 'above' THEN 1 END) as price_above_alerts,
          COUNT(CASE WHEN threshold_type = 'below' THEN 1 END) as price_below_alerts,
          COUNT(CASE WHEN threshold_type = 'change_percent' THEN 1 END) as change_alerts
        FROM price_alerts 
        WHERE email = ${email}
      `;

      return reply.send({ statistics: (stats as any)[0] });

    } catch (error) {
      fastify.log.error('Error fetching alert statistics:', error);
      return reply.code(500).send({ message: 'Failed to fetch alert statistics' });
    }
  });
}