// ================================================================
// payment.controller.js
// Đặt tại: src/controllers/payment.controller.js
// ================================================================
import * as paymentService from "../services/payment.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getIpAddr = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "127.0.0.1"
  );
};

// POST /api/payment/vnpay/create — Tạo URL thanh toán VNPAY
export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return sendError(res, "Thiếu orderId", 400);
    const data = await paymentService.createVNPayPayment(
      orderId,
      req.user.userId,
      getIpAddr(req),
    );
    return sendSuccess(res, data, "Tạo URL thanh toán thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/payment/vnpay/callback — VNPAY redirect về sau thanh toán
export const vnpayCallback = async (req, res) => {
  try {
    const result = await paymentService.handleVNPayCallback(req.query);
    // Redirect về frontend với kết quả
    return res.redirect(result.redirectUrl);
  } catch (err) {
    console.error("[VNPAY Callback] Error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL}/account?tab=orders&payment=error`
    );
  }
};

// POST /api/payment/cod — Chọn COD
export const createCODPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return sendError(res, "Thiếu orderId", 400);
    const data = await paymentService.createCODPayment(orderId, req.user.userId);
    return sendSuccess(res, data, "Xác nhận thanh toán COD thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/payment/order/:orderId — Lấy thông tin payment
export const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await paymentService.getPaymentByOrder(orderId, req.user.userId);
    return sendSuccess(res, data, "Lấy thông tin thanh toán thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
