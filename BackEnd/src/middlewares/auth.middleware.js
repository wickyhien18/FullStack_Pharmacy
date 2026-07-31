import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

// JWT authentication
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized — missing token", 401);
  }
  const token = header.split(" ")[1];
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    return sendError(res, "Unauthorized — invalid or expired token", 401);
  }
};

// Authorize
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Forbidden — insufficient permissions", 403);
    }
    return next();
  };
