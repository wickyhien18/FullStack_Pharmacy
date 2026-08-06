import * as notificationRepo from "../repositories/notification.repository.js";
import { getIO } from "../config/socket.config.js";
import { sendOrderStatusEmail } from "./email.service.js";

// Only these statuses notify customers; PENDING is created by the customer, so no reminder is needed.
const STATUS_MESSAGES = {
  CONFIRMED: "Đơn hàng của bạn đã được xác nhận và đang được đóng gói",
  SHIPPING: "Đơn hàng của bạn đang được giao đến bạn",
  DELIVERED: "Đơn hàng của bạn đã giao thành công",
  CANCELLED: "Đơn hàng của bạn đã bị huỷ",
};

//── NOTIFY ORDER STATUS CHANGE ──────────────────────────────────
export const notifyOrderStatusChange = async (order) => {
  const baseMessage = STATUS_MESSAGES[order.orderStatus];
  if (!baseMessage) return;

  const message = `${baseMessage} (Order code: ${order.orderCode})`;

  // 1. Save to DB so customers can review notifications later, even if they were offline.
  await notificationRepo.createNotification(
    order.userId,
    order.orderId,
    message,
  );

  // 2. Push real-time updates without blocking the main status update flow.
  try {
    getIO().to(`user:${order.userId}`).emit("order:status_changed", {
      orderId: order.orderId.toString(),
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      message,
    });
  } catch (err) {
    console.error("[Socket] Emit failed:", err.message);
  }

  // 3. Send email without failing the main API if email delivery fails.
  if (order.user?.email) {
    try {
      await sendOrderStatusEmail(
        order.user.email,
        order.user.fullName,
        order.orderCode,
        baseMessage,
      );
    } catch (err) {
      console.error("[Email] Failed to send status notification:", err.message);
    }
  }
};

//── GET MY NOTIFICATIONS ────────────────────────────────────────
export const getMyNotifications = async (userId) => {
  const items = await await notificationRepo.getNotification(
    BigInt(userId),
    20,
  );
  return items.map((n) => ({
    notificationId: n.notificationId.toString(),
    orderId: n.orderId?.toString() || null,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
};

//── MARK ALL NOTIFICATIONS AS READ ──────────────────────────────
export const markAllRead = async (userId) => {
  await notificationRepo.updateMarkAllRead(BigInt(userId));
};
