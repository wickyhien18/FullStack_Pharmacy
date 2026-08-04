import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// ── Eager load — layout và trang quan trọng nhất ─────────────────
import Layout from "../components/Layout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

// ── Lazy load — chỉ load khi user điều hướng đến ─────────────────
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const AccountPage = lazy(() => import("../pages/AccountPage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const GoogleCallback = lazy(() => import("../pages/GoogleCallback"));

// Admin — lazy load toàn bộ vì user thường không vào
const AdminLayout = lazy(() => import("../components/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/DashboardPage"));
const AdminProducts = lazy(() => import("../pages/admin/ProductsPage"));
const AdminOrders = lazy(() => import("../pages/admin/OrdersPage"));
const AdminUsers = lazy(() => import("../pages/admin/UsersPage"));
const CancelRequestsPage = lazy(
  () => import("../pages/admin/CancelRequestsPage"),
);

// Fallback hiện trong lúc lazy component đang load
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Wrapper bọc Suspense cho từng route
const S = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: S(ProductListPage) },
      { path: "products/:id", element: S(ProductDetailPage) },
      { path: "cart", element: S(CartPage) },
      { path: "checkout", element: S(CheckoutPage) },
      { path: "account", element: S(AccountPage) },
      { path: "search", element: S(SearchPage) },
      { path: "*", element: <NotFoundPage /> },
      { path: "auth/callback", element: S(GoogleCallback) },
    ],
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: S(AdminDashboard) },
      { path: "products", element: S(AdminProducts) },
      { path: "orders", element: S(AdminOrders) },
      { path: "users", element: S(AdminUsers) },
      { path: "cancel-requests", element: S(CancelRequestsPage) },
    ],
  },
]);

export { router };
