import { prisma } from "../config/prisma.config.js";

// Helper for writing inventory logs inside a transaction.
const writeInventoryLog = async (
  tx,
  {
    productId,
    changeType, // "IMPORT" | "EXPORT" | "ADJUST"
    quantity, // Changed quantity, always positive.
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

//── ORDERS ──────────────────────────────────────────────────────
//== FIND ORDER BY ID =============================================
export const findOrderById = (orderId) => {
  return prisma.order.findUnique({
    where: { orderId },
  });
};

//== FIND ORDER BY ORDER CODE =======================================
export const findOrderByOrderCode = (orderCode) => {
  return prisma.order.findFirst({
    where: { orderCode },
  });
};

//== CREATE ORDER =================================================
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

      // Load all products and inventory once instead of querying inside the loop.
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
        if (!product) throw new Error("Product does not exist");

        const currentQty = product.inventory?.quantity ?? 0;
        if (currentQty < item.quantity) {
          throw new Error(
            `Product "${product.name}" does not have enough stock`,
          );
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
          note: `Stock exported for order ${order.orderCode}`,
        });
      }

      // Batch insert orderItems with one query instead of N create queries.
      await tx.orderItem.createMany({ data: orderItemsData });

      // Inventory updates are still per product, but Promise.all runs them in parallel.
      await Promise.all(inventoryUpdates);

      // Batch insert log
      await tx.inventoryLog.createMany({ data: logsData });

      return order;
    },
    { timeout: 30000, maxWait: 10000 },
  );
};

//== FIND ORDERS BY USER ==========================================
export const findOrdersByUser = (userId, { skip, limit }) => {
  return prisma.order.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          // Get name and unit through product relation because there are no snapshot columns.
          product: { select: { name: true, unit: true } },
        },
      },
    },
  });
};

//== COUNT ORDERS BY USER =========================================
export const countOrdersByUser = (userId) => {
  return prisma.order.count({ where: { userId } });
};

//== FIND ORDER BY USER ID AND ORDER ID ===========================
export const findOrderByUserIdAndOrderId = (orderId, userId) => {
  return prisma.order.findFirst({
    where: { orderId, userId },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      payments: true,
      shipment: true,
    },
  });
};

export const updateOrderPaymentStatus = (orderId) => {
  return prisma.order.update({
    where: { orderId },
    data: { paymentStatus: "PAID" },
  });
};

//== HANDLE CANCEL ORDER PENDING ==================================
export const handleCancelOrderPending = async (orderId, reason) => {
  return prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { orderId },
        data: {
          orderStatus: "CANCELLED",
          cancelledBy: "USER",
          cancelledReason: reason || "User cancelled the order",
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
          note: `Stock restored due to order cancellation`,
        });
      }

      await Promise.all(updates);
      await tx.inventoryLog.createMany({ data: logsData });
    },
    { timeout: 30000, maxWait: 10000 },
  );
};

//== CANCEL ORDER WHILE SHIPPING ==================================
export const cancelOrderShipping = (orderId, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: "CANCEL_REQUESTED",
      cancelledBy: "USER",
      cancelledReason: reason || "User requested cancellation during shipping",
    },
  });
};

//== CANCEL DELIVERED ORDER =======================================
export const cancelOrderDelivered = (orderId, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: "RETURN_REQUESTED",
      cancelledBy: "USER",
      cancelledReason: reason || "User requested a return",
    },
  });
};

//== HANDLE CANCELLED OR DELIVERED/SHIPPING RESTORE ===============
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
          note: `Stock restored due to order cancellation (${status})`,
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

//== REJECT ORDER CANCEL REQUEST ==================================
export const rejectOrder = (orderId, status, reason) => {
  return prisma.order.update({
    where: { orderId },
    data: {
      orderStatus: status,
      cancelledBy: null,
      cancelledReason: reason
        ? `Cancellation rejected: ${reason}`
        : "Cancellation request was rejected by the pharmacy",
    },
  });
};

//== APPROVE RETURN ORDER =========================================
// Handle returns: set status to RETURNED, restore inventory, and record refund.
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
          note: `Stock restored due to return`,
        });
      }

      await Promise.all(updates);
      await tx.inventoryLog.createMany({ data: logsData });

      // Record refund. This is a single query, so no extra optimization is needed.
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
