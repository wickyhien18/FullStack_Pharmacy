// jobs/cleanup-tokens.job.js
import cron from "node-cron";
import { prisma } from "../config/prisma.js";

export const startTokenCleanupJob = () => {
  // Chạy mỗi ngày lúc 2h sáng
  cron.schedule("0 2 * * *", async () => {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ isRevoked: true }, { expireAt: { lt: new Date() } }],
      },
    });
    console.log(`[Cleanup] Đã xóa ${result.count} refresh token cũ`);
  });
};
