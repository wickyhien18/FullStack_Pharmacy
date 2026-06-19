
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/',      categoryController.getCategories);
router.get('/count', categoryController.getCategoriesWithCount);

// Admin only
router.post('/',                categoryController.createCategory);
router.put('/:categoryId',      categoryController.updateCategory);
router.delete('/:categoryId',   categoryController.deleteCategory);

export default router;
