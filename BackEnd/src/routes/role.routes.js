
import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Admin only
router.get('/', authenticate, authorize('ROLE_ADMIN'), roleController.getRoles);

export default router;
