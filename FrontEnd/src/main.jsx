// ================================================================
// main.jsx — Khởi chạy bản mockup giao diện Long Châu kết nối API
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import AuthInitializer from "./app/components/AuthInitializer.jsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 giây — sau đó coi là stale
      refetchOnWindowFocus: true, // fetch lại khi focus tab
      refetchOnMount: true, // fetch lại khi component mount (chuyển trang)
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <App />
      </AuthInitializer>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "20px" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
