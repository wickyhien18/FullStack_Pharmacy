
// ================================================================
// medicine.routes.js
// ================================================================
import { Router } from 'express';
import * as medicineController from '../controllers/medicine.controller.js';

const router = Router();

// GET /api/medicines?search=...&categoryId=...&sort=...&page=...&limit=...
router.get('/',      medicineController.getMedicines);

// GET /api/medicines/:slug
router.get('/:slug', medicineController.getMedicineBySlug);

export default router;
