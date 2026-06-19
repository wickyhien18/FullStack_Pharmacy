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

// Loading screen hiển thị trong lúc chờ
function LoadingScreen({ progress, message }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-2">💊</div>
        <h1 className="text-xl font-bold" style={{ color: "#1250dc" }}>
          Nhà Thuốc Online
        </h1>
      </div>

      {/* Progress bar */}
      <div className="w-64 mb-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: "#1250dc",
            }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default function AuthInitializer({ children }) {
  // isInitialized: flag để biết đã check xong chưa
  // Trong lúc đang check → hiện loading, tránh flash màn hình login
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Đang khởi động...");
  const { setAuth, clearAuth } = useAuthStore();
  const hasFetched = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasFetched.current) return; // already ran, skip
    hasFetched.current = true;
    const initAuth = async () => {
      // Tổng số bước = auth + prefetch tasks
      // Nếu chưa có session thì bỏ qua auth → ít bước hơn
      const hasSession = localStorage.getItem("hasSession");
      const authSteps = hasSession ? 2 : 0; // refresh + profile
      const totalSteps = authSteps + PREFETCH_TASKS.length;
      let currentStep = 0;

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
