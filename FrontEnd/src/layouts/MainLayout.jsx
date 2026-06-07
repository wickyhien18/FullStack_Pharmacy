// ================================================================
// MainLayout.jsx — Layout chính cho trang người dùng
// Outlet là nơi React Router render page component con vào
// ================================================================
import { Outlet } from "react-router-dom";
import Header from "@/components/common/Header.jsx";
import Footer from "@/components/common/Footer.jsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Outlet render page tương ứng với route hiện tại */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
