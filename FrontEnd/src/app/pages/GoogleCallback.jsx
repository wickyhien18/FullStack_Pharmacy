// ================================================================
// GoogleCallback.jsx — Trang xử lý callback từ Google OAuth
// Đặt tại: src/app/pages/GoogleCallback.jsx
// Route: /auth/callback
// ================================================================
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";

export default function GoogleCallback() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token    = params.get("token");
    const userId   = params.get("userId");
    const userName = params.get("userName");
    const fullName = params.get("fullName");
    const email    = params.get("email");
    const role     = params.get("role");
    const error    = params.get("error");

    if (error) {
      navigate("/account?error=" + error);
      return;
    }

    if (token && userId) {
      // Lưu auth vào store
      setAuth(
        { userId, userName, fullName, email, role, isActive: true },
        token,
      );
      localStorage.setItem("hasSession", "true");

      // Xoá params khỏi URL (bảo mật — không để token trong history)
      window.history.replaceState({}, document.title, "/");

      navigate("/");
    } else {
      navigate("/account");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">💊</div>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
