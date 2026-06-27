import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { verifyMailer } from "./services/email.service.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const start = async () => {
  // Try connecting to the database with 3 retries
  for (let i = 1; i <= 3; i++) {
    try {
      await prisma.$connect();
      console.log("[DB] Connected to PostgreSQL (Supabase)");
      break;
    } catch (err) {
      console.log(`[DB] Attempt ${i} failed, retrying...`);
      if (i === 3) {
        console.error("[Server] Failed to start:", err);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  app.listen(env.PORT, () => {
    console.log(`[Server] Running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);

    // ── Keep-alive ping mỗi 4 phút ────────────────────────────────
    // Giữ Supabase connection sống — free tier đóng idle connection sau ~5 phút
    // Trên Render free tier: cũng giúp tránh cold start nếu dùng cron ping từ ngoài
    setInterval(
      async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          console.log("[DB] Keep-alive ping OK");
        } catch (err) {
          console.warn(
            "[DB] Keep-alive ping failed, will reconnect on next request:",
            err.message,
          );
        }
      },
      4 * 60 * 1000,
    ); // 4 phút
  });
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();
