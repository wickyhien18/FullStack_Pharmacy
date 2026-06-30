// ================================================================
// axios.js — Fixed version
// 1. Bỏ exclude /cart khỏi refresh logic
// 2. Thêm proactive token refresh (refresh trước 2 phút khi hết hạn)
// 3. Fix race condition: AuthInitializer và interceptor không refresh đồng thời
// ================================================================
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store.js";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

// ── Token expiry helpers ──────────────────────────────────────────
// Decode JWT payload để lấy thời gian hết hạn (exp)
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // convert sang milliseconds
  } catch {
    return null;
  }
};

// Kiểm tra token còn hạn không (tính trước 2 phút để proactive refresh)
const isTokenExpiringSoon = (token, bufferMs = 2 * 60 * 1000) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() > expiry - bufferMs;
};

// ── Shared refresh state — SINGLE SOURCE OF TRUTH ────────────────
// Dùng chung giữa interceptor và AuthInitializer để tránh race condition
let isRefreshing = false;
let refreshPromise = null; // Promise dùng chung, không tạo nhiều lần
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

// Export để AuthInitializer dùng cùng lock
export const refreshTokenOnce = async () => {
  if (isRefreshing) {
    // Đã có refresh đang chạy → đợi kết quả thay vì tạo request mới
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { data } = await api.post("/auth/refresh-token");
      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      processQueue(null, newToken);
      return newToken;
    } catch (err) {
      processQueue(err, null);
      throw err;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ── Retry helper ─────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const retryRequest = async (config, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sleep(delay * (i + 1));
      return await api(config);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
};

// ── Request Interceptor ───────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    // Proactive refresh: nếu token sắp hết hạn (trong 2 phút) → refresh trước
    if (
      isTokenExpiringSoon(accessToken) &&
      !config.url.includes("/auth/refresh-token") &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      try {
        const newToken = await refreshTokenOnce();
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      } catch {
        // Refresh fail → vẫn gửi request với token cũ, để interceptor response xử lý
      }
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ── Response Interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Retry 502/503
    if ((status === 502 || status === 503) && !originalRequest._retried) {
      originalRequest._retried = true;
      console.warn(`[API] ${status} error, retrying...`);
      try {
        return await retryRequest(originalRequest);
      } catch (retryErr) {
        return Promise.reject({
          ...retryErr,
          _userMessage: "Server đang bận, vui lòng thử lại sau.",
        });
      }
    }

    // Xử lý 401 — KHÔNG exclude /cart nữa
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      if (isRefreshing) {
        // Đang refresh → đưa vào queue, đợi kết quả
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;

      try {
        const newToken = await refreshTokenOnce();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        const hadSession = localStorage.getItem("hasSession");
        localStorage.removeItem("hasSession");
        if (hadSession && window.location.pathname !== "/account") {
          window.location.href = "/account";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
