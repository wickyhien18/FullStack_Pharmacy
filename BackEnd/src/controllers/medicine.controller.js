
// ================================================================
// medicine.controller.js
// ================================================================
import * as medicineService from '../services/medicine.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

// GET /api/medicines
export const getMedicines = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { search, categoryId, sort } = req.query;
    const data = await medicineService.getMedicines({ page, limit, skip, search, categoryId, sort });
    return sendSuccess(res, data, 'Lấy danh sách thuốc thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/medicines/:slug
export const getMedicineBySlug = async (req, res) => {
  try {
    const data = await medicineService.getMedicineBySlug(req.params.slug);
    return sendSuccess(res, data, 'Lấy thông tin thuốc thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
