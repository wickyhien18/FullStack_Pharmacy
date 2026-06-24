// ================================================================
// product.route.jsx
// ================================================================
import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { cacheResponse } from "../middlewares/cache.middleware.js";

const router = Router();

// GET /api/products?search=...&categoryId=...&sort=...&page=...&limit=...
router.get("/", cacheResponse(300), productController.getProducts);

// GET /api/products/:slug
router.get("/:slug", cacheResponse(600), productController.getProductBySlug);

export default router;
