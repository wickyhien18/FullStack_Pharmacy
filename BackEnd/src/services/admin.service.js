// ================================================================
// admin.service.js — Business logic cho admin
// ================================================================
import * as adminRepo from "../repositories/admin.repository.js";
import * as medicineRepo from "../repositories/medicine.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";
import { uploadImage, deleteImage } from "./upload.service.js";
import slugify from "slugify";

// Dashboard stats
export const getDashboardStats = () => adminRepo.getDashboardStats();

// Tạo slug từ tên — cài: npm install slugify
const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: "vi" }) + "-" + Date.now();

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

// Tạo medicine mới
export const createMedicine = async (data, file) => {
  let imageUrl = null;

  if (file) {
    imageUrl = await uploadImage(file.buffer, data.name, file.mimetype);
  }

  const medicine = await medicineRepo.createMedicine({
    data: {
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description || null,
      price: parseFloat(data.price),
      unit: data.unit || "Hộp",
      categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      manufacturerId: data.manufacturerId ? BigInt(data.manufacturerId) : null,
      status: data.status || "ACTIVE",
      image: imageUrl,
    },
  });

  await adminRepo.createInventory({
    data: {
      medicineId: medicine.medicineId,
      quantity: parseInt(data.stock) || 0,
    },
  });

  return { medicineId: medicine.medicineId.toString(), slug: medicine.slug };
};

// Cập nhật medicine
export const updateMedicine = async (medicineId, data, file) => {
  const existing = await adminRepo.existMedicine(medicineId);
  if (!existing) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  let imageUrl = existing.image;

  if (file) {
    // Upload ảnh mới
    imageUrl = await uploadImage(
      file.buffer,
      data.name || existing.name,
      file.mimetype,
    );
    // Xoá ảnh cũ nếu có
    if (existing.image) await deleteImage(existing.image);

    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.unit) updateData.unit = data.unit;
    if (data.categoryId) updateData.categoryId = BigInt(data.categoryId);
    if (data.manufacturerId)
      updateData.manufacturerId = BigInt(data.manufacturerId);
    if (data.status) updateData.status = data.status;
    if (imageUrl !== existing.image) updateData.image = imageUrl;

    await medicineRepo.updateMedicine({
      where: { medicineId: BigInt(medicineId) },
      data: updateData,
    });

    // Cập nhật tồn kho nếu có
    if (data.stock !== undefined) {
      await adminRepo.createOrUpdateInventory(medicineId, data.stock);
    }
  }

  return { medicineId, message: "Cập nhật thành công" };
};

// Soft delete medicine
export const deleteMedicine = async (medicineId) => {
  await medicineRepo.softDeleteMedicine(BigInt(medicineId));
};
