import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// VNPAY
router.post(
  "/vnpay/create",
  authenticate,
  paymentController.createVNPayPayment,
);
router.get("/vnpay/callback", paymentController.vnpayCallback); // No auth required; VNPAY calls this directly.

// COD
router.post("/cod", authenticate, paymentController.createCODPayment);

// Payment information
router.get(
  "/order/:orderId",
  authenticate,
  paymentController.getPaymentByOrder,
);

export default router;
