import { prisma } from "../config/prisma.js";

export const findAllCategories = () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

export const findAllCategoriesWithCount = async () => {
  const [categories, counts] = await Promise.all([
    findAllCategories(),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: {
        deletedAt: null,
      },
      _count: {
        productId: true,
      },
    }),
  ]);

  const countMap = new Map(
    counts.map((item) => [item.categoryId?.toString(), item._count.productId]),
  );

  return categories.map((category) => ({
    ...category,
    productCount: countMap.get(category.categoryId.toString()) ?? 0,
  }));
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
