// ================================================================
// AuthInitializer.jsx — Tự động khôi phục session khi reload trang
//
// Vấn đề: accessToken lưu trong Zustand (memory) → mất khi reload
// Giải pháp: khi app khởi động, gọi /api/auth/refresh-token
//   - Nếu còn refreshToken trong cookie → nhận accessToken mới → vẫn đăng nhập
//   - Nếu không có cookie hoặc hết hạn → về trạng thái chưa đăng nhập
//
// Component này bọc toàn bộ app, chạy 1 lần duy nhất khi mount
// ================================================================
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api from "@/lib/axios.js";

// Danh sách API cần prefetch trước khi render
// Chỉ prefetch data ít thay đổi và quan trọng với UX
const PREFETCH_TASKS = [
  {
    key: ["categories"],
    fn: () => api.get("/categories").then((r) => r.data.data),
  },
  {
    key: ["medicines", { page: 1, limit: 12 }],
    fn: () => api.get("/medicines?page=1&limit=12").then((r) => r.data.data),
  },
];

export default function AuthInitializer({ children }) {
  // isInitialized: flag để biết đã check xong chưa
  // Trong lúc đang check → hiện loading, tránh flash màn hình login
  const [isInitialized, setIsInitialized] = useState(false);
  const { setAuth, clearAuth } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // already ran, skip
    hasFetched.current = true;
    const initAuth = async () => {
      // Nếu chưa từng đăng nhập / đã logout → bỏ qua, không gọi API
      const hasSession = localStorage.getItem("hasSession");
      if (!hasSession) {
        setIsInitialized(true);
        return;
      }

      try {
        // Gọi refresh-token — cookie tự động gửi kèm nhờ withCredentials
        // Nếu cookie còn hạn → nhận accessToken + user mới
        const { data } = await api.post("/auth/refresh-token");

        if (data?.data?.accessToken) {
          // Lấy thêm thông tin profile để có đầy đủ user object
          const profileRes = await api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${data.data.accessToken}` },
          });

          setAuth(profileRes.data.data, data.data.accessToken);
        }
      } catch (err) {
        // Refresh thất bại (cookie hết hạn hoặc không có)
        // → về trạng thái chưa đăng nhập, không cần làm gì
        // 401 = no valid session = normal case, don't log it
        if (err.response?.status !== 401) {
          console.error("[AuthInitializer] Unexpected error:", err);
        }
        clearAuth();
      } finally {
        // Dù thành công hay thất bại → đánh dấu đã init xong
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []); // [] → chỉ chạy 1 lần khi app mount

  // Trong lúc đang check → hiện loading spinner
  // Tránh flash màn hình login rồi redirect về home
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 border-primary-500 border-t-transparent
                          rounded-full animate-spin"
          />
          <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return children;
}
