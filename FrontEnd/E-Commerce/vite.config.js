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
      "@layouts": path.resolve(__dirname, "./layouts"),
      "@components": path.resolve(__dirname, "./layouts/components"),
      "@partials": path.resolve(__dirname, "./layouts/partials"),
      "@shortcodes": path.resolve(__dirname, "./layouts/shortcodes"),
      "@config": path.resolve(__dirname, "./config"),
      "@json": path.resolve(__dirname, "./json"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@lib": path.resolve(__dirname, "./lib"),
      "@styles": path.resolve(__dirname, "./styles"),
      "@content": path.resolve(__dirname, "./content"),
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
