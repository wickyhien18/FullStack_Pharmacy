// ================================================================
// payment.routes.js
// Đặt tại: src/routes/payment.routes.js
// ================================================================
import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// VNPAY
router.post("/vnpay/create",    authenticate, paymentController.createVNPayPayment);
router.get("/vnpay/callback",   paymentController.vnpayCallback); // không cần auth — VNPAY gọi trực tiếp

// COD
router.post("/cod",             authenticate, paymentController.createCODPayment);

// Lấy thông tin payment
router.get("/order/:orderId",   authenticate, paymentController.getPaymentByOrder);

export default router;
