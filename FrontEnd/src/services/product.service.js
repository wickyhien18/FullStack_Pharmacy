import api from "@/services/axiosInstance.js";

export const getProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data.data);

export const getProductById = (productId) =>
  api.get(`/admin/products/${productId}`).then((r) => r.data.data);

export const getProductByPageAndLimit = (page, limit) =>
  api.get("/products", { params: { page, limit } }).then((r) => r.data.data);

export const getProductByPageAndLimitInAdmin = (page) =>
  api.get(`/admin/products?page=${page}&limit=20`).then((r) => r.data.data);

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.data);

export const addProduct = (formData) =>
  api.post("/admin/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (productId, formData) =>
  api.put(`/admin/products/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePoduct = (productId) =>
  api.delete(`/admin/products/${productId}`);
export const getCategories = () =>
  api.get("/categories").then((r) => r.data.data);

export const getCategoriesWithCount = () =>
  api.get("/categories/count").then((r) => r.data.data);

export const getManufacturer = () =>
  api.get("/manufacturers").then((r) => r.data.data);
