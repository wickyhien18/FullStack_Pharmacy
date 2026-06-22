// ================================================================
// order.repository.js — v2, khớp 100% với schema hiện tại
// Bỏ: originalPrice, paymentMethod (Order không có)
// Bỏ: medicineName, medicineUnit (OrderItem không có)
// ================================================================
import { prisma } from "../config/prisma.js";

export const findOrderById = async (orderId) => {
  return prisma.order.findUnique({
    where: { orderId },
  });
};

export const createOrder = async ({
  userId,
  orderCode,
  items,
  shippingAddress,
  note,
  totalPrice,
}) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        user: { connect: { userId } },
        orderCode,
        totalPrice,
        shippingAddress,
        note,
        orderStatus: "PENDING",
        paymentStatus: "PENDING",
        // originalPrice  ← KHÔNG có trong schema → bỏ
        // paymentMethod  ← KHÔNG có trong schema → bỏ
      },
    });

    for (const item of items) {
      const medicine = await tx.medicine.findUnique({
        where: { medicineId: item.medicineId },
        include: { inventory: true },
      });

      if (!medicine) throw new Error("Sản phẩm không tồn tại");
      if ((medicine.inventory?.quantity ?? 0) < item.quantity) {
        throw new Error(`Sản phẩm "${medicine.name}" không đủ hàng`);
      }

      await tx.orderItem.create({
        data: {
          order: { connect: { orderId: order.orderId } },
          medicine: { connect: { medicineId: item.medicineId } },
          quantity: item.quantity,
          unitPrice: medicine.price,
          totalPrice: Number(medicine.price) * item.quantity,
          // medicineName ← KHÔNG có trong schema → bỏ
          // medicineUnit ← KHÔNG có trong schema → bỏ
        },
      });

      await tx.inventory.update({
        where: { medicineId: item.medicineId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    return order;
  });
};

export const findOrdersByUser = async (userId, { skip, limit }) => {
  return prisma.order.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          // Lấy tên + đơn vị qua relation medicine vì không có snapshot column
          medicine: { select: { name: true, unit: true } },
        },
      },
    },
  });
};

export const countOrdersByUser = async (userId) => {
  return prisma.order.count({ where: { userId } });
};

export const findOrderByUserIdAndOrderId = async (orderId, userId) => {
  return prisma.order.findFirst({
    where: { orderId, userId },
    include: {
      items: { include: { medicine: { select: { name: true, unit: true } } } },
      payments: true,
      shipment: true,
    },
  });
};

export const handleCancelOrderPending = async (orderId, reason) => {
  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: "CANCELLED",
        cancelledBy: "USER",
        cancelledReason: reason || "Người dùng huỷ đơn",
        cancelledAt: new Date(),
      },
    });

    const items = await tx.orderItem.findMany({
      where: { orderId },
    });

    for (const item of items) {
      await tx.inventory.update({
        where: { medicineId: item.medicineId },
        data: { quantity: { increment: item.quantity } },
      });
    }
  });
};

export const cancelOrderShipping = async (orderId, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: "CANCEL_REQUESTED",
      cancelledBy: "USER",
      cancelledReason: reason || "Người dùng yêu cầu huỷ khi đang giao",
    },
  });
};

export const cancelOrderDelivered = async (orderId, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: "RETURN_REQUESTED",
      cancelledBy: "USER",
      cancelledReason: reason || "Người dùng yêu cầu hoàn hàng",
    },
  });
};

export const handleCancelOrderDelivedAndShipping = async (orderId, status) => {
  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: status,
        cancelledAt: new Date(),
      },
    });

    // Hoàn lại tồn kho
    const items = await tx.orderItem.findMany({
      where: { orderId },
    });
    for (const item of items) {
      await tx.inventory.update({
        where: { medicineId: item.medicineId },
        data: { quantity: { increment: item.quantity } },
      });
    }
  });
};

export const rejectOrder = async (orderId, status, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: status,
      cancelledBy: null,
      cancelledReason: reason
        ? `Từ chối huỷ: ${reason}`
        : "Yêu cầu huỷ bị từ chối bởi nhà thuốc",
    },
  });
};

// Xử lý hoàn hàng: đổi status RETURNED + hoàn tồn kho + ghi nhận hoàn tiền
export const approveReturnOrder = async (orderId, totalPrice) => {
  return prisma.$transaction(async (tx) => {
    // 1. Đổi status đơn hàng → RETURNED
    await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: "RETURNED",
        cancelledAt: new Date(),
      },
    });

    // 2. Hoàn lại tồn kho
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await tx.inventory.update({
        where: { medicineId: item.medicineId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    // 3. Ghi nhận hoàn tiền vào bảng payments
    // Tìm payment gốc (nếu có) để lấy paymentMethod
    const existingPayment = await tx.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    await tx.payment.create({
      data: {
        orderId,
        paymentMethod: existingPayment?.paymentMethod || "COD",
        amount: totalPrice,
        status: "REFUNDED",
        paidAt: new Date(),
      },
    });
  });
};
