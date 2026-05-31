import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Global error handler — đặt cuối cùng trong app.ts
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    message: env.isDev ? err.message : 'Internal server error',
    ...(env.isDev && { stack: err.stack }),
  });
};

// 404 handler
export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};
