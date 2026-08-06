import { prisma } from "../config/prisma.config.js";

export const findPaymentByOrderId = (orderId) => {
  return prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
};

//== EXISTING PAYMENT =======================================
export const existingVNPayment = (orderId) => {
  return prisma.payment.findFirst({
    where: {
      orderId,
      paymentMethod: "VNPAY",
      status: "PENDING",
    },
  });
};

export const existingPayment = (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
  });
};

export const createVNPayPayment = (orderId, totalPrice, expiredAt) => {
  return prisma.payment.create({
    data: {
      orderId,
      paymentMethod: "VNPAY",
      amount: totalPrice,
      status: "PENDING",
      expiredAt,
      attemptCount: 1,
    },
  });
};

export const createCODPayment = (orderId, totalPrice) => {
  return prisma.payment.create({
    data: {
      orderId,
      paymentMethod: "COD",
      amount: totalPrice,
      status: "PENDING",
    },
  });
};

export const retryVNPayment = (paymentId, expiredAt) => {
  return prisma.payment.update({
    where: { paymentId },
    data: { expiredAt, attemptCount: { increment: 1 } },
  });
};

export const updateVNPaymentRecord = (
  orderId,
  isSuccess,
  transactionCode,
  rawCallback,
) => {
  return prisma.payment.updateMany({
    where: {
      orderId,
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
};
