// ================================================================
// medicine.repository.js — Truy vấn DB cho medicines
// ================================================================
import { prisma } from "../config/prisma.js";

// Lấy danh sách medicines có filter + phân trang
// params = { skip, limit, search, categoryId, sort }
export const findMedicines = ({ skip, limit, where, orderBy }) => {
  return prisma.medicine.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      category: { select: { categoryId: true, name: true, slug: true } },
      manufacturer: { select: { manufacturerId: true, name: true } },
      inventory: { select: { quantity: true } },
    },
  });
};

// Đếm tổng số medicines (dùng cho phân trang)
export const countMedicines = (where) => {
  return prisma.medicine.count({ where });
};

// Tìm 1 medicine theo slug
export const findMedicineBySlug = (slug) => {
  return prisma.medicine.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      manufacturer: true,
      inventory: { select: { quantity: true } },
    },
  });
};

// Tìm 1 medicine theo id
export const findMedicineById = (medicineId) => {
  return prisma.medicine.findUnique({
    where: { medicineId },
    include: {
      category: true,
      inventory: { select: { quantity: true } },
    },
  });
};

// THÊM: lấy 1 medicine kèm đủ ảnh — dùng cho admin edit form
export const findMedicineWithImages = (medicineId) => {
  return prisma.medicine.findUnique({
    where: { medicineId },
    include: {
      category: true,
      manufacturer: true,
      inventory: { select: { quantity: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
};

// Tạo medicine mới
export const createMedicine = (data) => {
  return prisma.medicine.create({ data });
};

// Cập nhật medicine
export const updateMedicine = (medicineId, data) => {
  return prisma.medicine.update({ where: { medicineId }, data });
};

// Soft delete — chỉ set deletedAt, không xoá thật
export const softDeleteMedicine = (medicineId) => {
  return prisma.medicine.update({
    where: { medicineId },
    data: { deletedAt: new Date() },
  });
};

// ── THÊM MỚI: quản lý medicine_images ────────────────────────────

export const createMedicineImages = (medicineId, imageUrls, startOrder = 0) => {
  if (imageUrls.length === 0) return Promise.resolve();
  return prisma.medicineImage.createMany({
    data: imageUrls.map((url, index) => ({
      medicineId,
      imageUrl: url,
      displayOrder: startOrder + index,
    })),
  });
};

export const findImagesByMedicineId = (medicineId) => {
  return prisma.medicineImage.findMany({
    where: { medicineId },
    orderBy: { displayOrder: "asc" },
  });
};

export const deleteMedicineImageById = (imageId) => {
  return prisma.medicineImage.delete({ where: { imageId } });
};

export const deleteAllImagesByMedicineId = (medicineId) => {
  return prisma.medicineImage.deleteMany({ where: { medicineId } });
};
