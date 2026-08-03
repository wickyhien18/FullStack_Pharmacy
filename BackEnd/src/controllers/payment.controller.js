import * as paymentService from "../services/payment.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getIpAddr = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "127.0.0.1"
  );
};

// POST /api/payment/vnpay/create — create a VNPAY payment URL
export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return sendError(res, "Missing orderId", 400);
    const data = await paymentService.createVNPayPayment(
      orderId,
      req.user.userId,
      getIpAddr(req),
    );
    return sendSuccess(res, data, "Payment URL created successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/payment/vnpay/callback — VNPAY redirects here after payment
export const vnpayCallback = async (req, res) => {
  try {
    const result = await paymentService.handleVNPayCallback(req.query);
    // Redirect to the client app with the payment result
    return res.redirect(result.redirectUrl);
  } catch (err) {
    console.error("[VNPAY Callback] Error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL}/account?tab=orders&payment=error`,
    );
  }
};

// POST /api/payment/cod — select COD payment
export const createCODPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return sendError(res, "Missing orderId", 400);
    const data = await paymentService.createCODPayment(
      orderId,
      req.user.userId,
    );
    return sendSuccess(res, data, "COD payment confirmed successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/payment/order/:orderId — get payment information
export const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await paymentService.getPaymentByOrder(
      orderId,
      req.user.userId,
    );
    return sendSuccess(res, data, "Payment information retrieved successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
