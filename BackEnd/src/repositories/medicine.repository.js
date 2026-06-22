// ================================================================
// product.repository.js — Truy vấn DB cho products
// ================================================================
import { prisma } from "../config/prisma.js";

// Lấy danh sách products có filter + phân trang
// params = { skip, limit, search, categoryId, sort }
export const findproducts = ({ skip, limit, where, orderBy }) => {
  return prisma.product.findMany({
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

// Đếm tổng số products (dùng cho phân trang)
export const countproducts = (where) => {
  return prisma.product.count({ where });
};

// Tìm 1 product theo slug
export const findproductBySlug = (slug) => {
  return prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: true,
      manufacturer: true,
      inventory: { select: { quantity: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
};

// Tìm 1 product theo id
export const findproductById = (productId) => {
  return prisma.product.findUnique({
    where: { productId },
    include: {
      category: true,
      inventory: { select: { quantity: true } },
    },
  });
};

// THÊM: lấy 1 product kèm đủ ảnh — dùng cho admin edit form
export const findproductWithImages = (productId) => {
  return prisma.product.findUnique({
    where: { productId },
    include: {
      category: true,
      manufacturer: true,
      inventory: { select: { quantity: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
};

// Tạo product mới
export const createproduct = (data) => {
  return prisma.product.create({ data });
};

// Cập nhật product
export const updateproduct = ({ where, data }) => {
  return prisma.product.update({ where, data });
};

// Soft delete — chỉ set deletedAt, không xoá thật
export const softDeleteproduct = (productId) => {
  return prisma.product.update({
    where: { productId },
    data: { deletedAt: new Date() },
  });
};

// ── THÊM MỚI: quản lý product_images ────────────────────────────

export const createproductImages = (productId, imageUrls, startOrder = 0) => {
  if (imageUrls.length === 0) return Promise.resolve();
  return prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      productId,
      imageUrl: url,
      displayOrder: startOrder + index,
    })),
  });
};

export const findImagesByproductId = (productId) => {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { displayOrder: "asc" },
  });
};

export const deleteproductImageById = (imageId) => {
  return prisma.productImage.delete({ where: { imageId } });
};

export const deleteAllImagesByproductId = (productId) => {
  return prisma.productImage.deleteMany({ where: { productId } });
};

export const syncproductImagesAndUpdateproduct = ({
  productId,
  keptImageIds,
  newImageUrls,
  updateData,
}) => {
  return prisma.$transaction(async (tx) => {
    const deleteWhere =
      keptImageIds.length > 0
        ? { productId, imageId: { notIn: keptImageIds } }
        : { productId };

    await tx.productImage.deleteMany({ where: deleteWhere });

    await Promise.all(
      keptImageIds.map((imageId, index) =>
        tx.productImage.update({
          where: { imageId },
          data: { displayOrder: index },
        }),
      ),
    );

    if (newImageUrls.length > 0) {
      await tx.productImage.createMany({
        data: newImageUrls.map((imageUrl, index) => ({
          productId,
          imageUrl,
          displayOrder: keptImageIds.length + index,
        })),
      });
    }

    return tx.product.update({
      where: { productId },
      data: updateData,
    });
  });
};
