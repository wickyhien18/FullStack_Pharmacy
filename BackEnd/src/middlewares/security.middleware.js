import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";

// ── Auth Rate Limit ───────────────────────────────────────────────
// Limit 10 request / 15 minutes / IP for login and register
// Prevent attacker from trying thousands of passwords
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests
  standardHeaders: true, // add standard rate limit header for client
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
      429,
    );
  },
});

// ── Refresh Token Rate Limit ──────────────────────────────────────
// More lenient since client calls automatically
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, "Quá nhiều yêu cầu làm mới token", 429);
  },
});

// ── Require JSON ──────────────────────────────────────────────────
// Only accept Content-Type: application/json for POST/PUT/PATCH
// Only accept application/json for write operations
export const requireJson = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!req.is("application/json")) {
      return sendError(res, "Content-Type phải là application/json", 415);
    }
  }
  return next();
};

// ── Sanitize Input ────────────────────────────────────────────────
// Clean input: remove script tags, trim whitespace
// Basic XSS protection
export const sanitizeInput = (req, res, next) => {
  // Recursive function that clean object
  const sanitize = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") {
        //  Remove script tags
        obj[key] = obj[key].replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          "",
        );
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  return next();
};
