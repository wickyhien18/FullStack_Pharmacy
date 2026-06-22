// ================================================================
// Product.repository.js — Truy vấn DB cho Products
// ================================================================
import { prisma } from "../config/prisma.js";

// Lấy danh sách Products có filter + phân trang
// params = { skip, limit, search, categoryId, sort }
export const findProducts = ({ skip, limit, where, orderBy }) => {
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

// Đếm tổng số Products (dùng cho phân trang)
export const countProducts = (where) => {
  return prisma.product.count({ where });
};

// Tìm 1 Product theo slug
export const findProductBySlug = (slug) => {
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

// Tìm 1 Product theo id
export const findProductById = (ProductId) => {
  return prisma.product.findUnique({
    where: { ProductId },
    include: {
      category: true,
      inventory: { select: { quantity: true } },
    },
  });
};

// THÊM: lấy 1 Product kèm đủ ảnh — dùng cho admin edit form
export const findProductWithImages = (ProductId) => {
  return prisma.product.findUnique({
    where: { ProductId },
    include: {
      category: true,
      manufacturer: true,
      inventory: { select: { quantity: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  });
};

// Tạo Product mới
export const createProduct = (data) => {
  return prisma.product.create({ data });
};

// Cập nhật Product
export const updateProduct = ({ where, data }) => {
  return prisma.product.update({ where, data });
};

// Soft delete — chỉ set deletedAt, không xoá thật
export const softDeleteProduct = (ProductId) => {
  return prisma.product.update({
    where: { ProductId },
    data: { deletedAt: new Date() },
  });
};

// ── THÊM MỚI: quản lý Product_images ────────────────────────────

export const createProductImages = (ProductId, imageUrls, startOrder = 0) => {
  if (imageUrls.length === 0) return Promise.resolve();
  return prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      ProductId,
      imageUrl: url,
      displayOrder: startOrder + index,
    })),
  });
};

export const findImagesByProductId = (ProductId) => {
  return prisma.productImage.findMany({
    where: { ProductId },
    orderBy: { displayOrder: "asc" },
  });
};

export const deleteProductImageById = (imageId) => {
  return prisma.productImage.delete({ where: { imageId } });
};

export const deleteAllImagesByProductId = (ProductId) => {
  return prisma.productImage.deleteMany({ where: { ProductId } });
};

export const syncProductImagesAndUpdateProduct = ({
  ProductId,
  keptImageIds,
  newImageUrls,
  updateData,
}) => {
  return prisma.$transaction(async (tx) => {
    const deleteWhere =
      keptImageIds.length > 0
        ? { ProductId, imageId: { notIn: keptImageIds } }
        : { ProductId };

    await tx.ProductImage.deleteMany({ where: deleteWhere });

    await Promise.all(
      keptImageIds.map((imageId, index) =>
        tx.ProductImage.update({
          where: { imageId },
          data: { displayOrder: index },
        }),
      ),
    );

    if (newImageUrls.length > 0) {
      await tx.ProductImage.createMany({
        data: newImageUrls.map((imageUrl, index) => ({
          ProductId,
          imageUrl,
          displayOrder: keptImageIds.length + index,
        })),
      });
    }

    return tx.Product.update({
      where: { ProductId },
      data: updateData,
    });
  });
};
