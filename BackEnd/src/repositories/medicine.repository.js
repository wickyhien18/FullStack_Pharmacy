
// ================================================================
// medicine.repository.js — Truy vấn DB cho medicines
// ================================================================
import { prisma } from '../config/prisma.js';

// Lấy danh sách medicines có filter + phân trang
// params = { skip, limit, search, categoryId, sort }
export const findMedicines = ({ skip, limit, where, orderBy }) => {
  return prisma.medicine.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      category:     { select: { categoryId: true, name: true, slug: true } },
      manufacturer: { select: { manufacturerId: true, name: true } },
      inventory:    { select: { quantity: true } },
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
      category:     true,
      manufacturer: true,
      inventory:    { select: { quantity: true } },
    },
  });
};

// Tìm 1 medicine theo id
export const findMedicineById = (medicineId) => {
  return prisma.medicine.findUnique({
    where: { medicineId },
    include: {
      category:  true,
      inventory: { select: { quantity: true } },
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
