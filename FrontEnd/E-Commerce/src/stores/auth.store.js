// ================================================================
// auth.store.js — Zustand store quản lý trạng thái đăng nhập
// Zustand là thư viện state management đơn giản hơn Redux.
// State ở đây là global — mọi component đều đọc được.
// ================================================================
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // ── State ─────────────────────────────────────────────────────
  user: null, // thông tin user đang đăng nhập
  accessToken: null, // JWT access token — lưu memory, KHÔNG localStorage
  isAuthenticated: false,

  // ── Actions ───────────────────────────────────────────────────

  // Gọi sau khi login thành công
  setAuth: (user, accessToken) => {
    localStorage.setItem("hasSession", true); // set flag to indicate we have a session (for debugging)
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },
  // Gọi sau khi logout
  clearAuth: () => {
    localStorage.removeItem("hasSession");
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
  // Gọi sau khi refresh token — chỉ cập nhật accessToken
  setAccessToken: (accessToken) => set({ accessToken }),
}));
