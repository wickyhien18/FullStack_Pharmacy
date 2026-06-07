// ================================================================
// App.jsx — Root component, định nghĩa toàn bộ routing
// ================================================================
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";

// Layouts
import MainLayout from "@/layouts/MainLayout.jsx";
import AdminLayout from "@/layouts/AdminLayout.jsx";

// Pages — Public
import HomePage from "@/pages/HomePage.jsx";
import MedicineListPage from "@/pages/MedicineListPage.jsx";
import MedicineDetail from "@/pages/MedicineDetailPage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import CartPage from "@/pages/CartPage.jsx";
import CheckoutPage from "@/pages/CheckoutPage.jsx";
import OrderHistoryPage from "@/pages/OrderHistoryPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";

// Pages — Admin
import AdminDashboard from "@/pages/admin/DashboardPage.jsx";
import AdminProducts from "@/pages/admin/ProductsPage.jsx";
import AdminOrders from "@/pages/admin/OrdersPage.jsx";
import AdminUsers from "@/pages/admin/UsersPage.jsx";

// ── Route Guards ──────────────────────────────────────────────

// PrivateRoute: chỉ cho vào nếu đã đăng nhập
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// AdminRoute: chỉ cho vào nếu là ROLE_ADMIN
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ROLE_ADMIN") return <Navigate to="/" replace />;
  return children;
};

// ── App Component ─────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* ── Public routes — dùng MainLayout (header + footer) ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/medicines" element={<MedicineListPage />} />
        <Route path="/medicines/:slug" element={<MedicineDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected routes — cần đăng nhập ── */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* ── Admin routes — dùng AdminLayout (sidebar) ── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
