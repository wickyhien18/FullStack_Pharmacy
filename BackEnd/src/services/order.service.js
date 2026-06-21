// ================================================================
// order.service.js — v2, khớp 100% với schema hiện tại
// ================================================================
import { prisma } from "../config/prisma.js";
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
    // Lấy từ relation thay vì column snapshot (không có trong schema)
    medicineName: i.medicine?.name || "Sản phẩm không còn tồn tại",
    medicineUnit: i.medicine?.unit || "Hộp",
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  })),
});

// ── Create Order ──────────────────────────────────────────────────
export const createOrder = async (userId, { shippingAddress, note }) => {
  if (!shippingAddress)
    throw { status: 400, message: "Vui lòng nhập địa chỉ giao hàng" };

  // Lấy cart từ DB — không tin client gửi items
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };
  if (!cart.items.length) throw { status: 400, message: "Giỏ hàng trống" };

  // Tính tổng tiền từ DB — không tin client gửi giá
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + Number(item.medicine.price) * item.quantity,
    0,
  );

  const order = await orderRepo.createOrder({
    userId: BigInt(userId),
    orderCode: generateOrderCode(),
    items: cart.items.map((i) => ({
      medicineId: i.medicineId,
      quantity: i.quantity,
    })),
    shippingAddress,
    note,
    totalPrice,
    // paymentMethod bỏ vì không có trong schema
  });

  // Xoá cart sau khi đặt hàng thành công
  await cartRepo.clearCart(cart.cartId);

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
  const order = await orderRepo.findOrderById(BigInt(orderId), BigInt(userId));
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };
  return formatOrder(order);
};

export const cancelOrder = async (orderId, userId, reason = "") => {
  const order = await orderRepo.findOrderById(BigInt(orderId), BigInt(userId));
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };

  const { orderStatus } = order;

  if (orderStatus === "PENDING" || orderStatus === "CONFIRMED") {
    await orderRepo.handleCancelOrderPending(order.orderId, reason);

    return { message: "Đơn hàng đã được huỷ thành công", status: "CANCELLED" };
  }

  if ()
};
