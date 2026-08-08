
import { Router } from 'express';
import * as manufacturerController from '../controllers/manufacturer.controller.js';
import { cacheResponse } from '../middlewares/cache.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();
const adminOnly = authorize('ROLE_ADMIN');

// Public — used to populate manufacturer dropdowns
router.get('/', cacheResponse(600), manufacturerController.getManufacturers);

// Admin only
router.post('/',                  authenticate, adminOnly, manufacturerController.createManufacturer);
router.put('/:manufacturerId',    authenticate, adminOnly, manufacturerController.updateManufacturer);
router.delete('/:manufacturerId', authenticate, adminOnly, manufacturerController.deleteManufacturer);

export default router;
