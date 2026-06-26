// ================================================================
// useAuth.js — Custom hook gói gọn logic auth
// Component chỉ cần gọi useAuth() thay vì import nhiều thứ.
// ================================================================
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCart } from "@/hooks/useCart.js";
import api from "@/lib/axios.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const { clearCart } = useCart();

  // ── Login mutation ────────────────────────────────────────────
  // useMutation: dùng cho các action thay đổi data (POST/PUT/DELETE)
  // Khác useQuery ở chỗ: không tự chạy, phải gọi mutate() thủ công
  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post("/auth/login", credentials),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success("Đăng nhập thành công!");
      // Redirect về trang chủ sau khi login
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    },
  });

  // ── Register mutation ─────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data) => api.post("/auth/register", data),
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    },
  });

  // Wrap mutate để nhận callback từ bên ngoài
  const register = (data, options = {}) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        options.onSuccess?.(); // gọi callback nếu có
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Đăng ký thất bại");
      },
    });
  };

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Dù API lỗi vẫn clear state — user phải thoát được
    } finally {
      localStorage.removeItem("hasSession");
      localStorage.removeItem("appInitialized");
      clearCart();
      clearAuth();
      navigate("/");
      toast.success("Đã đăng xuất");
    }
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register,
    isRegistering: registerMutation.isPending,
    logout,
  };
};
