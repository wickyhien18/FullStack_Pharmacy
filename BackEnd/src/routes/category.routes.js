
// ================================================================
// category.routes.js
// ================================================================
import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    const items = categories.map((c) => ({
      categoryId: c.categoryId.toString(),
      name: c.name,
      slug: c.slug,
    }));
    return sendSuccess(res, { items, total: items.length }, 'Lấy danh mục thành công');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

export default router;
