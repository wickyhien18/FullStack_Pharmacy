import { env } from "../config/env.config.js";

// Global error handler
export const errorHandler = (err, _req, res, _next) => {
  console.error("[Error]", err);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV !== "production" ? err.message : "Internal server error",
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// 404 handler
export const notFound = (_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};
