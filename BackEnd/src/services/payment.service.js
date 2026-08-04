import { prisma } from "../config/prisma.config.js";
import * as orderRepo from "../repositories/order.repository.js";
import * as cartRepo from "../repositories/cart.repository.js";
import * as payRepo from "../repositories/payment.repository.js";
import { createVNPayUrl, verifyVNPayReturn } from "../utils/vnpay.util.js";
import { env } from "../config/env.config.js";

//── CREATE VNPAY PAYMENT URL ─────────────────────────────────────
export const createVNPayPayment = async (orderId, userId, ipAddr) => {
  // Verify the order exists and belongs to this user.
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Order not found" };
  if (order.paymentStatus === "PAID")
    throw { status: 400, message: "Order has already been paid" };
  if (order.orderStatus === "CANCELLED")
    throw { status: 400, message: "Order has been cancelled" };

  // Create or update the payment record.
  const existPayment = await payRepo.existingPayment(BigInt(orderId));

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  if (!existPayment) {
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
    // Increase attempt count when the user retries payment.
    await prisma.payment.update({
      where: { paymentId: existingPayment.paymentId },
      data: { expiredAt, attemptCount: { increment: 1 } },
    });
  }

  // Create VNPAY URL.
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

//── HANDLE VNPAY CALLBACK ────────────────────────────────────────
export const handleVNPayCallback = async (vnpParams) => {
  const {
    isValid,
    responseCode,
    orderCode,
    amount,
    transactionCode,
    rawCallback,
  } = verifyVNPayReturn(vnpParams);

  // Find order by orderCode.
  const order = await prisma.order.findFirst({
    where: { orderCode },
  });
  if (!order) throw { status: 404, message: "Order not found" };

  const isSuccess = isValid && responseCode === "00";

  // Update payment record.
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
    // Update order payment status.
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

//── CREATE COD PAYMENT RECORD ────────────────────────────────────
// When user selects COD, create a PENDING payment record immediately; money is collected on delivery.
export const createCODPayment = async (orderId, userId) => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Order not found" };

  // Check whether the order already has a payment method.
  const existing = await prisma.payment.findFirst({
    where: { orderId: BigInt(orderId) },
  });
  if (existing)
    throw { status: 400, message: "Order already has a payment method" };

  await prisma.payment.create({
    data: {
      orderId: BigInt(orderId),
      paymentMethod: "COD",
      amount: order.totalPrice,
      status: "PENDING", // COD remains pending until delivery.
    },
  });

  // COD is confirmed once selected, so clear the cart here.
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (cart) await cartRepo.clearCart(cart.cartId);

  return { message: "COD payment confirmed", orderCode: order.orderCode };
};

//── GET ORDER PAYMENT INFO ───────────────────────────────────────
export const getPaymentByOrder = async (orderId, userId) => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Order not found" };

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
