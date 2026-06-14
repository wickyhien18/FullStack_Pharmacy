// ================================================================
// admin.repository.js — Queries dành riêng cho admin
// ================================================================
import { prisma } from "../config/prisma.js";

// Thống kê tổng quan dashboard
export const getDashboardStats = async () => {
  // Promise.all: run 4 queries in parallel instead of sequentially -> approximately 4x faster
  const [totalOrders, totalUsers, totalProducts, revenueResult] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.medicine.count({ where: { deletedAt: null } }),
      // Tính tổng doanh thu từ đơn hàng đã giao thành công
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { orderStatus: "DELIVERED" },
      }),
    ]);

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue: Number(revenueResult._sum.totalPrice || 0),
  };
};

// Lấy tất cả đơn hàng (admin thấy hết)
export const findAllOrders = ({ skip, limit }) => {
  return prisma.order.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { userId: true, fullName: true, email: true } },
      items: {
        select: { quantity: true, medicine: { select: { name: true } } },
      },
    },
  });
};

export const countAllOrders = () => prisma.order.count();

// Cập nhật status đơn hàng
export const updateOrderStatus = (orderId, orderStatus) => {
  return prisma.order.update({
    where: { orderId },
    data: { orderStatus },
  });
};

// Lấy tất cả users
export const findAllUsers = ({ skip, limit }) => {
  return prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { deletedAt: null },
    include: { role: true },
  });
};

export const countAllUsers = () =>
  prisma.user.count({ where: { deletedAt: null } });

// Khoá/mở khoá user
export const updateUserStatus = (userId, isActive) => {
  return prisma.user.update({ where: { userId }, data: { isActive } });
};

// Lấy tất cả medicines (admin thấy cả inactive)
export const findAllMedicines = ({ skip, limit }) => {
  return prisma.medicine.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { deletedAt: null },
    include: {
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
};

export const countAllMedicines = () => {
  return prisma.medicine.count({ where: { deletedAt: null } });
};
