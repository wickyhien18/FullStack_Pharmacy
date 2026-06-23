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
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
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
  originalPrice: m.originalPrice ? Number(m.originalPrice) : null,
  unit: m.unit,
  status: m.status,
  description: m.description,
  categoryId: m.categoryId?.toString(),
  categoryName: m.category?.name || null,
  categorySlug: m.category?.slug || null,
  manufacturerId: m.manufacturerId?.toString(),
  manufacturerName: m.manufacturer?.name || null,
  stock: m.inventory?.quantity ?? 0,
  primaryImage: m.image || null,
  images:
    m.images?.map((img) => ({
      // ← thêm block này
      imageId: img.imageId.toString(),
      imageUrl: img.imageUrl,
    })) || [],
  expireDate: m.expireDate,
  createdAt: m.createdAt,
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
  // Cache key bao gồm tất cả params — params khác = cache khác
  // Cache key includes all params — different params = different cache
  const cacheKey = `products:list:${page}:${limit}:${search || ""}:${categoryId || ""}:${sort || ""}:${minPrice || ""}:${maxPrice || ""}`;

  // Check cache trước / Check cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("[Cache] HIT:", cacheKey);
    return cached;
  }

  console.log("[Cache] MISS:", cacheKey);

  const where = buildWhere({ search, categoryId, minPrice, maxPrice });
  const orderBy = buildOrderBy(sort);

  const [products, total] = await Promise.all([
    productRepo.findProducts({ skip, limit, where, orderBy }),
    productRepo.countProducts(where),
  ]);

  const result = buildPaginatedResponse(
    products.map(formatProduct),
    total,
    page,
    limit,
  );

  // Lưu cache 5 phút / Cache for 5 minutes
  await setCache(cacheKey, result, 300);

  return result;
};

// Lấy chi tiết 1 product
export const getProductBySlug = async (slug) => {
  const cacheKey = `products:detail:${slug}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;
  const product = await productRepo.findProductBySlug(slug);
  if (!product) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  const result = formatProduct(product);

  // Cache 10 phút / Cache for 10 minutes
  await setCache(cacheKey, result, 600);

  return result;
};

// ── Invalidate Cache ──────────────────────────────────────────────
// Gọi khi admin sửa/xoá sản phẩm để xoá cache cũ
// Call when admin updates/deletes products to clear stale cache
export const invalidateProductCache = async (slug = null) => {
  await deletePattern("products:list:*");
  if (slug) await deletePattern(`products:detail:${slug}`);
  console.log("[Cache] Invalidated product cache");
};
