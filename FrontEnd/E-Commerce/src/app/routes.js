import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
// import PromotionsPage from "./pages/PromotionsPage";
// import BlogPage from "./pages/BlogPage";
// import BlogDetailPage from "./pages/BlogDetailPage";
import AccountPage from "./pages/AccountPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin imports
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/DashboardPage";
import AdminProducts from "./pages/admin/ProductsPage";
import AdminOrders from "./pages/admin/OrdersPage";
import AdminUsers from "./pages/admin/UsersPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "products", Component: ProductListPage },
      { path: "products/:id", Component: ProductDetailPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      // { path: "promotions", Component: PromotionsPage },
      // { path: "blog", Component: BlogPage },
      // { path: "blog/:slug", Component: BlogDetailPage },
      { path: "account", Component: AccountPage },
      { path: "search", Component: SearchPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "orders", Component: AdminOrders },
      { path: "users", Component: AdminUsers },
    ],
  },
]);
export { router };
