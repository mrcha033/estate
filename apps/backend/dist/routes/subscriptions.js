"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRoutes = subscriptionRoutes;
const prisma_1 = require("../lib/prisma");
const ses_1 = require("../lib/ses");
async function subscriptionRoutes(fastify) {
    // Subscribe to reports
    fastify.post('/subscribe', async (request, reply) => {
        const { email, frequency, consent } = request.body;
        if (!consent) {
            return reply.code(400).send({ message: 'Consent is required to subscribe.' });
        }
        try {
            const subscription = await prisma_1.prisma.subscription.upsert({
                where: { email },
                update: { frequency, consent },
                create: { email, frequency, consent, verified: false }, // Set verified to false for double opt-in
            });
            // Send verification email for double opt-in
            const verificationLink = `http://localhost:3000/api/verify-subscription?email=${email}&token=some_verification_token`; // Replace with actual token generation
            const emailBody = `Please click on this link to verify your subscription: <a href="${verificationLink}">${verificationLink}</a>`;
            await (0, ses_1.sendEmail)(email, 'Verify Your Subscription', emailBody);
            return reply.code(200).send({ message: 'Subscription successful. Please check your email for verification.' });
        }
        catch (error) {
            fastify.log.error('Error subscribing:', error);
            return reply.code(500).send({ message: 'Failed to subscribe.' });
        }
    });
    // Unsubscribe from reports
    fastify.post('/unsubscribe', async (request, reply) => {
        const { email } = request.body;
        try {
            await prisma_1.prisma.subscription.delete({
                where: { email },
            });
            return reply.code(200).send({ message: 'Unsubscribed successfully.' });
        }
        catch (error) {
            fastify.log.error('Error unsubscribing:', error);
            return reply.code(500).send({ message: 'Failed to unsubscribe.' });
        }
    });
    // Verification endpoint (for double opt-in)
    fastify.get('/verify-subscription', async (request, reply) => {
        const { email, token } = request.query;
        // In a real scenario, validate the token
        try {
            await prisma_1.prisma.subscription.update({
                where: { email },
                data: { verified: true },
            });
            return reply.code(200).send({ message: 'Email verified successfully!' });
        }
        catch (error) {
            fastify.log.error('Error verifying subscription:', error);
            return reply.code(500).send({ message: 'Subscription verification failed.' });
        }
    });
    // Get user subscriptions (protected)
    fastify.get('/subscriptions', async (request, reply) => {
        if (!request.user) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        // In a real scenario, fetch subscriptions based on request.user.id
        return { subscriptions: [] };
    });
}
