// ================================================================
// main.jsx — Staring Point - Run first when the page loads
// ================================================================
import React from "react";
import ReactDOM from "react-dom/client";

// Query Client - the 'brain' that manages cached data fetched from API (useQuery, useMutation)
// Query Client Provider - Context Provider
// Provides instance Query Client to all child components by React Context
// Any component can call useQuery directly, without needing to pass data down via props
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Component render Toaster - notification that display in pages
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// File css global scope
import "./styles/index.css";

// Create a single QueryClient instance for entire app
// DO NOT recreate it inside component that would create a new instance on every re-render, losing all cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // using data from cache in 5 minute, after 5 minute fetching new data
      refetchOnWindowFocus: false, // turn off to pretend call API everytime user switch tabs
      refetchOnMount: true, // when user switch back the page before, fetch again data to make sure data not too "old"
      retry: 1, // retry request once more time before display error
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
      {/*Catch error from everything in app*/}
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
