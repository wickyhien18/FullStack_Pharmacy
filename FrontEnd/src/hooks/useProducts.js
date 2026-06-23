// ================================================================
// useProducts.js — Custom hooks cho product APIs
// useQuery: dùng cho GET data, tự động cache, refetch, loading state
// ================================================================
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios.js";

// Lấy danh sách thuốc có lọc + phân trang
// params = { page, limit, search, categoryId, sort }
export const useProducts = (params = {}) => {
  return useQuery({
    // queryKey: React Query dùng key này để cache và identify query
    // Khi params thay đổi → key thay đổi → tự fetch lại
    queryKey: ["products", params],
    queryFn: () => api.get("/products", { params }).then((r) => r.data.data),
    placeholderData: (previousData) => previousData, // ← React Query v5 syntax
    staleTime: 1000 * 60 * 2, // giữ cache 2 phút, không refetch liên tục
  });
};

// Lấy chi tiết 1 thuốc theo slug
// enabled: false khi chưa có slug → không fetch
export const useProduct = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data.data),
    enabled: !!slug, // chỉ fetch khi slug có giá trị
  });
};

// Lấy danh sách categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
    staleTime: 1000 * 60 * 30, // cache 30 phút — categories ít thay đổi
  });
};

// Lấy danh sách categories số lượng thuốc cùng loại
export const useCategoriesWithCount = () => {
  return useQuery({
    queryKey: ["categories", "count"],
    queryFn: () => api.get("/categories/count").then((r) => r.data.data),
    staleTime: 1000 * 60 * 30, // cache 30 phút — categories ít thay đổi
  });
};
