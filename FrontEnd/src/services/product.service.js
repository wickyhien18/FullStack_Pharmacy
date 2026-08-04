import api from "@/services/axiosInstance.js";

export const getProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data.data);

export const getProductByPageAndLimit = (page, limit) =>
  api.get("/products", { params: { page, limit } }).then((r) => r.data.data);

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.data);

export const getCategories = () =>
  api.get("/categories").then((r) => r.data.data);

export const getCategoriesWithCount = () =>
  api.get("/categories/count").then((r) => r.data.data);
