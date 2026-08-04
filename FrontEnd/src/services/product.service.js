import api from "@/services/axiosInstance.js";

export const getProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data.data);

export const getProductByPageAndLimit = () => {
  api.get("/products?page=1&limit=12").then((r) => r.data.data);
};

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.data);

export const getCategories = () =>
  api.get("/categories").then((r) => r.data.data);

export const getCategoriesWithCount = () =>
  api.get("/categories/count").then((r) => r.data.data);
