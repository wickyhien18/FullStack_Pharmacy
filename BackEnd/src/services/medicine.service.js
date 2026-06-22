// ================================================================
// medicine.service.js — Business logic cho medicines
// ================================================================
import * as medicineRepo from "../repositories/medicine.repository.js";
import { getCache, setCache, deletePattern } from "../config/redis.js";
import { buildPaginatedResponse } from "../utils/pagination.js";

// Xây dựng where clause từ query params
const buildWhere = ({ search, categoryId, status = "ACTIVE" }) => {
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
    where.categoryId = BigInt(categoryId);
  }

  return where;
};

// Xây dựng orderBy từ sort param
const buildOrderBy = (sort) => {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "newest":
      return { createdAt: "desc" };
    default:
      return { createdAt: "desc" };
  }
};

// Format medicine trả về client
const formatMedicine = (m) => ({
  medicineId: m.medicineId.toString(),
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

// Lấy danh sách medicines
export const getMedicines = async ({
  page,
  limit,
  skip,
  search,
  categoryId,
  sort,
}) => {
  // Cache key bao gồm tất cả params — params khác = cache khác
  // Cache key includes all params — different params = different cache
  const cacheKey = `medicines:list:${page}:${limit}:${search || ""}:${categoryId || ""}:${sort || ""}`;

  // Check cache trước / Check cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("[Cache] HIT:", cacheKey);
    return cached;
  }

  console.log("[Cache] MISS:", cacheKey);

  const where = buildWhere({ search, categoryId });
  const orderBy = buildOrderBy(sort);

  const [medicines, total] = await Promise.all([
    medicineRepo.findMedicines({ skip, limit, where, orderBy }),
    medicineRepo.countMedicines(where),
  ]);

  const result = buildPaginatedResponse(
    medicines.map(formatMedicine),
    total,
    page,
    limit,
  );

  // Lưu cache 5 phút / Cache for 5 minutes
  await setCache(cacheKey, result, 300);

  return result;
};

// Lấy chi tiết 1 medicine
export const getMedicineBySlug = async (slug) => {
  const cacheKey = `medicines:detail:${slug}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;
  const medicine = await medicineRepo.findMedicineBySlug(slug);
  if (!medicine) throw { status: 404, message: "Không tìm thấy sản phẩm" };

  const result = formatMedicine(medicine);

  // Cache 10 phút / Cache for 10 minutes
  await setCache(cacheKey, result, 600);

  return result;
};

// ── Invalidate Cache ──────────────────────────────────────────────
// Gọi khi admin sửa/xoá sản phẩm để xoá cache cũ
// Call when admin updates/deletes products to clear stale cache
export const invalidateMedicineCache = async (slug = null) => {
  await deletePattern("medicines:list:*");
  if (slug) await deletePattern(`medicines:detail:${slug}`);
  console.log("[Cache] Invalidated medicine cache");
};
