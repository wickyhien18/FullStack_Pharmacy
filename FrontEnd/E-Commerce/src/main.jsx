// ================================================================
// main.jsx — Thêm AuthInitializer bọc App
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import "./index.css";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* AuthInitializer chạy trước App — khôi phục session từ cookie */}
        <AuthInitializer>
          <App />
        </AuthInitializer>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            unstyled: true, // bỏ toàn bộ style mặc định
            className:
              "flex items-center gap-3 bg-white border border-border rounded px-4 py-3 shadow-md text-sm font-primary text-dark",
            success: {
              className:
                "flex items-center gap-3 bg-white border border-primary rounded px-4 py-3 shadow-md text-sm font-primary text-dark",
            },
            error: {
              className:
                "flex items-center gap-3 bg-white border border-red-400 rounded px-4 py-3 shadow-md text-sm font-primary text-dark",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
