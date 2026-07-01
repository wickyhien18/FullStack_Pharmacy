// ================================================================
// product.service.js — Business logic cho products
// ================================================================
import * as productRepo from "../repositories/product.repository.js";
import { getCache, setCache, deletePattern } from "../config/redis.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

// Xây dựng where clause từ query params
const buildWhere = ({
  search,
  categoryId,
  minPrice,
  maxPrice,
  status = "ACTIVE",
}) => {
  const where = {
    deletedAt: null, // không lấy đã xoá
    status,
  };

  // Full-text search theo tên — dùng contains thay vì pg_trgm
  // pg_trgm cần raw query, contains đủ dùng cho dự án này
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  return where;
};

// Xây dựng orderBy từ sort param
const buildOrderBy = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "bestseller":
      return { orderItems: { _count: "desc" } };
    case "newest":
      return { createdAt: "desc" };
    default:
      return { createdAt: "desc" };
  }
};

// Format product trả về client
const formatProduct = (m) => ({
  productId: m.productId.toString(),
  name: m.name,
  slug: m.slug,
  price: Number(m.price),
  unit: m.unit,
  status: m.status,
  categorySlug: m.categorySlug || null,
  stock: m.inventoryQuantity ?? 0,
  primaryImage: m.image || null,
});

// Format product trả về client
const formatProductForSlug = (m) => ({
  productId: m.productId?.toString(),
  name: m.name,
  slug: m.slug,
  price: Number(m.price),
  unit: m.unit,
  status: m.status,
  description: m.description,
  manufacturerName: m.manufacturerName || null,
  stock: m.quantity ?? 0,
  primaryImage: m.image || null,
  images:
    m.images?.map((img) => ({
      imageUrl: img.imageUrl,
      displayOrder: img.displayOrder,
    })) || [],
  expireDate: m.expireDate || null,
});

// Lấy danh sách products
export const getProducts = async ({
  page,
  limit,
  skip,
  search,
  categoryId,
  sort,
  minPrice,
  maxPrice,
}) => {
  const startTime = performance.now();
  // Cache key bao gồm tất cả params — params khác = cache khác
  // Cache key includes all params — different params = different cache
  const cacheKey = `products:list:${page}:${limit}:${search || ""}:${categoryId || ""}:${sort || ""}:${minPrice || ""}:${maxPrice || ""}`;

  // Check cache trước / Check cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`[Cache] HIT: ${cacheKey} | Duration: ${duration}ms`);
    return cached;
  }

  console.log("[Cache] MISS:", cacheKey);

  const where = buildWhere({ search, categoryId, minPrice, maxPrice });
  const orderBy = buildOrderBy(sort);

  const rows = await productRepo.findProducts({ skip, limit, where, orderBy });

  const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;

  const result = buildPaginatedResponse(
    rows.map(formatProduct),
    total,
    page,
    limit,
  );

  // Lưu cache 5 phút / Cache for 5 minutes
  await setCache(cacheKey, result, 300);

  const duration = (performance.now() - startTime).toFixed(2);
  console.log(`[Database Query] MISS: ${cacheKey} | Duration: ${duration}ms`);

  return result;
};

// Lấy chi tiết 1 product
export const getProductBySlug = async (slug) => {
  const startTime = performance.now();
  const cacheKey = `products:detail:${slug}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`[Cache] HIT: ${cacheKey} | Duration: ${duration}ms`);
    return cached;
  }
  const product = await productRepo.findProductBySlug(slug);
  if (!product) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  const result = formatProductForSlug(product);

  // Cache 10 phút / Cache for 10 minutes
  await setCache(cacheKey, result, 600);

  const duration = (performance.now() - startTime).toFixed(2);
  console.log(`[Database Query] MISS: ${cacheKey} | Duration: ${duration}ms`);

  return result;
};

// ── Invalidate Cache ──────────────────────────────────────────────
// Gọi khi admin sửa/xoá sản phẩm để xoá cache cũ
// Call when admin updates/deletes products to clear stale cache
export const invalidateProductCache = async (slug = null) => {
  await deletePattern("products:list:*");
  await deletePattern("cache:/api/products*");
  await deletePattern("cache:/api/categories*");
  if (slug) {
    await deletePattern(`products:detail:${slug}`);
  }
  console.log("[Cache] Invalidated product cache");
};
