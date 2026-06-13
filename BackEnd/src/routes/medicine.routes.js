// ================================================================
// medicine.routes.js
// ================================================================
import { Router } from "express";
import * as medicineController from "../controllers/medicine.controller.js";
import { cacheResponse } from "../middlewares/cache.middleware.js";

const router = Router();

// GET /api/medicines?search=...&categoryId=...&sort=...&page=...&limit=...
router.get("/", cacheResponse(300), medicineController.getMedicines);

// GET /api/medicines/:slug
router.get("/:slug", cacheResponse(600), medicineController.getMedicineBySlug);

export default router;
