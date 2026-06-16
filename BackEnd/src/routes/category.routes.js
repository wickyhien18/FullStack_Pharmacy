// ================================================================
// category.routes.js
// ================================================================
import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            medicine: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    const items = categories.map((c) => ({
      categoryId: c.categoryId.toString(),
      name: c.name,
      slug: c.slug,
      count: c._count.medicine,
    }));
    return sendSuccess(
      res,
      { items, total: items.length },
      "Lấy danh mục cùng số lượng thuốc tương ứng thành công",
    );
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

router.get("/count", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    const items = categories.map((c) => ({
      categoryId: c.categoryId.toString(),
      name: c.name,
      slug: c.slug,
    }));
    return sendSuccess(
      res,
      { items, total: items.length },
      "Lấy danh mục thành công",
    );
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

export default router;
