// ================================================================
// payment.service.js — Business logic thanh toán
// Đặt tại: src/services/payment.service.js
// ================================================================
import { prisma } from "../config/prisma.config.js";
import * as orderRepo from "../repositories/order.repository.js";
import * as cartRepo from "../repositories/cart.repository.js"; // thêm import
import { createVNPayUrl, verifyVNPayReturn } from "../utils/vnpay.util.js";
import { env } from "../config/env.config.js";

// ── Tạo URL thanh toán VNPAY ──────────────────────────────────────
export const createVNPayPayment = async (orderId, userId, ipAddr) => {
  // Kiểm tra đơn hàng tồn tại và thuộc về user này
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };
  if (order.paymentStatus === "PAID")
    throw { status: 400, message: "Đơn hàng đã được thanh toán" };
  if (order.orderStatus === "CANCELLED")
    throw { status: 400, message: "Đơn hàng đã bị huỷ" };

  // Tạo/cập nhật bản ghi payment
  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: BigInt(orderId),
      paymentMethod: "VNPAY",
      status: "PENDING",
    },
  });

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: BigInt(orderId),
        paymentMethod: "VNPAY",
        amount: order.totalPrice,
        status: "PENDING",
        expiredAt,
        attemptCount: 1,
      },
    });
  } else {
    // Tăng attempt count nếu user thử lại
    await prisma.payment.update({
      where: { paymentId: existingPayment.paymentId },
      data: { expiredAt, attemptCount: { increment: 1 } },
    });
  }

  // Tạo URL VNPAY
  const returnUrl = `${env.BACKEND_URL}/api/payment/vnpay/callback`;
  const payUrl = createVNPayUrl({
    orderId,
    orderCode: order.orderCode,
    amount: Number(order.totalPrice),
    orderInfo: `Thanh toan don hang ${order.orderCode}`,
    ipAddr: ipAddr || "127.0.0.1",
    returnUrl,
  });

  return {
    payUrl,
    orderCode: order.orderCode,
    amount: Number(order.totalPrice),
  };
};

// ── Xử lý callback từ VNPAY ──────────────────────────────────────
export const handleVNPayCallback = async (vnpParams) => {
  const {
    isValid,
    responseCode,
    orderCode,
    amount,
    transactionCode,
    rawCallback,
  } = verifyVNPayReturn(vnpParams);

  // Tìm đơn hàng theo orderCode
  const order = await prisma.order.findFirst({
    where: { orderCode },
  });
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };

  const isSuccess = isValid && responseCode === "00";

  // Cập nhật Payment record
  await prisma.payment.updateMany({
    where: {
      orderId: order.orderId,
      paymentMethod: "VNPAY",
      status: "PENDING",
    },
    data: {
      status: isSuccess ? "SUCCESS" : "FAILED",
      transactionCode: transactionCode || null,
      paidAt: isSuccess ? new Date() : null,
      rawCallback: rawCallback,
    },
  });

  if (isSuccess) {
    // Cập nhật paymentStatus của đơn hàng
    await prisma.order.update({
      where: { orderId: order.orderId },
      data: { paymentStatus: "PAID" },
    });

    if (order.userId) {
      const cart = await cartRepo.findCartByUserId(order.userId);
      if (cart) await cartRepo.clearCart(cart.cartId);
    }
  }

  return {
    isSuccess,
    orderCode,
    amount,
    responseCode,
    redirectUrl: isSuccess
      ? `${env.CLIENT_URL}/checkout?payment=success&order=${orderCode}`
      : `${env.CLIENT_URL}/checkout?payment=failed&order=${orderCode}`,
  };
};

// ── Tạo COD payment record ─────────────────────────────────────────
// Khi user chọn COD → tạo payment record ngay (status PENDING, chỉ thu tiền khi giao)
export const createCODPayment = async (orderId, userId) => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };

  // Kiểm tra đã có payment chưa
  const existing = await prisma.payment.findFirst({
    where: { orderId: BigInt(orderId) },
  });
  if (existing)
    throw { status: 400, message: "Đơn hàng đã có phương thức thanh toán" };

  await prisma.payment.create({
    data: {
      orderId: BigInt(orderId),
      paymentMethod: "COD",
      amount: order.totalPrice,
      status: "PENDING", // COD = pending cho đến khi giao hàng
    },
  });

  // COD coi như "chốt" ngay lúc chọn phương thức → xoá cart ở đây
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (cart) await cartRepo.clearCart(cart.cartId);

  return { message: "Đã xác nhận thanh toán COD", orderCode: order.orderCode };
};

// ── Lấy payment info của đơn hàng ────────────────────────────────
export const getPaymentByOrder = async (orderId, userId) => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };

  const payment = await prisma.payment.findFirst({
    where: { orderId: BigInt(orderId) },
    orderBy: { createdAt: "desc" },
  });

  return payment
    ? {
        paymentId: payment.paymentId.toString(),
        paymentMethod: payment.paymentMethod,
        amount: Number(payment.amount),
        status: payment.status,
        transactionCode: payment.transactionCode,
        paidAt: payment.paidAt,
      }
    : null;
};
