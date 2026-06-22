// ================================================================
// admin.service.js — Business logic cho admin
// ================================================================
import * as adminRepo from "../repositories/admin.repository.js";
import * as medicineRepo from "../repositories/medicine.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";
import { sendError } from "../utils/response.js";
import { uploadImage, deleteImage } from "./upload.service.js";
import slugify from "slugify";

const MAX_IMAGES = 3;

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

export const getAllRoles = async () => {
  const roles = await adminRepo.findAllRoles();
  return { roles };
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

export const updateUserRole = async (userId, roleName) => {
  if (!roleName) throw { status: 400, message: "roleName là bắt buộc" };

  const role = await adminRepo.existRole(roleName);
  if (!role) throw { status: 404, message: "Role không tồn tại" };

  const user = await adminRepo.updateUserRole(BigInt(userId), role.roleId);
  return { userId: user.userId.toString(), role: role.roleName };
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
    primaryImage: m.image, // ← THÊM: để frontend ProductsPage hiển thị ảnh trong bảng
    categoryName: m.category?.name || null,
    stock: m.inventory?.quantity ?? 0,
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

// THÊM: lấy chi tiết 1 medicine kèm ảnh — dùng cho form edit
export const getMedicineDetail = async (medicineId) => {
  const medicine = await medicineRepo.findMedicineWithImages(
    BigInt(medicineId),
  );
  if (!medicine) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  return {
    medicineId: medicine.medicineId.toString(),
    name: medicine.name,
    description: medicine.description,
    price: Number(medicine.price),
    unit: medicine.unit,
    status: medicine.status,
    categoryId: medicine.categoryId?.toString() || "",
    manufacturerId: medicine.manufacturerId?.toString() || "",
    stock: medicine.inventory?.quantity ?? 0,
    images: medicine.images.map((img) => ({
      imageId: img.imageId.toString(),
      imageUrl: img.imageUrl,
    })),
  };
};

// Tạo medicine mới
export const createMedicine = async (data, files = []) => {
  if (files.length > MAX_IMAGES) {
    throw { status: 400, message: `Tối đa ${MAX_IMAGES} ảnh / sản phẩm` };
  }

  const imageUrls = await Promise.all(
    files.map((file) => uploadImage(file.buffer, data.name, file.mimetype)),
  );

  // SỬA: gọi đúng signature createMedicine(data) — không bọc { data }
  const medicine = await medicineRepo.createMedicine({
    name: data.name,
    slug: generateSlug(data.name),
    description: data.description || null,
    price: parseFloat(data.price),
    unit: data.unit || "Hộp",
    categoryId: data.categoryId ? BigInt(data.categoryId) : null,
    manufacturerId: data.manufacturerId ? BigInt(data.manufacturerId) : null,
    status: data.status || "ACTIVE",
    image: imageUrls[0] || null, // ảnh đầu tiên = ảnh đại diện
  });

  await adminRepo.createInventory({
    medicineId: medicine.medicineId,
    quantity: parseInt(data.stock) || 0,
  });

  // THÊM: lưu tất cả ảnh vào bảng medicine_images
  if (imageUrls.length > 0) {
    await medicineRepo.createMedicineImages(medicine.medicineId, imageUrls);
  }

  return { medicineId: medicine.medicineId.toString(), slug: medicine.slug };
};

// SỬA TOÀN BỘ: hỗ trợ nhiều ảnh + sửa bug "chỉ update khi có file mới"
// keepImageIds: mảng imageId (string[]) muốn GIỮ LẠI — ảnh không có trong list này sẽ bị xoá
export const updateMedicine = async (
  medicineId,
  data,
  files = [],
  keepImageIds = [],
) => {
  const existing = await adminRepo.existMedicine(medicineId);
  if (!existing) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  const currentImages = await medicineRepo.findImagesByMedicineId(
    BigInt(medicineId),
  );

  if (keepImageIds.length + files.length > MAX_IMAGES) {
    throw { status: 400, message: `Tối đa ${MAX_IMAGES} ảnh / sản phẩm` };
  }

  // Xoá những ảnh KHÔNG nằm trong keepImageIds
  const imagesToDelete = currentImages.filter(
    (img) => !keepImageIds.includes(img.imageId.toString()),
  );
  for (const img of imagesToDelete) {
    await deleteImage(img.imageUrl);
    await medicineRepo.deleteMedicineImageById(img.imageId);
  }

  // Upload ảnh mới, nối tiếp display_order sau ảnh giữ lại
  const newImageUrls = await Promise.all(
    files.map((file) =>
      uploadImage(file.buffer, data.name || existing.name, file.mimetype),
    ),
  );
  if (newImageUrls.length > 0) {
    await medicineRepo.createMedicineImages(
      BigInt(medicineId),
      newImageUrls,
      keepImageIds.length,
    );
  }

  const updateData = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = generateSlug(data.name);
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price) updateData.price = parseFloat(data.price);
  if (data.unit) updateData.unit = data.unit;
  if (data.categoryId) updateData.categoryId = BigInt(data.categoryId);
  if (data.manufacturerId)
    updateData.manufacturerId = BigInt(data.manufacturerId);
  if (data.status) updateData.status = data.status;
  // Đồng bộ lại ảnh đại diện = ảnh đầu tiên còn lại sau khi sửa
  const remainingImages = await medicineRepo.findImagesByMedicineId(
    BigInt(medicineId),
  );
  updateData.image = remainingImages[0]?.imageUrl || null;

  await medicineRepo.updateMedicine({
    where: { medicineId: BigInt(medicineId) },
    data: updateData,
  });

  // Cập nhật tồn kho nếu có
  if (data.stock !== undefined) {
    await adminRepo.createOrUpdateInventory(medicineId, data.stock);
  }

  return { medicineId, message: "Cập nhật thành công" };
};

// Soft delete medicine
export const deleteMedicine = async (medicineId) => {
  const existing = await adminRepo.existMedicine(medicineId);
  if (!existing) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  // THÊM: xoá tất cả ảnh trong bảng medicine_images, không chỉ ảnh đại diện
  const images = await medicineRepo.findImagesByMedicineId(BigInt(medicineId));
  for (const img of images) {
    await deleteImage(img.imageUrl);
  }

  await medicineRepo.softDeleteMedicine(BigInt(medicineId));
};
