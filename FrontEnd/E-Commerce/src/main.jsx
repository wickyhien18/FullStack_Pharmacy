// ================================================================
// main.jsx — Thêm AuthInitializer bọc App và kết nối API thực
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
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
      <BrowserRouter>
        <AuthInitializer>
          <App />
        </AuthInitializer>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
