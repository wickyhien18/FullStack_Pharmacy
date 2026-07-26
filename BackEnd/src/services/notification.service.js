import { prisma } from "../config/prisma.js";
import { getIO } from "../config/socket.js";
import { sendOrderStatusEmail } from "./email.service.js";

// Chỉ những status này mới cần báo khách — PENDING thì khách vừa đặt, không cần báo lại
const STATUS_MESSAGES = {
  CONFIRMED: "Đơn hàng của bạn đã được xác nhận và đang được đóng gói",
  SHIPPING: "Đơn hàng của bạn đang được giao đến bạn",
  DELIVERED: "Đơn hàng của bạn đã giao thành công",
  CANCELLED: "Đơn hàng của bạn đã bị huỷ",
};

export const notifyOrderStatusChange = async (order) => {
  const baseMessage = STATUS_MESSAGES[order.orderStatus];
  if (!baseMessage) return;

  const message = `${baseMessage} (Mã đơn: ${order.orderCode})`;

  // 1. Lưu vào DB — để khách xem lại lịch sử thông báo kể cả khi offline lúc xảy ra
  await prisma.notification.create({
    data: { userId: order.userId, orderId: order.orderId, message },
  });

  // 2. Đẩy real-time — không throw nếu lỗi, tránh chặn luồng đổi status chính
  try {
    getIO().to(`user:${order.userId}`).emit("order:status_changed", {
      orderId: order.orderId.toString(),
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      message,
    });
  } catch (err) {
    console.error("[Socket] Emit thất bại:", err.message);
  }

  // 3. Gửi email — cũng không throw, tránh 1 email lỗi làm hỏng cả API đổi status
  if (order.user?.email) {
    try {
      await sendOrderStatusEmail(
        order.user.email,
        order.user.fullName,
        order.orderCode,
        baseMessage,
      );
    } catch (err) {
      console.error("[Email] Gửi thông báo status thất bại:", err.message);
    }
  }
};

export const getMyNotifications = async (userId) => {
  const items = await prisma.notification.findMany({
    where: { userId: BigInt(userId) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return items.map((n) => ({
    notificationId: n.notificationId.toString(),
    orderId: n.orderId?.toString() || null,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
};

export const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId: BigInt(userId), isRead: false },
    data: { isRead: true },
  });
};
