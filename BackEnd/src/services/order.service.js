import { prisma } from "../config/prisma.config.js";
import * as orderRepo from "../repositories/order.repository.js";
import * as cartRepo from "../repositories/cart.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${date}-${random}`;
};

const formatOrder = (order) => ({
  orderId: order.orderId.toString(),
  orderCode: order.orderCode,
  totalPrice: Number(order.totalPrice),
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  shippingAddress: order.shippingAddress,
  note: order.note,
  createdAt: order.createdAt,
  items: order.items?.map((i) => ({
    orderItemId: i.orderItemId.toString(),
    productName: i.product?.name || "Product no longer exists",
    productUnit: i.product?.unit || "Box",
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  })),
});

// ── Create Order ──────────────────────────────────────────────────
export const createOrder = async (userId, { shippingAddress, note }) => {
  if (!shippingAddress)
    throw { status: 400, message: "Please enter a shipping address" };

  // Load cart from DB instead of trusting client-submitted items.
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Cart not found" };
  if (!cart.items.length) throw { status: 400, message: "Cart is empty" };

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + Number(item.productPrice) * item.itemQuantity,
    0,
  );

  const order = await orderRepo.createOrder({
    userId: BigInt(userId),
    orderCode: generateOrderCode(),
    items: cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.itemQuantity,
    })),
    shippingAddress,
    note,
    totalPrice,
  });

  return {
    orderId: order.orderId.toString(),
    orderCode: order.orderCode,
    totalPrice,
  };
};

export const getMyOrders = async (userId, { page, limit, skip }) => {
  const [orders, total] = await Promise.all([
    orderRepo.findOrdersByUser(BigInt(userId), { skip, limit }),
    orderRepo.countOrdersByUser(BigInt(userId)),
  ]);
  return buildPaginatedResponse(orders.map(formatOrder), total, page, limit);
};

export const getOrderDetail = async (orderId, userId) => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Order not found" };
  return formatOrder(order);
};

export const cancelOrder = async (orderId, userId, reason = "") => {
  const order = await orderRepo.findOrderByUserIdAndOrderId(
    BigInt(orderId),
    BigInt(userId),
  );
  if (!order) throw { status: 404, message: "Order not found" };

  const { orderStatus } = order;

  if (orderStatus === "PENDING" || orderStatus === "CONFIRMED") {
    await orderRepo.handleCancelOrderPending(BigInt(order.orderId), reason);

    return { message: "Order cancelled successfully", status: "CANCELLED" };
  }

  if (orderStatus === "SHIPPING") {
    await orderRepo.cancelOrderShipping(BigInt(order.orderId), reason);

    return {
      message:
        "Cancellation request sent. Please wait for pharmacy confirmation.",
      status: "CANCEL_REQUESTED",
    };
  }

  if (orderStatus === "DELIVERED") {
    await orderRepo.cancelOrderDelivered(BigInt(order.orderId), reason);

    return {
      message: "Return request sent. Please wait for pharmacy confirmation.",
      status: "RETURN_REQUESTED",
    };
  }

  throw {
    status: 400,
    message: `Cannot cancel order in "${orderStatus}" status`,
  };
};

export const handleCancelRequest = async (
  orderId,
  action,
  rejectReason = "",
) => {
  const order = await orderRepo.findOrderById(BigInt(orderId));

  if (!order) throw { status: 404, message: "Order not found" };

  const { orderStatus } = order;

  if (
    orderStatus !== "CANCEL_REQUESTED" &&
    orderStatus !== "RETURN_REQUESTED"
  ) {
    throw {
      status: 400,
      message: "Order has no cancellation or return request",
    };
  }

  if (action === "approve") {
    // Admin approves: move to CANCELLED or RETURNED and restore inventory.
    const newStatus =
      orderStatus === "CANCEL_REQUESTED" ? "CANCELLED" : "RETURNED";

    if (orderStatus === "RETURN_REQUESTED") {
      // Return: update status, restore inventory, and record refund payment.
      await orderRepo.approveReturnOrder(
        BigInt(orderId),
        Number(order.totalPrice),
      );
    } else {
      // Cancel while shipping: update status and restore inventory, no refund because payment was not collected.
      await orderRepo.handleCancelOrderDelivedAndShipping(
        BigInt(orderId),
        newStatus,
      );
    }

    return {
      message: "Cancellation or return request approved",
      status: newStatus,
    };
  }

  if (action === "reject") {
    // Admin rejects: return to SHIPPING or DELIVERED.
    const previousStatus =
      orderStatus === "CANCEL_REQUESTED" ? "SHIPPING" : "DELIVERED";

    await orderRepo.rejectOrder(
      BigInt(order.orderId),
      previousStatus,
      rejectReason,
    );

    return {
      message: "Cancellation request rejected, order continues processing",
      status: previousStatus,
    };
  }

  throw {
    status: 400,
    message: "Invalid action. Only approve or reject is accepted",
  };
};
