// ================================================================
// Product.repository.js — Truy vấn DB cho Products
// ================================================================
import { prisma, Prisma } from "../config/prisma.config.js";

// Lấy danh sách Products có filter + phân trang
// params = { skip, limit, search, categoryId, sort }
export const findProducts = async ({ skip, limit, where, orderBy }) => {
  const conditions = [Prisma.sql`p.deleted_at IS NULL`];

  if (where.status) {
    conditions.push(Prisma.sql`p.status = ${where.status}::product_status`);
  }
  if (where.name?.contains) {
    conditions.push(
      Prisma.sql`p.name ILIKE ${"%" + where.name.contains + "%"}`,
    );
  }
  if (where.categoryId) {
    conditions.push(Prisma.sql`p.category_id = ${where.categoryId}`);
  }
  if (where.price?.gte !== undefined) {
    conditions.push(Prisma.sql`p.price >= ${where.price.gte}`);
  }
  if (where.price?.lte !== undefined) {
    conditions.push(Prisma.sql`p.price <= ${where.price.lte}`);
  }

  const whereClause = Prisma.join(conditions, " AND ");

  let orderByClause;
  if (orderBy.price) {
    orderByClause =
      orderBy.price === "asc"
        ? Prisma.sql`p.price ASC`
        : Prisma.sql`p.price DESC`;
  } else if (orderBy.orderItems) {
    orderByClause =
      orderBy.orderItems._count === "asc"
        ? Prisma.sql`"orderCount" ASC`
        : Prisma.sql`"orderCount" DESC`;
  } else {
    orderByClause = Prisma.sql`p.created_at DESC`;
  }

  const rows = await prisma.$queryRaw`
    SELECT
      p.product_id AS "productId",
      p.name,
      p.slug,
      p.image,
      p.price,
      p.unit,
      p.status,
      c.slug AS "categorySlug",
      i.quantity AS "inventoryQuantity",
      (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.product_id) AS "orderCount",
      COUNT(*) OVER() AS "totalCount"
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT ${limit} OFFSET ${skip}
  `;

  return rows;
};

// Đếm tổng số Products (dùng cho phân trang)
export const countProducts = (where) => {
  return prisma.product.count({ where });
};

// Tìm 1 Product theo slug
export const findProductBySlug = async (slug) => {
  const rows = await prisma.$queryRaw`
    SELECT
      p.product_id as "productId",
      p.name,
      p.slug,
      p.image,
      p.price,
      p.unit,
      p.description,
      p.status,
      p.deleted_at as "deletedAt",
      m.name AS "manufacturerName",
      i.quantity,
      p.expire_date as "expireDate",
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'imageUrl', pi.image_url,
            'displayOrder', pi.display_order
          ) ORDER BY pi.display_order ASC
        ) FILTER (WHERE pi.image_id IS NOT NULL),
        '[]'
      ) AS images
    FROM products p
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id
    WHERE p.slug = ${slug}
      AND p.deleted_at IS NULL
    GROUP BY p.product_id, m.name, i.quantity
    LIMIT 1
  `;

  return rows[0];
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
