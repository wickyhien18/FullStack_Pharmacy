// ================================================================
// admin.repository.js — Queries dành riêng cho admin
// ================================================================
import { prisma } from "../config/prisma.config.js";

// Thống kê tổng quan dashboard
export const getDashboardStats = async () => {
  // Promise.all: run 4 queries in parallel instead of sequentially -> approximately 4x faster
  const [totalOrders, totalUsers, totalProducts, revenueResult] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
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
export const findAllOrders = ({ skip, limit, status }) => {
  const where = status
    ? { orderStatus: { in: status.split(",").map((s) => s.trim()) } }
    : {};
  return prisma.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { userId: true, fullName: true, email: true } },
      items: {
        select: { quantity: true, product: { select: { name: true } } },
      },
    },
  });
};

export const countAllOrders = (status) => {
  const where = status
    ? { orderStatus: { in: status.split(",").map((s) => s.trim()) } }
    : {};
  return prisma.order.count({ where });
};

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

export const findAllRoles = () => {
  return prisma.role.findMany({ orderBy: { roleName: "asc" } });
};

export const existRole = (name) => {
  return prisma.role.findUnique({ where: { roleName: name } });
};

export const updateUserRole = (userId, roleId) => {
  return prisma.user.update({
    where: { userId: BigInt(userId) },
    data: { roleId },
    include: { role: true },
  });
};

// Lấy tất cả products (admin thấy cả inactive)
export const findAllproducts = ({ skip, limit }) => {
  return prisma.product.findMany({
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

export const existproduct = (id) => {
  return prisma.product.findUnique({
    where: { productId: BigInt(id) },
  });
};

// Tạo inventory record cho product mới
export const createInventory = (data) => {
  return prisma.inventory.create({ data });
};

export const createOrUpdateInventory = (productId, stock) => {
  return prisma.inventory.upsert({
    where: { productId: BigInt(productId) },
    update: { quantity: parseInt(stock) },
    create: { productId: BigInt(productId), quantity: parseInt(stock) },
  });
};

export const countAllproducts = () => {
  return prisma.product.count({ where: { deletedAt: null } });
};
