// ================================================================
// order.repository.js — v2, khớp 100% với schema hiện tại
// Bỏ: originalPrice, paymentMethod (Order không có)
// Bỏ: productName, productUnit (OrderItem không có)
// ================================================================
import { prisma } from "../config/prisma.js";

// Helper ghi inventory log trong transaction
const writeInventoryLog = async (
  tx,
  {
    productId,
    changeType, // "IMPORT" | "EXPORT" | "ADJUST"
    quantity, // số lượng thay đổi (luôn dương)
    previousQuantity,
    newQuantity,
    referenceId, // orderId
    note,
  },
) => {
  await tx.inventoryLog.create({
    data: {
      productId,
      changeType,
      quantity,
      previousQuantity,
      newQuantity,
      referenceId,
      note,
    },
  });
};

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
  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.create({
        data: {
          user: { connect: { userId } },
          orderCode,
          totalPrice,
          shippingAddress,
          note,
          orderStatus: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      // Lấy hết product + inventory 1 lần, không query lặp trong loop
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { productId: { in: productIds } },
        include: { inventory: true },
      });
      const productMap = new Map(
        products.map((p) => [p.productId.toString(), p]),
      );

      const orderItemsData = [];
      const inventoryUpdates = [];
      const logsData = [];

      for (const item of items) {
        const product = productMap.get(item.productId.toString());
        if (!product) throw new Error("Sản phẩm không tồn tại");

        const currentQty = product.inventory?.quantity ?? 0;
        if (currentQty < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" không đủ hàng`);
        }

        orderItemsData.push({
          orderId: order.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: Number(product.price) * item.quantity,
        });

        const newQty = currentQty - item.quantity;
        inventoryUpdates.push(
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          }),
        );

        logsData.push({
          productId: item.productId,
          changeType: "EXPORT",
          quantity: item.quantity,
          previousQuantity: currentQty,
          newQuantity: newQty,
          referenceId: order.orderId,
          note: `Xuất kho cho đơn hàng ${order.orderCode}`,
        });
      }

      // Batch insert orderItems — 1 query thay vì N query create riêng
      await tx.orderItem.createMany({ data: orderItemsData });

      // Inventory update vẫn phải chạy riêng từng cái (mỗi product khác where), nhưng dùng Promise.all để chạy song song thay vì tuần tự
      await Promise.all(inventoryUpdates);

      // Batch insert log
      await tx.inventoryLog.createMany({ data: logsData });

      return order;
    },
    { timeout: 30000, maxWait: 10000 },
  );
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
          // Lấy tên + đơn vị qua relation product vì không có snapshot column
          product: { select: { name: true, unit: true } },
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
      items: { include: { product: { select: { name: true, unit: true } } } },
      payments: true,
      shipment: true,
    },
  });
};

export const handleCancelOrderPending = async (orderId, reason) => {
  return prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { orderId },
        data: {
          orderStatus: "CANCELLED",
          cancelledBy: "USER",
          cancelledReason: reason || "Người dùng huỷ đơn",
          cancelledAt: new Date(),
        },
      });

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const productIds = items.map((i) => i.productId);

      const inventories = await tx.inventory.findMany({
        where: { productId: { in: productIds } },
      });
      const invMap = new Map(
        inventories.map((i) => [i.productId.toString(), i.quantity]),
      );

      const updates = [];
      const logsData = [];

      for (const item of items) {
        const currentQty = invMap.get(item.productId.toString()) ?? 0;
        const newQty = currentQty + item.quantity;

        updates.push(
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          }),
        );

        logsData.push({
          productId: item.productId,
          changeType: "IMPORT",
          quantity: item.quantity,
          previousQuantity: currentQty,
          newQuantity: newQty,
          referenceId: orderId,
          note: `Hoàn kho do huỷ đơn hàng`,
        });
      }

      await Promise.all(updates);
      await tx.inventoryLog.createMany({ data: logsData });
    },
    { timeout: 30000, maxWait: 10000 },
  );
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
  return prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { orderId },
        data: { orderStatus: status, cancelledAt: new Date() },
      });

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const productIds = items.map((i) => i.productId);

      const inventories = await tx.inventory.findMany({
        where: { productId: { in: productIds } },
      });
      const invMap = new Map(
        inventories.map((i) => [i.productId.toString(), i.quantity]),
      );

      const updates = [];
      const logsData = [];

      for (const item of items) {
        const currentQty = invMap.get(item.productId.toString()) ?? 0;
        const newQty = currentQty + item.quantity;

        updates.push(
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          }),
        );

        logsData.push({
          productId: item.productId,
          changeType: "IMPORT",
          quantity: item.quantity,
          previousQuantity: currentQty,
          newQuantity: newQty,
          referenceId: orderId,
          note: `Hoàn kho do huỷ đơn hàng (${status})`,
        });
      }

      await Promise.all(updates);
      await tx.inventoryLog.createMany({ data: logsData });
    },
    {
      timeout: 30000,
      maxWait: 10000,
    },
  );
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
  return prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { orderId },
        data: {
          orderStatus: "RETURNED",
          cancelledAt: new Date(),
        },
      });

      const items = await tx.orderItem.findMany({ where: { orderId } });
      const productIds = items.map((i) => i.productId);

      const inventories = await tx.inventory.findMany({
        where: { productId: { in: productIds } },
      });
      const invMap = new Map(
        inventories.map((i) => [i.productId.toString(), i.quantity]),
      );

      const updates = [];
      const logsData = [];

      for (const item of items) {
        const currentQty = invMap.get(item.productId.toString()) ?? 0;
        const newQty = currentQty + item.quantity;

        updates.push(
          tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          }),
        );

        logsData.push({
          productId: item.productId,
          changeType: "IMPORT",
          quantity: item.quantity,
          previousQuantity: currentQty,
          newQuantity: newQty,
          referenceId: orderId,
          note: `Hoàn kho do hoàn hàng`,
        });
      }

      await Promise.all(updates);
      await tx.inventoryLog.createMany({ data: logsData });

      // Ghi nhận hoàn tiền — giữ nguyên, chỉ 1 query nên không cần tối ưu
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
    },
    {
      timeout: 30000,
      maxWait: 10000,
    },
  );
};
