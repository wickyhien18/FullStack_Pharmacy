// ================================================================
// product.controller.js
// ================================================================
import * as productService from "../services/product.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { search, categoryId, sort, minPrice, maxPrice } = req.query;
    const data = await productService.getProducts({
      page,
      limit,
      skip,
      search,
      categoryId,
      sort,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    return sendSuccess(res, data, "Lấy danh sách thuốc thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const data = await productService.getProductBySlug(req.params.slug);
    return sendSuccess(res, data, "Lấy thông tin thuốc thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
