import * as productRepo from "../repositories/product.repository.js";
import { getCache, setCache, deletePattern } from "../config/redis.config.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

//── BUILD WHERE CLAUSE ───────────────────────────────────────────
const buildWhere = ({
  search,
  categoryId,
  minPrice,
  maxPrice,
  status = "ACTIVE",
}) => {
  const where = {
    deletedAt: null, // Exclude soft-deleted products.
    status,
  };

  // Search by name with contains; raw pg_trgm is handled in repository where needed.
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

//── BUILD ORDER BY ───────────────────────────────────────────────
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

//── FORMAT PRODUCT LIST ITEM ────────────────────────────────────
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

//── FORMAT PRODUCT DETAIL ───────────────────────────────────────
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

//── GET PRODUCTS ────────────────────────────────────────────────
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
  // Cache key includes all params; different params produce different cache entries.
  const cacheKey = `products:list:${page}:${limit}:${search || ""}:${categoryId || ""}:${sort || ""}:${minPrice || ""}:${maxPrice || ""}`;

  // Check cache first.
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

  // Cache for 5 minutes.
  await setCache(cacheKey, result, 300);

  const duration = (performance.now() - startTime).toFixed(2);
  console.log(`[Database Query] MISS: ${cacheKey} | Duration: ${duration}ms`);

  return result;
};

//── GET PRODUCT BY SLUG ─────────────────────────────────────────
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
  if (!product) throw { status: 404, message: "Product not found" };

  const result = formatProductForSlug(product);

  // Cache for 10 minutes.
  await setCache(cacheKey, result, 600);

  const duration = (performance.now() - startTime).toFixed(2);
  console.log(`[Database Query] MISS: ${cacheKey} | Duration: ${duration}ms`);

  return result;
};

// ── Invalidate Cache ──────────────────────────────────────────────
// Call when admin updates/deletes products to clear stale cache.
export const invalidateProductCache = async (slug = null) => {
  await deletePattern("products:list:*");
  await deletePattern("cache:/api/products*");
  await deletePattern("cache:/api/categories*");
  if (slug) {
    await deletePattern(`products:detail:${slug}`);
  }
  console.log("[Cache] Invalidated product cache");
};
