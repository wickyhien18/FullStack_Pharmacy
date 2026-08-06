// ================================================================
// main.jsx — Staring Point - Run first when the page loads
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

// Mount React into <div id="root"></div> that is inside index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  //Plugging in global service
  <React.StrictMode>
    {/*Development Tool - Intentionally making certain things run TWICE in the dev enviroment*/}
    {/*Help detect potential bugs in the code*/}
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          {/* Bootstrapping App */}
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
    </ErrorBoundary>
  </React.StrictMode>,
);
