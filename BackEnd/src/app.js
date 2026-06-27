import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { sanitizeInput } from "./middlewares/security.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import manufacturerRoutes from "./routes/manufacturer.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();

// Render/Vercel dùng reverse proxy — cần trust proxy để rate-limit hoạt động đúng
app.set("trust proxy", 1);
// ── Security ─────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        env.CLIENT_URL, // URL Vercel (production)
        "http://localhost:5173", // local dev
        "http://localhost:4173", // vite preview
        // "https://full-stack-pharmacy.vercel.app",
      ].filter(Boolean);

      // Cho phép request không có origin (Postman, curl, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ── Rate limiting (global) ────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 200,
    message: { success: false, message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" })); //Parse JSON bodies with a size limit of 10MB
app.use(sanitizeInput);
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies (for form submissions)
app.use(cookieParser()); //Parse cookies from incoming requests
app.use(compression()); //Compress response bodies for all requests to improve performance
// ── Logging ───────────────────────────────────────────────────────
if (env.isDev) app.use(morgan("dev")); //Log HTTP requests in development mode

// ── Swagger UI ───────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check — dùng cho UptimeRobot ping để tránh Render sleep + giữ DB connection
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);
// ── Routes ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/manufacturers", manufacturerRoutes);

// ── Error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
