// ================================================================
// admin.service.js — Business logic cho admin
// ================================================================
import * as adminRepo from "../repositories/admin.repository.js";
import * as medicineRepo from "../repositories/medicine.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

// Dashboard stats
export const getDashboardStats = () => adminRepo.getDashboardStats();

// Danh sách đơn hàng
export const getAllOrders = async ({ page, limit, skip }) => {
  const [orders, total] = await Promise.all([
    adminRepo.findAllOrders({ skip, limit }),
    adminRepo.countAllOrders(),
  ]);

  const items = orders.map((o) => ({
    orderId: o.orderId.toString(),
    orderCode: o.orderCode,
    totalPrice: Number(o.totalPrice),
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt,
    user: o.user
      ? {
          userId: o.user.userId.toString(),
          fullName: o.user.fullName,
          email: o.user.email,
        }
      : null,
    items: o.items?.map((i) => ({
      medicineName: i.medicine?.name || "N/A",
      quantity: i.quantity,
    })),
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

// Cập nhật status đơn hàng
export const updateOrderStatus = async (orderId, orderStatus) => {
  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(orderStatus)) {
    throw { status: 400, message: "Trạng thái đơn hàng không hợp lệ" };
  }
  const order = await adminRepo.updateOrderStatus(BigInt(orderId), orderStatus);
  return { orderId: order.orderId.toString(), orderStatus: order.orderStatus };
};

// Danh sách users
export const getAllUsers = async ({ page, limit, skip }) => {
  const [users, total] = await Promise.all([
    adminRepo.findAllUsers({ skip, limit }),
    adminRepo.countAllUsers(),
  ]);

  const items = users.map((u) => ({
    userId: u.userId.toString(),
    userName: u.userName,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    isActive: u.isActive,
    role: { roleName: u.role?.roleName },
    createdAt: u.createdAt,
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

// Khoá/mở khoá user
export const updateUserStatus = async (userId, isActive) => {
  const user = await adminRepo.updateUserStatus(BigInt(userId), isActive);
  return { userId: user.userId.toString(), isActive: user.isActive };
};

// Danh sách medicines (admin)
export const getAllMedicines = async ({ page, limit, skip }) => {
  const [medicines, total] = await Promise.all([
    adminRepo.findAllMedicines({ skip, limit }),
    adminRepo.countAllMedicines(),
  ]);

  const items = medicines.map((m) => ({
    medicineId: m.medicineId.toString(),
    name: m.name,
    slug: m.slug,
    price: Number(m.price),
    status: m.status,
    categoryName: m.category?.name || null,
    stock: m.inventory?.quantity ?? 0,
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

// Soft delete medicine
export const deleteMedicine = async (medicineId) => {
  await medicineRepo.softDeleteMedicine(BigInt(medicineId));
};
