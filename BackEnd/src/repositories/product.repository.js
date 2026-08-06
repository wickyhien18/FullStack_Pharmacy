import { prisma, Prisma } from "../config/prisma.config.js";

//── PRODUCTS ────────────────────────────────────────────────────
//== FIND PRODUCTS ================================================
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

//== COUNT PRODUCTS ===============================================
export const countProducts = (where) => {
  return prisma.product.count({ where });
};

//== FIND PRODUCT BY SLUG =========================================
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

//== FIND PRODUCT BY ID ===========================================
export const findProductById = (productId) => {
  return prisma.product.findUnique({
    where: { productId },
    include: {
      category: true,
      inventory: { select: { quantity: true } },
    },
  });
};

//== FIND PRODUCT WITH IMAGES =====================================
// Get one product with all images for the admin edit form.
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

//== COUNT PRODUCTS BY CATEGORY ===================================
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

//== CREATE PRODUCT ===============================================
export const createProduct = (data) => {
  return prisma.product.create({ data });
};

//== UPDATE PRODUCT ===============================================
export const updateProduct = ({ where, data }) => {
  return prisma.product.update({ where, data });
};

//== SOFT DELETE PRODUCT ==========================================
// Set deletedAt instead of permanently deleting the row.
export const softDeleteProduct = (productId) => {
  return prisma.product.update({
    where: { productId },
    data: { deletedAt: new Date() },
  });
};

//── PRODUCT IMAGES ──────────────────────────────────────────────
//== CREATE PRODUCT IMAGES ========================================
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

//== FIND IMAGES BY PRODUCT ID ====================================
export const findImagesByProductId = (productId) => {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { displayOrder: "asc" },
  });
};

//== DELETE PRODUCT IMAGE BY ID ===================================
export const deleteProductImageById = (imageId) => {
  return prisma.productImage.delete({ where: { imageId } });
};

//== DELETE ALL IMAGES BY PRODUCT ID ==============================
export const deleteAllImagesByProductId = (productId) => {
  return prisma.productImage.deleteMany({ where: { productId } });
};

//== SYNC PRODUCT IMAGES AND UPDATE PRODUCT =======================
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
      timeout: 30000, // Increase timeout to 30 seconds.
      maxWait: 10000, // Wait up to 10 seconds for a connection.
    },
  );
};
