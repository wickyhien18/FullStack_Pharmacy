import * as categoryRepo from "../repositories/category.repository.js";
import { countProductsByCategory } from "../repositories/product.repository.js";
import { deletePattern } from "../config/redis.config.js";
import slugify from "slugify";

const invalidateCategoryCache = async () => {
  await deletePattern("cache:/api/categories*");
  await deletePattern("products:list:*");
  await deletePattern("cache:/api/products*");
  console.log("[Cache] Invalidated category cache");
};

const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: "vi" });

const formatCategory = (c) => ({
  categoryId: c.categoryId.toString(),
  name: c.name,
  slug: c.slug,
});

//── GET CATEGORIES ───────────────────────────────────────────────
export const getCategories = async () => {
  const categories = await categoryRepo.findAllCategories();
  return categories.map((c) => formatCategory(c));
};

//── GET CATEGORIES WITH PRODUCT COUNT ────────────────────────────
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

//── CREATE CATEGORY ──────────────────────────────────────────────
export const createCategory = async ({ name }) => {
  if (!name) throw { status: 400, message: "Category name is required" };

  const slug = generateSlug(name);
  const existing = await categoryRepo.findCategoryBySlug(slug);
  if (existing) throw { status: 409, message: "Category already exists" };

  const category = await categoryRepo.createCategory({ name, slug });
  await invalidateCategoryCache();
  return formatCategory(category);
};

//── UPDATE CATEGORY ──────────────────────────────────────────────
export const updateCategory = async (categoryId, { name }) => {
  if (!name) throw { status: 400, message: "Category name is required" };

  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: "Category not found" };

  const slug = generateSlug(name);
  const category = await categoryRepo.updateCategory(BigInt(categoryId), {
    name,
    slug,
  });
  await invalidateCategoryCache();
  return formatCategory(category);
};

//── DELETE CATEGORY ──────────────────────────────────────────────
export const deleteCategory = async (categoryId) => {
  const existing = await categoryRepo.findCategoryById(BigInt(categoryId));
  if (!existing) throw { status: 404, message: "Category not found" };
  await categoryRepo.deleteCategory(BigInt(categoryId));
  await invalidateCategoryCache();
};
