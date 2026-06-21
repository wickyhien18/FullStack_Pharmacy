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
          Nhà Thuốc Wicky Hien
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
      // Nếu đã từng init trong session này → bỏ qua loading screen dài
      const alreadyInitialized = sessionStorage.getItem("appInitialized");

      if (alreadyInitialized) {
        // Vẫn refresh session ngầm nhưng KHÔNG hiện loading screen
        setIsInitialized(true); // render app ngay
        // Refresh session trong nền
        try {
          const hasSession = localStorage.getItem("hasSession");
          if (hasSession) {
            const { data } = await api.post("/auth/refresh-token");
            if (data?.data?.accessToken) {
              const profileRes = await api.get("/auth/profile", {
                headers: { Authorization: `Bearer ${data.data.accessToken}` },
              });
              setAuth(profileRes.data.data, data.data.accessToken);
            }
          }
        } catch {
          clearAuth();
        }
        return;
      }
      // Tổng số bước = auth + prefetch tasks
      // Nếu chưa có session thì bỏ qua auth → ít bước hơn
      const hasSession = localStorage.getItem("hasSession");
      const authSteps = hasSession ? 2 : 0; // refresh + profile
      const totalSteps = authSteps + PREFETCH_TASKS.length;
      let currentStep = 0;

      const advance = (msg) => {
        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
        setMessage(msg);
      };

      if (!hasSession) {
        setIsInitialized(true);
        return;
      }

      try {
        // ── Bước 1: Khôi phục session (chỉ khi đã từng đăng nhập) ──
        if (hasSession) {
          advance("Đang xác thực...");
          try {
            const { data } = await api.post("/auth/refresh-token");

            if (data?.data?.accessToken) {
              advance("Đang tải thông tin tài khoản...");
              const profileRes = await api.get("/auth/profile", {
                headers: { Authorization: `Bearer ${data.data.accessToken}` },
              });
              setAuth(profileRes.data.data, data.data.accessToken);
            }
          } catch (err) {
            // 401 = session hết hạn = bình thường
            if (err.response?.status !== 401) {
              console.error("[AuthInitializer] Unexpected error:", err);
            }
            // Session hết hạn → xoá flag
            localStorage.removeItem("hasSession");
            clearAuth();
            // Vẫn cần advance đủ bước
            advance("Đang tải dữ liệu...");
          }
        }

        // ── Bước 2: Prefetch data quan trọng ────────────────────────
        await Promise.allSettled(
          PREFETCH_TASKS.map(async (task) => {
            try {
              await queryClient.prefetchQuery({
                queryKey: task.key,
                queryFn: task.fn,
                staleTime: 1000 * 60 * 5,
              });
            } catch {
              // Prefetch fail không block app
            } finally {
              advance("Đang tải sản phẩm...");
            }
          }),
        );

        // ── Hoàn tất ────────────────────────────────────────────────
        setProgress(100);
        setMessage("Hoàn tất!");
        await new Promise((r) => setTimeout(r, 300));
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen progress={progress} message={message} />;
  }

  sessionStorage.setItem("appInitialized", "true");
  return children;
}
