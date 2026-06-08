// ================================================================
// order.repository.js — v2, khớp 100% với schema hiện tại
// Bỏ: originalPrice, paymentMethod (Order không có)
// Bỏ: medicineName, medicineUnit (OrderItem không có)
// ================================================================
import { prisma } from "../config/prisma.js";

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

export const findOrdersByUser = (userId, { skip, limit }) => {
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

export const countOrdersByUser = (userId) => {
  return prisma.order.count({ where: { userId } });
};

export const findOrderById = (orderId, userId) => {
  return prisma.order.findFirst({
    where: { orderId, userId },
    include: {
      items: { include: { medicine: { select: { name: true, unit: true } } } },
      payments: true,
      shipment: true,
    },
  });
};
