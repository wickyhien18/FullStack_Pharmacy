import { prisma } from "../config/prisma.config.js";

//== GET NOTIFICATION =======================================
export const getNotification = (userId, take) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
};

//== CREATE NOTIFICATION =======================================
export const createNotification = (userId, orderId, message) => {
  return prisma.notification.create({
    data: { userId, orderId, message },
  });
};

//== UPDATE MARK ALL READ =======================================
export const updateMarkAllRead = (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
