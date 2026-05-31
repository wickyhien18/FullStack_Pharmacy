import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

// --- Import routes (thêm dần khi làm Phase 2) ---
// import authRoutes     from './routes/auth.routes.js';
// import medicineRoutes from './routes/medicine.routes.js';
// import cartRoutes     from './routes/cart.routes.js';
// import orderRoutes    from './routes/order.routes.js';
// import adminRoutes    from './routes/admin.routes.js';

const app = express();

// ── Security ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,              // Cần cho cookie refresh token
}));

// ── Rate limiting (global) ────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 phút
  max: 200,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────
if (env.isDev) app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', env: env.NODE_ENV });
});

// ── Routes ────────────────────────────────────────────────────────
// app.use('/api/auth',      authRoutes);
// app.use('/api/medicines', medicineRoutes);
// app.use('/api/cart',      cartRoutes);
// app.use('/api/orders',    orderRoutes);
// app.use('/api/admin',     adminRoutes);

// ── Error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
