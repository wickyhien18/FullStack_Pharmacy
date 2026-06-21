// ================================================================
// AuthInitializer.jsx — Khôi phục session + Prefetch
// Cung cấp isWorking qua Context để Layout tự quyết định hiển thị overlay
// Bản thân component này KHÔNG render bất kỳ UI loading nào
// ================================================================
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api from "@/lib/axios.js";
import { AppLoadingContext } from "./AppLoadingContext.jsx";

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
  const [isWorking, setIsWorking] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const hasFetched = useRef(false);

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

  return (
    <AppLoadingContext.Provider value={{ isWorking }}>
      {children}
    </AppLoadingContext.Provider>
  );
}
