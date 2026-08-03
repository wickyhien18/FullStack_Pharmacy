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
    return sendSuccess(res, data, "Order created successfully", 201);
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
    return sendSuccess(res, data, "Order history retrieved successfully");
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
    return sendSuccess(res, data, "Order detail retrieved successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/orders/:orderId/cancel — user cancels an order
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await orderService.cancelOrder(
      req.params.orderId,
      req.user.userId,
      reason,
    );
    return sendSuccess(res, result, result.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
