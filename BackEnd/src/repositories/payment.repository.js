import { prisma } from "../config/prisma.config.js";

//== EXISTING PAYMENT =======================================
export const existingPayment = (orderId) => {
  return prisma.payment.findFirst({
    where: {
      orderId,
      paymentMethod: "VNPAY",
      status: "PENDING",
    },
  });
};
