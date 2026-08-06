import { prisma } from "../config/prisma.config.js";

export const getNotification = (userId, take) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
};

export const createNotification = (userId, orderId, message) => {
  return prisma.notification.create({
    data: { userId, orderId, message },
  });
};

export const updateMarkAllRead = (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
