
import * as categoryService from '../services/category.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = async (req, res) => {
  try {
    const data = await categoryService.getCategories();
    return sendSuccess(res, data, 'Lấy danh mục thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const getCategoriesWithCount = async (req, res) => {
  try {
    const data = await categoryService.getCategoriesWithCount();
    return sendSuccess(res, data, 'Lấy danh mục cùng số lượng thuốc thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body);
    return sendSuccess(res, data, 'Tạo danh mục thành công', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const data = await categoryService.updateCategory(req.params.categoryId, req.body);
    return sendSuccess(res, data, 'Cập nhật danh mục thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    return sendSuccess(res, null, 'Xoá danh mục thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
