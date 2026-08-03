import { prisma } from "../config/prisma.config.js";
import { getIO } from "../config/socket.config.js";
import { sendOrderStatusEmail } from "./email.service.js";

// Only these statuses notify customers; PENDING is created by the customer, so no reminder is needed.
const STATUS_MESSAGES = {
  CONFIRMED: "Your order has been confirmed and is being packed",
  SHIPPING: "Your order is on the way",
  DELIVERED: "Your order has been delivered successfully",
  CANCELLED: "Your order has been cancelled",
};

//── NOTIFY ORDER STATUS CHANGE ──────────────────────────────────
export const notifyOrderStatusChange = async (order) => {
  const baseMessage = STATUS_MESSAGES[order.orderStatus];
  if (!baseMessage) return;

  const message = `${baseMessage} (Order code: ${order.orderCode})`;

  // 1. Save to DB so customers can review notifications later, even if they were offline.
  await prisma.notification.create({
    data: { userId: order.userId, orderId: order.orderId, message },
  });

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

//── MARK ALL NOTIFICATIONS AS READ ──────────────────────────────
export const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId: BigInt(userId), isRead: false },
    data: { isRead: true },
  });
};
