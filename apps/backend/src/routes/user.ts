import { FastifyInstance } from 'fastify'
import { getAnalytics } from '../lib/segment'
import { Analytics } from '@segment/analytics-node'
import { supabase } from '../lib/supabase'
import { prisma } from '../lib/prisma'
import { generateToken, verifyToken } from '../lib/jwt'
import redisClient from '../lib/redis'
import { encrypt, decrypt } from '../lib/encryption'
import { sendEmail } from '../lib/ses'

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string; role: string };
  }
}

interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [] // In-memory storage for demonstration





    



// Remove redundant interface - using Analytics properties directly

export async function userRoutes (fastify: FastifyInstance) {
  // User registration
  fastify.post('/auth/signup', async (request, reply) => {
    const { email, password } = request.body as any // Type this properly
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return reply.code(400).send({ message: error.message })
    }

    // Track user signup event
    const analytics = getAnalytics();
    if (data.user) {
      analytics?.track({
        userId: data.user.id,
        event: 'User Signed Up'
      });
    }

    // Mark beta invitation as used if it exists
    try {
      await prisma.betaInvitation.update({
        where: { email: email },
        data: { used: true, usedAt: new Date() },
      });
    } catch (prismaError) {
      // Log the error but don't block signup if invitation not found or already used
      console.warn(`Could not update beta invitation for ${email}:`, prismaError);
    }

    return { user: data.user }
  })

  // User login
  fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as any // Type this properly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return reply.code(400).send({ message: error.message })
    }

    const user = data.user;
    const session = data.session;

    if (!user || !session) {
      return reply.code(500).send({ message: 'Authentication failed' });
    }

    // Track user login event
    const analytics = getAnalytics();
    analytics?.track({
      userId: user.id,
      event: 'User Logged In'
    });

    // Assign a default role, e.g., 'user'
    const userRole = 'user'; 
    const accessToken = generateToken({ id: user.id, email: user.email, role: userRole }, '15m');
    const refreshToken = generateToken({ id: user.id, email: user.email, role: userRole }, '14d');

    // Store refresh token in Redis (optional, for more robust session management)
    await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 14); // 14 days expiration

    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  })

  // User logout
  fastify.post('/auth/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return reply.code(401).send({ message: 'Token missing' });
    }

    const decoded = verifyToken(token);
    if (decoded && typeof decoded === 'object' && decoded.id) {
      // Blacklist the access token
      await redisClient.set(`blacklist:${token}`, 'true', 'EX', 60 * 15); // Blacklist for 15 minutes (access token TTL)
      // Optionally remove refresh token
      await redisClient.del(`refreshToken:${decoded.id}`);
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      return reply.code(400).send({ message: error.message })
    }
    return { message: 'Logged out successfully' }
  })

  // OAuth with Google
  fastify.get('/auth/google', async (request, reply) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    if (error) {
      return reply.code(400).send({ message: error.message })
    }
    return reply.redirect(data.url)
  })

  // OAuth with Kakao
  fastify.get('/auth/kakao', async (request, reply) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    if (error) {
      return reply.code(400).send({ message: error.message })
    }
    return reply.redirect(data.url)
  })

  // Get all users (now protected - only for admin)
  fastify.get('/users', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }
    // Decrypt emails before returning
    const decryptedUsers = users.map(user => ({ ...user, email: decrypt(user.email) }));
    return { users: decryptedUsers } // Placeholder for user data
  })

  // Get user by ID (protected - only for admin or self)
  fastify.get<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params
    if (request.user?.role !== 'admin' && request.user?.id !== id) {
      return reply.code(403).send({ message: 'Forbidden: Access denied' });
    }
    const user = users.find(u => u.id === id)
    if (!user) {
      reply.code(404).send({ message: 'User not found' })
      return // Add return here to prevent further execution
    }
    // Decrypt email before returning
    return { user: { ...user, email: decrypt(user.email) } }
  })

  // Create a new user (protected - only for admin)
  fastify.post<{ Body: { name: string; email: string } }>('/users', async (request, reply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }
    const { name, email } = request.body
    const encryptedEmail = encrypt(email);
    const newUser: User = { id: String(users.length + 1), name, email: encryptedEmail }
    users.push(newUser)
    reply.code(201).send(newUser)
  })

  // Update a user (protected - only for admin or self)
  fastify.put<{ Params: { id: string }; Body: { name?: string; email?: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params
    if (request.user?.role !== 'admin' && request.user?.id !== id) {
      return reply.code(403).send({ message: 'Forbidden: Access denied' });
    }
    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      reply.code(404).send({ message: 'User not found' })
    }
    const updatedEmail = request.body.email ? encrypt(request.body.email) : users[userIndex].email;
    users[userIndex] = { ...users[userIndex], ...request.body, email: updatedEmail }
    return { user: { ...users[userIndex], email: decrypt(users[userIndex].email) } }
  })

  // Delete a user (protected - only for admin)
  fastify.delete<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Admins only' });
    }
    const userIndex = users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      reply.code(404).send({ message: 'User not found' })
    }
    const deletedUser = users.splice(userIndex, 1)
    return { message: 'User deleted', user: { ...deletedUser[0], email: decrypt(deletedUser[0].email) } }
  })

  // Submit a support request
  fastify.post('/support', async (request, reply) => {
    const { name, email, message } = request.body as { name: string; email: string; message: string };

    if (!name || !email || !message) {
      return reply.code(400).send({ message: 'Name, email, and message are required' });
    }

    const subject = `Support Request from ${name} (${email})`;
    const body = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    try {
      await sendEmail('support@estate.com', subject, body); // Send to a predefined support email
      return reply.code(200).send({ message: 'Support request submitted successfully' });
    } catch (error) {
      console.error('Error sending support email:', error);
      return reply.code(500).send({ message: 'Failed to submit support request' });
    }
  });
}