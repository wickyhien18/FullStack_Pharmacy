
import { Router } from 'express';
import * as manufacturerController from '../controllers/manufacturer.controller.js';
import { cacheResponse } from '../middlewares/cache.middleware.js';

const router = Router();

// Public — used to populate manufacturer dropdowns
router.get('/', cacheResponse(600), manufacturerController.getManufacturers);

// Admin only
router.post('/',                       manufacturerController.createManufacturer);
router.put('/:manufacturerId',         manufacturerController.updateManufacturer);
router.delete('/:manufacturerId',      manufacturerController.deleteManufacturer);

export default router;
