
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { cacheResponse } from '../middlewares/cache.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();
const adminOnly = authorize('ROLE_ADMIN');

// Public
router.get('/',      cacheResponse(600), categoryController.getCategories);
router.get('/count', cacheResponse(600), categoryController.getCategoriesWithCount);

// Admin only
router.post('/',             authenticate, adminOnly, categoryController.createCategory);
router.put('/:categoryId',   authenticate, adminOnly, categoryController.updateCategory);
router.delete('/:categoryId',authenticate, adminOnly, categoryController.deleteCategory);

export default router;
