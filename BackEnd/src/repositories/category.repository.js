import { prisma } from "../config/prisma.js";

export const findAllCategories = () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

export const findAllCategoriesWithCount = () => {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
};

export const findCategoryById = (categoryId) => {
  return prisma.category.findUnique({ where: { categoryId } });
};

export const findCategoryBySlug = (slug) => {
  return prisma.category.findUnique({ where: { slug } });
};

export const createCategory = (data) => {
  return prisma.category.create({ data });
};

export const updateCategory = (categoryId, data) => {
  return prisma.category.update({ where: { categoryId }, data });
};

export const deleteCategory = (categoryId) => {
  return prisma.category.delete({ where: { categoryId } });
};
