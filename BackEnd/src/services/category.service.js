
import * as categoryRepo from '../repositories/category.repository.js';
import slugify from 'slugify';

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: 'vi' });

const formatCategory = (c, withCount = false) => ({
  categoryId: c.categoryId.toString(),
  name:       c.name,
  slug:       c.slug,
  ...(withCount && { count: c._count?.medicines ?? 0 }),
});

export const getCategories = async () => {
  const categories = await categoryRepo.findAllCategories();
  const items = categories.map((c) => formatCategory(c));
  return { items, total: items.length };
};

export const getCategoriesWithCount = async () => {
  const categories = await categoryRepo.findAllCategoriesWithCount();
  const items = categories.map((c) => formatCategory(c, true));
  return { items, total: items.length };
};

export const createCategory = async ({ name }) => {
  if (!name) throw { status: 400, message: 'Tên danh mục là bắt buộc' };

  const slug = generateSlug(name);
  const existing = await categoryRepo.findCategoryBySlug(slug);
  if (existing) throw { status: 409, message: 'Danh mục đã tồn tại' };

  const category = await categoryRepo.createCategory({ name, slug });
  return formatCategory(category);
};

export const updateCategory = async (categoryId, { name }) => {
  if (!name) throw { status: 400, message: 'Tên danh mục là bắt buộc' };

  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: 'Không tìm thấy danh mục' };

  const slug = generateSlug(name);
  const category = await categoryRepo.updateCategory(BigInt(categoryId), { name, slug });
  return formatCategory(category);
};

export const deleteCategory = async (categoryId) => {
  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: 'Không tìm thấy danh mục' };
  await categoryRepo.deleteCategory(BigInt(categoryId));
};
