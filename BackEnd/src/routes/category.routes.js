
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { cacheResponse } from '../middlewares/cache.middleware.js';

const router = Router();

// Public
router.get('/',      cacheResponse(600), categoryController.getCategories);
router.get('/count', cacheResponse(600), categoryController.getCategoriesWithCount);

// Admin only
router.post('/',                categoryController.createCategory);
router.put('/:categoryId',      categoryController.updateCategory);
router.delete('/:categoryId',   categoryController.deleteCategory);

export default router;
