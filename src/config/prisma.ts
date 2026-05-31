import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Singleton — tránh nhiều connection khi hot reload dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;
