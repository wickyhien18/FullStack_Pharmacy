// ================================================================
// vite.config.js — cấu hình Vite build tool
// ================================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Đặt alias @ = thư mục src
      // Thay vì import '../../components/Button' → import '@/components/Button'
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173, // port mặc định Vite

    // Proxy API calls sang backend — tránh lỗi CORS khi dev
    // Khi gọi /api/auth/login → Vite tự chuyển sang http://localhost:3000/api/auth/login
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
