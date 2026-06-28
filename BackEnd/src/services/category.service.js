import * as categoryRepo from "../repositories/category.repository.js";
import { countProductsByCategory } from "../repositories/product.repository.js";
import slugify from "slugify";

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: "vi" });

const formatCategory = (c) => ({
  categoryId: c.categoryId.toString(),
  name: c.name,
  slug: c.slug,
});

export const getCategories = async () => {
  const categories = await categoryRepo.findAllCategories();
  return categories.map((c) => formatCategory(c));
};

export const getCategoriesWithCount = async () => {
  const [categories, counts] = await Promise.all([
    categoryRepo.findAllCategories(),
    countProductsByCategory(),
  ]);

  const countMap = new Map(
    counts.map((item) => [item.categoryId.toString(), item._count.productId]),
  );

  return categories.map((category) => ({
    categoryId: category.categoryId.toString(),
    name: category.name,
    slug: category.slug,
    count: countMap.get(category.categoryId.toString()) ?? 0,
  }));
};

export const createCategory = async ({ name }) => {
  if (!name) throw { status: 400, message: "Tên danh mục là bắt buộc" };

  const slug = generateSlug(name);
  const existing = await categoryRepo.findCategoryBySlug(slug);
  if (existing) throw { status: 409, message: "Danh mục đã tồn tại" };

  const category = await categoryRepo.createCategory({ name, slug });
  return formatCategory(category);
};

export const updateCategory = async (categoryId, { name }) => {
  if (!name) throw { status: 400, message: "Tên danh mục là bắt buộc" };

  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: "Không tìm thấy danh mục" };

  const slug = generateSlug(name);
  const category = await categoryRepo.updateCategory(BigInt(categoryId), {
    name,
    slug,
  });
  return formatCategory(category);
};

export const deleteCategory = async (categoryId) => {
  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: "Không tìm thấy danh mục" };
  await categoryRepo.deleteCategory(BigInt(categoryId));
};
