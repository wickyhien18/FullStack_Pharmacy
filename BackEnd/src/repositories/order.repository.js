// ================================================================
// order.repository.js — Truy vấn DB cho orders
// ================================================================
import { prisma } from "../config/prisma.js";

// Tạo đơn hàng + order items trong 1 transaction
// Transaction: đảm bảo nếu 1 bước lỗi thì rollback toàn bộ
export const createOrder = async ({
  userId,
  orderCode,
  items,
  shippingAddress,
  paymentMethod,
  note,
  totalPrice,
}) => {
  return prisma.$transaction(async (tx) => {
    // 1. Tạo order
    const order = await tx.order.create({
      data: {
        user: { connect: { userId } },
        orderCode,
        totalPrice,
        originalPrice: totalPrice,
        shippingAddress,
        paymentMethod,
        note,
        orderStatus: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // 2. Tạo order items + trừ tồn kho cho từng sản phẩm
    for (const item of items) {
      // Lấy thông tin medicine để snapshot tên + đơn vị
      const medicine = await tx.medicine.findUnique({
        where: { medicineId: item.medicineId },
        include: { inventory: true },
      });

      if (!medicine) throw new Error(`Sản phẩm không tồn tại`);
      if ((medicine.inventory?.quantity ?? 0) < item.quantity) {
        throw new Error(`Sản phẩm "${medicine.name}" không đủ hàng`);
      }

      // Tạo order item — snapshot tên + giá tại thời điểm đặt
      await tx.orderItem.create({
        data: {
          order: { connect: { orderId: order.orderId } },
          medicine: { connect: { medicineId: item.medicineId } },
          medicineName: medicine.name, // snapshot — không bị ảnh hưởng nếu tên thuốc đổi sau này
          medicineUnit: medicine.unit || "Hộp",
          quantity: item.quantity,
          unitPrice: medicine.price,
          totalPrice: Number(medicine.price) * item.quantity,
        },
      });

      // Trừ tồn kho
      await tx.inventory.update({
        where: { medicineId: item.medicineId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    return order;
  });
};

// Lấy lịch sử đơn hàng của user
export const findOrdersByUser = (userId, { skip, limit }) => {
  return prisma.order.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          orderItemId: true,
          medicine: { select: { name: true, unit: true } },
          quantity: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  });
};

export const countOrdersByUser = (userId) => {
  return prisma.order.count({ where: { userId } });
};

// Lấy chi tiết 1 đơn hàng
export const findOrderById = (orderId, userId) => {
  return prisma.order.findFirst({
    where: { orderId, userId }, // userId để chặn user xem đơn của người khác
    include: { items: true, payments: true, shipment: true },
  });
};
