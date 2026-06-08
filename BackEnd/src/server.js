import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const start = async () => {
  // Thử kết nối tối đa 3 lần
  for (let i = 1; i <= 3; i++) {
    try {
      await prisma.$connect();
      console.log("[DB] Connected to PostgreSQL (Supabase)");
      break; // kết nối được thì thoát vòng lặp
    } catch (err) {
      console.log(`[DB] Attempt ${i} failed, retrying...`);
      if (i === 3) {
        console.error("[Server] Failed to start:", err);
        process.exit(1);
      }
      // Chờ 2 giây trước khi thử lại
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  app.listen(env.PORT, () => {
    console.log(`[Server] Running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
  });
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();
