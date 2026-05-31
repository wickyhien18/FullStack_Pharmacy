import { Response } from 'express';
import { ApiResponse } from '../types/api';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200
) => {
  const body: ApiResponse<T> = { success: true, message, data };
  return res.status(status).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  status = 400,
  errors?: unknown
) => {
  const body: ApiResponse = { success: false, message, errors };
  return res.status(status).json(body);
};
