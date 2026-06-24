// ================================================================
// Layout.jsx — Quay về bản đơn giản, không cần Context nữa
// Overlay được xử lý hoàn toàn trong AuthInitializer
// ================================================================
import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

function Layout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f4f5f7" }}
    >
      <Header />
      <main className="flex-1" style={{ minHeight: "60vh" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export { Layout as default };
