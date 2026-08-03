import * as manufacturerService from '../services/manufacturer.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// GET /api/manufacturers
export const getManufacturers = async (req, res) => {
  try {
    const data = await manufacturerService.getManufacturers();
    return sendSuccess(res, data, 'Manufacturers retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/manufacturers
export const createManufacturer = async (req, res) => {
  try {
    const data = await manufacturerService.createManufacturer(req.body);
    return sendSuccess(res, data, 'Manufacturer created successfully', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/manufacturers/:manufacturerId
export const updateManufacturer = async (req, res) => {
  try {
    const data = await manufacturerService.updateManufacturer(
      req.params.manufacturerId, req.body
    );
    return sendSuccess(res, data, 'Manufacturer updated successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// DELETE /api/manufacturers/:manufacturerId
export const deleteManufacturer = async (req, res) => {
  try {
    await manufacturerService.deleteManufacturer(req.params.manufacturerId);
    return sendSuccess(res, null, 'Manufacturer deleted successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
