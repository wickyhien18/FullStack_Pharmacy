import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { configurePassport } from "./config/passport.config.js";

import { env } from "./config/env.config.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { sanitizeInput } from "./middlewares/security.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import manufacturerRoutes from "./routes/manufacturer.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

// Render/Vercel use reverse proxy — need trust proxy for rate-limit work properly
app.set("trust proxy", 1);

//Configure Passport for Google OAuth
configurePassport();
app.use(passport.initialize());
// ── Security ─────────────────────────────────────────────────────
// Add http security header for reduce security risks
app.use(helmet());

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        env.CLIENT_URL, // URL Vercel (production)
        "http://localhost:5173", // local dev
        "http://localhost:4173", // vite preview
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    // Allow send cookie, require for refreshToken HttpOnly cookie
    credentials: true,
  }),
);

// ── Rate limiting (global) ────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests
    message: { success: false, message: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Body parsing ──────────────────────────────────────────────────
// Parse JSON bodies with a size limit of 10MB
// If client sends JSON body, Express will stores data in req.body
app.use(express.json({ limit: "10mb" }));

// Clean input req.body
app.use(sanitizeInput);

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests, some middleware can read cookies by req.cookies
app.use(cookieParser());

//Compress response bodies for all requests to improve performance
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────
// Log HTTP requests in development mode
if (env.NODE_ENV !== "production") app.use(morgan("dev"));

// Health check — use for UptimeRobot ping that keep DB connection and prevent Render sleep
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
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
