import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Singleton — tránh nhiều connection khi hot reload dev
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;
