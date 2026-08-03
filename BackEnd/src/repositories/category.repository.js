import { prisma } from "../config/prisma.config.js";

//── CATEGORIES ──────────────────────────────────────────────────
//== FIND ALL CATEGORIES ==========================================
export const findAllCategories = () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

//== FIND CATEGORY BY ID ==========================================
export const findCategoryById = (categoryId) => {
  return prisma.category.findUnique({ where: { categoryId } });
};

//== FIND CATEGORY BY SLUG ========================================
export const findCategoryBySlug = (slug) => {
  return prisma.category.findUnique({ where: { slug } });
};

//== CREATE CATEGORY ==============================================
export const createCategory = (data) => {
  return prisma.category.create({ data });
};

//== UPDATE CATEGORY ==============================================
export const updateCategory = (categoryId, data) => {
  return prisma.category.update({ where: { categoryId }, data });
};

//== DELETE CATEGORY ==============================================
export const deleteCategory = (categoryId) => {
  return prisma.category.delete({ where: { categoryId } });
};
