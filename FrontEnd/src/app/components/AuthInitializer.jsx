// ================================================================
// AuthInitializer.jsx — Khôi phục session + Prefetch
// Overlay che TOÀN BỘ màn hình (cả Header, Footer, nội dung)
// trong lúc đang xử lý nền — không bấm được gì cho đến khi xong
// ================================================================
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api from "@/lib/axios.js";

const PREFETCH_TASKS = [
  {
    key: ["categories"],
    fn:  () => api.get("/categories").then((r) => r.data.data),
  },
  {
    key: ["medicines", { page: 1, limit: 12 }],
    fn:  () => api.get("/medicines?page=1&limit=12").then((r) => r.data.data),
  },
];

// Overlay phủ toàn màn hình — mờ nền, chặn mọi click, kể cả Header/Footer
function FullOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/10 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-2 bg-white rounded-2xl
                      px-8 py-6 shadow-md">
        <div className="text-3xl">💊</div>
        <span className="text-xs text-gray-400">Đang tải...</span>
      </div>
    </div>
  );
}

export default function AuthInitializer({ children }) {
  const [isWorking, setIsWorking] = useState(true);
  const { setAuth, clearAuth }    = useAuthStore();
  const queryClient = useQueryClient();
  const hasFetched   = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const init = async () => {
      const hasSession = localStorage.getItem("hasSession");

      try {
        if (hasSession) {
          try {
            const { data } = await api.post("/auth/refresh-token");
            if (data?.data?.accessToken) {
              const profileRes = await api.get("/auth/profile", {
                headers: { Authorization: `Bearer ${data.data.accessToken}` },
              });
              setAuth(profileRes.data.data, data.data.accessToken);
            }
          } catch (err) {
            // CHỈ xoá session khi server xác nhận 401 thật sự
            if (err.response?.status === 401) {
              localStorage.removeItem("hasSession");
              clearAuth();
            } else if (err.response) {
              console.error("[AuthInitializer] Unexpected error:", err);
            }
          }
        }

        await Promise.allSettled(
          PREFETCH_TASKS.map((task) =>
            queryClient.prefetchQuery({
              queryKey: task.key,
              queryFn:  task.fn,
              staleTime: 1000 * 60 * 5,
            })
          )
        );
      } finally {
        setIsWorking(false);
      }
    };

    init();
  }, []);

  return (
    <>
      {/* App (Header, Footer, nội dung) luôn render trong DOM */}
      {children}

      {/* Overlay phủ TOÀN MÀN HÌNH — che cả Header/Footer, chặn mọi tương tác */}
      {isWorking && <FullOverlay />}
    </>
  );
}
