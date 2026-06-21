// ================================================================
// AuthInitializer.jsx — Khôi phục session + Prefetch
//
// Quy tắc hiển thị:
//   - Mở web LẦN ĐẦU (chưa từng có "appInitialized" trong localStorage)
//     → hiện FULL loading screen che toàn màn hình
//   - F5 / mở lại các lần sau → chỉ hiện WIDGET NHỎ giữa màn hình, không che app
//   - Flag "appInitialized" bị xoá khi logout → lần login sau hiện full loading lại 1 lần
// ================================================================
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api from "@/lib/axios.js";

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

function FullLoadingScreen({ progress, message }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="mb-8 text-center">
        <div className="text-4xl mb-2">💊</div>
        <h1 className="text-xl font-bold" style={{ color: "#1250dc" }}>
          Nhà Thuốc Wicky Hien
        </h1>
      </div>
      <div className="w-64 mb-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: "#1250dc" }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// Widget nhỏ — đặt GIỮA màn hình, không chặn click vào app phía dưới
function BackgroundLoadingBadge() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="flex items-center gap-2.5 bg-white shadow-lg rounded-full
                      pl-2 pr-4 py-2 border border-gray-100 pointer-events-auto"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: "#e8efff" }}
        >
          💊
        </div>
        <span className="text-xs text-gray-500">Đang tải dữ liệu...</span>
        <div className="w-3 h-3 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function AuthInitializer({ children }) {
  const [isWorking, setIsWorking] = useState(true);
  const [isFirstTime] = useState(() => !localStorage.getItem("appInitialized"));
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Đang khởi động...");
  const { setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const hasSession = localStorage.getItem("hasSession");
    const authSteps = hasSession ? 2 : 0;
    const totalSteps = authSteps + PREFETCH_TASKS.length;
    let currentStep = 0;

    const advance = (msg) => {
      currentStep++;
      setProgress(Math.round((currentStep / Math.max(totalSteps, 1)) * 100));
      setMessage(msg);
    };

    const initAuth = async () => {
      try {
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
            // CHỈ xoá session khi server xác nhận 401 thật sự
            // Lỗi mạng/timeout/500 khác → giữ nguyên, tránh logout oan
            if (err.response?.status === 401) {
              localStorage.removeItem("hasSession");
              clearAuth();
            } else if (err.response) {
              console.error("[AuthInitializer] Unexpected error:", err);
            }
            advance("Đang tải dữ liệu...");
          }
        }

        await Promise.allSettled(
          PREFETCH_TASKS.map(async (task) => {
            try {
              await queryClient.prefetchQuery({
                queryKey: task.key,
                queryFn: task.fn,
                staleTime: 1000 * 60 * 5,
              });
            } catch {
              // prefetch fail không ảnh hưởng auth
            } finally {
              advance("Đang tải sản phẩm...");
            }
          }),
        );

        setProgress(100);
        setMessage("Hoàn tất!");

        if (isFirstTime) {
          await new Promise((r) => setTimeout(r, 300));
        }
      } finally {
        localStorage.setItem("appInitialized", "true");
        setIsWorking(false); // ← ĐÚNG tên state, không còn setIsInitialized không tồn tại
      }
    };

    initAuth();
  }, []);

  return (
    <>
      {children}
      {isWorking && isFirstTime && (
        <FullLoadingScreen progress={progress} message={message} />
      )}
      {isWorking && !isFirstTime && <BackgroundLoadingBadge />}
    </>
  );
}
