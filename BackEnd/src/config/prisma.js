import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "./env.js";

// Singleton — tránh nhiều connection khi hot reload dev
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.isDev ? ["query", "error", "warn"] : ["error"],
    transactionOptions: {
      timeout: 30000, // 30 giây thay vì 5 giây mặc định
      maxWait: 10000,
    },
  });

  const SLOW_QUERY_THRESHOLD_MS = env.isDev ? 300 : 500;

  client.$on("query", (e) => {
    if (e.duration >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `\n🐌 [SLOW QUERY] ${e.duration}ms\n` +
          `   SQL:    ${e.query}\n` +
          `   Params: ${e.params}\n` +
          `   Target: ${e.target}\n`,
      );
    }
  });
  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (env.isDev) globalForPrisma.prisma = prisma;

export { Prisma };
