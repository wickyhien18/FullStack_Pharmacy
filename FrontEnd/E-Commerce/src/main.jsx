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
      staleTime: 1000 * 60 * 5, // 5 phút
      retry: 1,
      refetchOnWindowFocus: false,
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
        position="top"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "30px" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
