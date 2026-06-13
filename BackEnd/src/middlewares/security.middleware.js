
// ================================================================
// security.middleware.js
// Mục đích / Purpose:
//   - Rate limit: giới hạn số request để chống brute force
//   - requireJson: đảm bảo request body là JSON
//   - sanitizeInput: làm sạch input chống XSS cơ bản
// ================================================================
import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

// ── Auth Rate Limit ───────────────────────────────────────────────
// Giới hạn 10 request / 15 phút / IP cho login và register
// Tại sao? / Why? Ngăn hacker thử mật khẩu hàng nghìn lần
// Prevent attacker from trying thousands of passwords
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút / 15 minutes
  max: 10,                   // tối đa 10 request / max 10 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút', 429);
  },
});

// ── Refresh Token Rate Limit ──────────────────────────────────────
// Thoải mái hơn vì client gọi tự động / More lenient since client calls automatically
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Quá nhiều yêu cầu làm mới token', 429);
  },
});

// ── Require JSON ──────────────────────────────────────────────────
// Chỉ chấp nhận Content-Type: application/json cho POST/PUT/PATCH
// Only accept application/json for write operations
export const requireJson = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return sendError(res, 'Content-Type phải là application/json', 415);
    }
  }
  return next();
};

// ── Sanitize Input ────────────────────────────────────────────────
// Làm sạch input: xoá script tags, trim whitespace
// Clean input: remove script tags, trim whitespace
// Chống XSS cơ bản / Basic XSS protection
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Xoá script tags / Remove script tags
        obj[key] = obj[key].replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  return next();
};
