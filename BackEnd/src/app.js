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

// ── Security ─────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Allow storing cookies from client
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

// ── Health check ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running", env: env.NODE_ENV });
});
// ── Swagger UI ───────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
