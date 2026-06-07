// ================================================================
// main.jsx — Entry point của React app
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

// QueryClient — cấu hình React Query (cache, retry, staleTime...)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // data được coi là fresh trong 5 phút
      retry: 1, // thử lại 1 lần nếu query thất bại
      refetchOnWindowFocus: false, // không tự fetch lại khi focus tab
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* QueryClientProvider — cung cấp React Query cho toàn app */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter — cung cấp React Router cho toàn app */}
      <BrowserRouter>
        <App />
        {/* Toaster — hiển thị toast notification ở góc màn hình */}
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
