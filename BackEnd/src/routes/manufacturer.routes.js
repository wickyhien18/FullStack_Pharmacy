
import { Router } from 'express';
import * as manufacturerController from '../controllers/manufacturer.controller.js';

const router = Router();

// Public — frontend cần để hiển thị dropdown
router.get('/', manufacturerController.getManufacturers);

// Admin only
router.post('/',                       manufacturerController.createManufacturer);
router.put('/:manufacturerId',         manufacturerController.updateManufacturer);
router.delete('/:manufacturerId',      manufacturerController.deleteManufacturer);

export default router;
