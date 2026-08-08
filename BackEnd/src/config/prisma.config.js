import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "./env.config.js";

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
  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

//Export Prisma for query in production
export { Prisma };
