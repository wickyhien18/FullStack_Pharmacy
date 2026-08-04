// ================================================================
// AuthInitializer.jsx — Khôi phục session + Prefetch
//
// QUAN TRỌNG: children (toàn bộ App, gồm AccountPage...) chỉ render
// SAU KHI auth check xong. Tránh trường hợp AccountPage render login
// form trước rồi mới "giật" sang profile khi setAuth() chạy xong.
//
// Header/Footer vẫn hiện ngay vì chúng nằm trong Layout — không phụ
// thuộc vào auth state để quyết định nội dung chính. Chỉ phần Outlet
// (nội dung trang, ví dụ AccountPage) mới cần đợi.
// ================================================================
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api, { refreshTokenOnce } from "@/utils/axios.js";

const PREFETCH_TASKS = [
  {
    key: ["categories"],
    fn: () => api.get("/categories").then((r) => r.data.data),
  },
  {
    key: ["products", { page: 1, limit: 12 }],
    fn: () => api.get("/products?page=1&limit=12").then((r) => r.data.data),
  },
];

function FullOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/10 backdrop-blur-[1px]"
    >
      <div
        className="flex flex-col items-center gap-2 bg-white rounded-2xl
                      px-8 py-6 shadow-md"
      >
        <div className="text-3xl">💊</div>
        <span className="text-xs text-gray-400">Đang tải...</span>
      </div>
    </div>
  );
}

export default function AuthInitializer({ children }) {
  // isAuthChecked: riêng cho việc auth xong chưa — quyết định render children hay không
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  // isWorking: vẫn còn prefetch chạy nền — chỉ điều khiển overlay hiển thị
  const [isWorking, setIsWorking] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const init = async () => {
      const hasSession = localStorage.getItem("hasSession");
      console.log("[Auth] hasSession:", hasSession); // ← thêm

      // ── Bước 1: Khôi phục session — PHẢI xong trước khi render children ──
      if (hasSession) {
        try {
          // Dùng CHUNG refreshTokenOnce với axios.js interceptor
          // Đảm bảo chỉ có 1 request refresh-token được gửi, dù
          // có nhiều nơi cần token cùng lúc khi app vừa mount
          const newToken = await refreshTokenOnce();

          const profileRes = await api.get("/auth/profile", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          setAuth(profileRes.data.data, newToken);
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem("hasSession");
            clearAuth();
          } else if (err.response) {
            console.error("[AuthInitializer] Unexpected error:", err);
          }
          // Lỗi network/timeout → giữ nguyên session, không logout oan
        }
      }

      // Auth đã xong (dù thành công hay thất bại) — an toàn để render children
      setIsAuthChecked(true);

      // ── Bước 2: Prefetch — không cần chặn render children nữa ──────────
      try {
        await Promise.allSettled(
          PREFETCH_TASKS.map((task) =>
            queryClient.prefetchQuery({
              queryKey: task.key,
              queryFn: task.fn,
              staleTime: 1000 * 60 * 5,
            }),
          ),
        );
      } finally {
        setIsWorking(false);
      }
    };

    init();
  }, []);

  // Chưa check auth xong → không render children (Header/Footer/AccountPage...)
  // Chỉ hiện overlay loading đơn thuần
  if (!isAuthChecked) {
    return <FullOverlay />;
  }

  return (
    <>
      {children}
      {/* Vẫn hiện overlay trong lúc prefetch categories/products chạy nền */}
      {isWorking && <FullOverlay />}
    </>
  );
}
