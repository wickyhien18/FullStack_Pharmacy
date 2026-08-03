import { prisma } from "../config/prisma.config.js";

//── DASHBOARD STATS ────────────────────────────────────────────────
export const getDashboardStats = async () => {
  // Promise.all: run 4 queries in parallel instead of sequentially -> approximately 4x faster
  const [totalOrders, totalUsers, totalProducts, revenueResult] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      // Get revenue from successful delivered orders
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

//── ORDERS ────────────────────────────────────────────────
//== FIND ALL ORDERS =======================================
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

//== FIND ORDER BY ORERID =======================================
export const findOrderByOrderId = (orderId) => {
  return prisma.order.findUnique({
    where: { orderId },
    include: {
      user: { select: { userId: true, email: true, fullName: true } },
    },
  });
};

//== COUNT ALL ORDERS =======================================
export const countAllOrders = (status) => {
  const where = status
    ? { orderStatus: { in: status.split(",").map((s) => s.trim()) } }
    : {};
  return prisma.order.count({ where });
};

//== UPDATE ORDER STATUS =======================================
export const updateOrderStatus = (orderId, orderStatus) => {
  return prisma.order.update({
    where: { orderId },
    data: { orderStatus },
  });
};

//── USERS ────────────────────────────────────────────────
//== FIND ALL USERS =======================================
export const findAllUsers = ({ skip, limit }) => {
  return prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { deletedAt: null },
    include: { role: true },
  });
};

//== COUNT ALL USERS =======================================
export const countAllUsers = () =>
  prisma.user.count({ where: { deletedAt: null } });

//== UPDATE USER STATUS =======================================
export const updateUserStatus = (userId, isActive) => {
  return prisma.user.update({ where: { userId }, data: { isActive } });
};

//== FIND ALL ROLES =======================================
export const findAllRoles = () => {
  return prisma.role.findMany({ orderBy: { roleName: "asc" } });
};

//== EXIST ROLE =======================================
export const existRole = (name) => {
  return prisma.role.findUnique({ where: { roleName: name } });
};

//== UPDATE USER ROLE =======================================
export const updateUserRole = (userId, roleId) => {
  return prisma.user.update({
    where: { userId: BigInt(userId) },
    data: { roleId },
    include: { role: true },
  });
};

//── PRODUCTS ────────────────────────────────────────────────
//== FIND ALL PRODUCTS =======================================
export const findAllProducts = ({ skip, limit }) => {
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

//== EXIST PRODUCT =======================================
export const existProduct = (id) => {
  return prisma.product.findUnique({
    where: { productId: BigInt(id) },
  });
};

//== CREATE INVENTORY =======================================
export const createInventory = (data) => {
  return prisma.inventory.create({ data });
};

//== CREATE OR UPDATE INVENTORY =======================================
export const createOrUpdateInventory = (productId, stock) => {
  return prisma.inventory.upsert({
    where: { productId: BigInt(productId) },
    update: { quantity: parseInt(stock) },
    create: { productId: BigInt(productId), quantity: parseInt(stock) },
  });
};

//== COUNT ALL PRODUCTS =======================================
export const countAllProducts = () => {
  return prisma.product.count({ where: { deletedAt: null } });
};
