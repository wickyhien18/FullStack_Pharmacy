import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "./env.js";

// Retrieve the global object of Node.js. The purpose is to store the Prisma Client at the global scope.
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const client = new PrismaClient({
    //Create connection between Prisma and database by DATABASE_URL
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },

    log: env.NODE_ENV !== "production" ? ["query", "error", "warn"] : ["error"],

    //Config transaction
    transactionOptions: {
      timeout: 30000, // 1 transaction has a maximum execution time of 30 seconds
      maxWait: 10000, // Prisma waits up to 10 seconds to acquire a connection of the transaction
    },
  });

  const SLOW_QUERY_THRESHOLD_MS = env.NODE_ENV !== "production" ? 300 : 500;

  //Listen query events
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

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

//Export Prisma for query in production
export { Prisma };
