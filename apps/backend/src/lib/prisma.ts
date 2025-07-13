import { PrismaClient } from '@prisma/client'
import { getSecrets } from './secrets'

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  // In production, ensure secrets are loaded before initializing Prisma
  const secrets = getSecrets();
  process.env.DATABASE_URL = secrets.DATABASE_URL;
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    const secrets = getSecrets();
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma }

