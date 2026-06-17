// ================================================================
// order.controller.js
// ================================================================
import * as orderService from "../services/order.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, note } = req.body;
    const data = await orderService.createOrder(req.user.userId, {
      shippingAddress,
      note,
    });
    return sendSuccess(res, data, "Đặt hàng thành công", 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const data = await orderService.getMyOrders(req.user.userId, {
      page,
      limit,
      skip,
    });
    return sendSuccess(res, data, "Lấy lịch sử đơn hàng thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/orders/:orderId
export const getOrderDetail = async (req, res) => {
  try {
    const data = await orderService.getOrderDetail(
      req.params.orderId,
      req.user.userId,
    );
    return sendSuccess(res, data, "Lấy chi tiết đơn hàng thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
