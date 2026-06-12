// ================================================================
// vite.config.js — cấu hình Vite build tool
// ================================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(id) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), figmaAssetResolver()],

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
