
import * as manufacturerService from '../services/manufacturer.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getManufacturers = async (req, res) => {
  try {
    const data = await manufacturerService.getManufacturers();
    return sendSuccess(res, data, 'Lấy danh sách nhà sản xuất thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const createManufacturer = async (req, res) => {
  try {
    const data = await manufacturerService.createManufacturer(req.body);
    return sendSuccess(res, data, 'Tạo nhà sản xuất thành công', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const updateManufacturer = async (req, res) => {
  try {
    const data = await manufacturerService.updateManufacturer(
      req.params.manufacturerId, req.body
    );
    return sendSuccess(res, data, 'Cập nhật thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const deleteManufacturer = async (req, res) => {
  try {
    await manufacturerService.deleteManufacturer(req.params.manufacturerId);
    return sendSuccess(res, null, 'Xoá thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
