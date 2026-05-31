import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

// Xác thực JWT — gắn user vào req.user
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized — missing token', 401);
  }
  const token = header.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return sendError(res, 'Unauthorized — invalid or expired token', 401);
  }
};

// Phân quyền theo role
export const authorize = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden — insufficient permissions', 403);
    }
    return next();
  };
