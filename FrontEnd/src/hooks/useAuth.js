// ================================================================
// useAuth.js — Custom hook gói gọn logic auth
// Component chỉ cần gọi useAuth() thay vì import nhiều thứ.
// ================================================================
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCart } from "@/hooks/useCart.js";
import { translateApiMessage } from "@/utils/errorMessages.js";
import {
  login,
  register,
  logOut,
  completeGoogleSignup,
} from "../services/auth.service.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const { clearCart } = useCart();

  // ── Login mutation ────────────────────────────────────────────
  // useMutation: dùng cho các action thay đổi data (POST/PUT/DELETE)
  // Khác useQuery ở chỗ: không tự chạy, phải gọi mutate() thủ công
  const loginMutation = useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        translateApiMessage(error.response?.data?.message) ||
          "Đăng nhập thất bại",
      );
    },
  });

  // ── Register mutation ─────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data) => register(data),
  });

  // Wrap mutate để nhận callback từ bên ngoài
  const register = (data, options = {}) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        options.onSuccess?.(); // gọi callback nếu có
      },
      onError: (error) => {
        toast.error(
          translateApiMessage(error.response?.data?.message) ||
            "Đăng ký thất bại",
        );
      },
    });
  };

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await logOut();
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

  const completeGoogleSignupMutation = useMutation({
    mutationFn: (data) => completeGoogleSignup(data),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success("Tạo tài khoản thành công!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        translateApiMessage(error.response?.data?.message) ||
          "Tạo tài khoản thất bại",
      );
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register,
    isRegistering: registerMutation.isPending,
    logout,
    completeGoogleSignup: completeGoogleSignupMutation.mutate,
    isCompletingGoogleSignup: completeGoogleSignupMutation.isPending,
  };
};
