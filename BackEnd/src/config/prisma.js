import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Singleton — tránh nhiều connection khi hot reload dev
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.isDev ? ["query", "error", "warn"] : ["error"],
  });

if (env.isDev) globalForPrisma.prisma = prisma;
