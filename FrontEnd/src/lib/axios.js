// ================================================================
// axios.js — Axios instance với interceptors
// Tất cả API call trong app đều dùng instance này, không dùng
// axios trực tiếp, để config 1 lần dùng mọi nơi.
// ================================================================
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // Vite proxy chuyển /api → http://localhost:3000/api
  withCredentials: true, // gửi kèm cookie (refresh token) trong mọi request
  timeout: 10000, // timeout 10 giây
});

// ── Request Interceptor ───────────────────────────────────────
// Chạy TRƯỚC mỗi request — tự động gắn access token vào header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response Interceptor ──────────────────────────────────────
// Chạy SAU mỗi response — xử lý lỗi 401 (token hết hạn)
let isRefreshing = false; // flag tránh gọi refresh nhiều lần cùng lúc
let failedQueue = []; // hàng đợi các request bị lỗi 401

// Xử lý hàng đợi sau khi refresh xong
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // Response thành công — trả về nguyên
  (response) => response,

  // Response lỗi
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh (tránh loop vô tận), và không phải request login/register
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      // Nếu đang refresh rồi → đưa request vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true; // đánh dấu đã thử refresh
      isRefreshing = true;

      try {
        // Gọi refresh token — cookie tự động gửi kèm nhờ withCredentials
        const { data } = await api.post("/auth/refresh-token");
        const newToken = data.data.accessToken;

        // Cập nhật token mới vào store
        useAuthStore.getState().setAccessToken(newToken);

        // Xử lý hàng đợi với token mới
        processQueue(null, newToken);

        // Thử lại request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → logout
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== "/account") {
          window.location.href = "/account";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
