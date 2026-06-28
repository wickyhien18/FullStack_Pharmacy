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
      _count: { select: { orderItems: true } },
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
export const findProductById = (productId) => {
  return prisma.product.findUnique({
    where: { productId },
    include: {
      category: true,
      inventory: { select: { quantity: true } },
    },
  });
};

// THÊM: lấy 1 Product kèm đủ ảnh — dùng cho admin edit form
export const findProductWithImages = (productId) => {
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

export const countProductsByCategory = () => {
  return prisma.product.groupBy({
    by: ["categoryId"],
    where: {
      deletedAt: null,
    },
    _count: {
      productId: true,
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
export const softDeleteProduct = (productId) => {
  return prisma.product.update({
    where: { productId },
    data: { deletedAt: new Date() },
  });
};

// ── THÊM MỚI: quản lý Product_images ────────────────────────────

export const createProductImages = (productId, imageUrls, startOrder = 0) => {
  if (imageUrls.length === 0) return Promise.resolve();
  return prisma.productImage.createMany({
    data: imageUrls.map((url, index) => ({
      productId,
      imageUrl: url,
      displayOrder: startOrder + index,
    })),
  });
};

export const findImagesByProductId = (productId) => {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { displayOrder: "asc" },
  });
};

export const deleteProductImageById = (imageId) => {
  return prisma.productImage.delete({ where: { imageId } });
};

export const deleteAllImagesByProductId = (productId) => {
  return prisma.productImage.deleteMany({ where: { productId } });
};

export const syncProductImagesAndUpdateProduct = ({
  productId,
  keptImageIds,
  newImageUrls,
  updateData,
}) => {
  return prisma.$transaction(
    async (tx) => {
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
    },
    {
      timeout: 30000, // tăng lên 30 giây
      maxWait: 10000, // chờ tối đa 10 giây để lấy connection
    },
  );
};
