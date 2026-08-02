import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.config.js";
import { prisma } from "./config/prisma.config.js";
import { startTokenCleanupJob } from "./utils/cleanup-tokens.js";
import { verifyAccessToken } from "./utils/jwt.js";
import { setIO } from "./config/socket.config.js"; // file mới, xem bên dưới

BigInt.prototype.toJSON = function () {
  return this.toString();
};

//Create HTTP server from Express App
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  },
});

// JWT Authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    const payload = verifyAccessToken(token);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`); // room for each users
  console.log(`[Socket] User ${socket.userId} connected`);
});

setIO(io); // save instance for other service use

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

  // ── Keep-alive ping each 4 minutes ────────────────────────────────
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

  httpServer.listen(env.PORT, () => {
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

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled Rejection:", reason);
});

start();
startTokenCleanupJob();
