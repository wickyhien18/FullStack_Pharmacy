import * as categoryService from '../services/category.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const data = await categoryService.getCategories();
    return sendSuccess(res, data, 'Categories retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/categories/count
export const getCategoriesWithCount = async (req, res) => {
  try {
    const data = await categoryService.getCategoriesWithCount();
    return sendSuccess(res, data, 'Categories with product counts retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body);
    return sendSuccess(res, data, 'Category created successfully', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/categories/:categoryId
export const updateCategory = async (req, res) => {
  try {
    const data = await categoryService.updateCategory(req.params.categoryId, req.body);
    return sendSuccess(res, data, 'Category updated successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// DELETE /api/categories/:categoryId
export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
