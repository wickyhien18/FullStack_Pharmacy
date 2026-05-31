import { Request } from 'express';

export const parsePagination = (req: Request) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
