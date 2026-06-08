// ================================================================
// order.service.js — Business logic cho orders
// ================================================================
import { prisma } from "../config/prisma.js";
import * as orderRepo from "../repositories/order.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

// Tạo mã đơn hàng dạng: ORD-20240615-XXXXX
const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${date}-${random}`;
};

const formatOrder = (order) => ({
  orderId: order.orderId.toString(),
  orderCode: order.orderCode,
  totalPrice: Number(order.totalPrice),
  originalPrice: Number(order.originalPrice || order.totalPrice),
  discountAmount: Number(order.discountAmount || 0),
  paymentMethod: order.paymentMethod,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  shippingAddress: order.shippingAddress,
  note: order.note,
  createdAt: order.createdAt,
  items: order.items?.map((i) => ({
    orderItemId: i.orderItemId.toString(),
    medicineName: i.medicineName || "Sản phẩm không còn tồn tại",
    medicineUnit: i.medicineUnit,
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  })),
});

// Tạo đơn hàng
export const createOrder = async (
  userId,
  { items, shippingAddress, paymentMethod, note },
) => {
  if (!items?.length)
    throw { status: 400, message: "Đơn hàng không có sản phẩm" };
  if (!shippingAddress)
    throw { status: 400, message: "Vui lòng nhập địa chỉ giao hàng" };

  // Tính tổng tiền — lấy giá thật từ DB tránh client gửi giá giả
  const medicineIds = items.map((i) => BigInt(i.medicineId));
  const medicines = await prisma.medicine.findMany({
    where: { medicineId: { in: medicineIds }, deletedAt: null },
  });

  if (medicines.length !== items.length) {
    throw { status: 400, message: "Một số sản phẩm không tồn tại" };
  }

  const totalPrice = items.reduce((sum, item) => {
    const med = medicines.find((m) => m.medicineId === BigInt(item.medicineId));
    return sum + Number(med.price) * item.quantity;
  }, 0);

  const orderCode = generateOrderCode();

  const order = await orderRepo.createOrder({
    userId: BigInt(userId),
    orderCode,
    items: items.map((i) => ({ ...i, medicineId: BigInt(i.medicineId) })),
    shippingAddress,
    paymentMethod: paymentMethod || "COD",
    note,
    totalPrice,
  });

  return { orderId: order.orderId.toString(), orderCode, totalPrice };
};

// Lấy lịch sử đơn hàng
export const getMyOrders = async (userId, { page, limit, skip }) => {
  const [orders, total] = await Promise.all([
    orderRepo.findOrdersByUser(BigInt(userId), { skip, limit }),
    orderRepo.countOrdersByUser(BigInt(userId)),
  ]);
  return buildPaginatedResponse(orders.map(formatOrder), total, page, limit);
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId, userId) => {
  const order = await orderRepo.findOrderById(BigInt(orderId), BigInt(userId));
  if (!order) throw { status: 404, message: "Không tìm thấy đơn hàng" };
  return formatOrder(order);
};
