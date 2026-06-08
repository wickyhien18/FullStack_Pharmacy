
// ================================================================
// medicine.service.js — Business logic cho medicines
// ================================================================
import * as medicineRepo from '../repositories/medicine.repository.js';
import { buildPaginatedResponse } from '../utils/pagination.js';

// Xây dựng where clause từ query params
const buildWhere = ({ search, categoryId, status = 'ACTIVE' }) => {
  const where = {
    deletedAt: null, // không lấy đã xoá
    status,
  };

  // Full-text search theo tên — dùng contains thay vì pg_trgm
  // pg_trgm cần raw query, contains đủ dùng cho dự án này
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (categoryId) {
    where.categoryId = BigInt(categoryId);
  }

  return where;
};

// Xây dựng orderBy từ sort param
const buildOrderBy = (sort) => {
  switch (sort) {
    case 'price_asc':  return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'newest':     return { createdAt: 'desc' };
    default:           return { createdAt: 'desc' };
  }
};

// Format medicine trả về client
const formatMedicine = (m) => ({
  medicineId:      m.medicineId.toString(),
  name:            m.name,
  slug:            m.slug,
  price:           Number(m.price),
  originalPrice:   m.originalPrice ? Number(m.originalPrice) : null,
  unit:            m.unit,
  status:          m.status,
  description:     m.description,
  categoryId:      m.categoryId?.toString(),
  categoryName:    m.category?.name || null,
  categorySlug:    m.category?.slug || null,
  manufacturerId:  m.manufacturerId?.toString(),
  manufacturerName: m.manufacturer?.name || null,
  stock:           m.inventory?.quantity ?? 0,
  primaryImage:    m.image || null,
  expireDate:      m.expireDate,
  createdAt:       m.createdAt,
});

// Lấy danh sách medicines
export const getMedicines = async ({ page, limit, skip, search, categoryId, sort }) => {
  const where   = buildWhere({ search, categoryId });
  const orderBy = buildOrderBy(sort);

  const [medicines, total] = await Promise.all([
    medicineRepo.findMedicines({ skip, limit, where, orderBy }),
    medicineRepo.countMedicines(where),
  ]);

  return buildPaginatedResponse(medicines.map(formatMedicine), total, page, limit);
};

// Lấy chi tiết 1 medicine
export const getMedicineBySlug = async (slug) => {
  const medicine = await medicineRepo.findMedicineBySlug(slug);
  if (!medicine) throw { status: 404, message: 'Không tìm thấy sản phẩm' };
  return formatMedicine(medicine);
};
