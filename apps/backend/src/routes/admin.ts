import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail } from '../lib/ses'

export async function adminRoutes (fastify: FastifyInstance) {
  fastify.get('/admin', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }
    return { message: 'Admin dashboard' } 
  })

  fastify.post('/admin/beta-invitations/generate', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }

    const { email } = request.body as { email: string };

    if (!email) {
      return reply.code(400).send({ message: 'Email is required' });
    }

    const token = randomBytes(16).toString('hex'); // Generate a random 32-character hex token

    try {
      const betaInvitation = await prisma.betaInvitation.create({
        data: {
          email,
          token,
        },
      });
      // Assuming your frontend is at http://localhost:3000 for now
      const invitationLink = `http://localhost:3000/signup?token=${token}`;

      const subject = 'Your Beta Invitation to Estate';
      const body = `
        <p>Dear Beta User,</p>
        <p>Welcome to the Estate closed beta program! We're excited to have you on board.</p>
        <p>To get started, please use the following link to sign up:</p>
        <p><a href="${invitationLink}">${invitationLink}</a></p>
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        <p>Best regards,</p>
        <p>The Estate Team</p>
      `;

      await sendEmail(email, subject, body);

      return { message: 'Beta invitation generated and email sent', invitationLink, betaInvitation };
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return reply.code(409).send({ message: 'A beta invitation for this email already exists.' });
      }
      console.error('Error generating beta invitation or sending email:', error);
      return reply.code(500).send({ message: 'Failed to generate beta invitation or send email' });
    }
  });

  fastify.get('/admin/beta-invitations/metrics', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }

    try {
      const totalInvitations = await prisma.betaInvitation.count();
      const usedInvitations = await prisma.betaInvitation.count({
        where: { used: true },
      });
      const unusedInvitations = totalInvitations - usedInvitations;

      return {
        totalInvitations,
        usedInvitations,
        unusedInvitations,
      };
    } catch (error) {
      console.error('Error fetching beta invitation metrics:', error);
      return reply.code(500).send({ message: 'Failed to fetch beta invitation metrics' });
    }
  });

  fastify.get('/admin/kpi-metrics', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }

    try {
      // MAU: For simplicity, let's count users who signed up in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // This assumes `createdAt` is available on the User model, which it is not currently.
      // For a real implementation, you would need to track user activity (e.g., last login, event timestamps)
      // or query a dedicated analytics table populated by Segment's warehouse sync.
      // For now, we'll just return a placeholder for MAU.
      const mau = 0; // Placeholder

      // Total Users (from Supabase Auth, not directly from Prisma User model unless synced)
      // For now, we'll use the count of beta invitations that have been used as a proxy for active users.
      const totalUsers = await prisma.betaInvitation.count({
        where: { used: true },
      });

      // Report Open Rates: Placeholder, as this would come from Segment data
      const reportOpenRate = 'N/A';

      // Session Duration: Placeholder, as this would come from Segment data
      const avgSessionDuration = 'N/A';

      // ETL Health Status: Placeholder, as this would come from ETL service monitoring
      const etlHealthStatus = 'Operational';

      // Placeholder trend data
      const mauTrendData = [
        { name: 'Jan', value: 120 },
        { name: 'Feb', value: 150 },
        { name: 'Mar', value: 170 },
        { name: 'Apr', value: 200 },
        { name: 'May', value: 230 },
        { name: 'Jun', value: 250 },
      ];

      const reportOpenRateTrendData = [
        { name: 'Jan', value: 0.35 },
        { name: 'Feb', value: 0.40 },
        { name: 'Mar', value: 0.42 },
        { name: 'Apr', value: 0.45 },
        { name: 'May', value: 0.48 },
        { name: 'Jun', value: 0.50 },
      ];

      const sessionDurationTrendData = [
        { name: 'Jan', value: 300 },
        { name: 'Feb', value: 320 },
        { name: 'Mar', value: 350 },
        { name: 'Apr', value: 370 },
        { name: 'May', value: 400 },
        { name: 'Jun', value: 420 },
      ];

      return {
        mau,
        totalUsers,
        reportOpenRate,
        avgSessionDuration,
        etlHealthStatus,
        mauTrendData,
        reportOpenRateTrendData,
        sessionDurationTrendData,
      };
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      return reply.code(500).send({ message: 'Failed to fetch KPI metrics' });
    }
  });
}
