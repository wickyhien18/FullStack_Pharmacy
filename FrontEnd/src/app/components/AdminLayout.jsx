import { useEffect, useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
  ScrollRestoration,
} from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isStaff = user?.role === "ROLE_STAFF";

  useEffect(() => {
    if (!isAuthenticated || (!isAdmin && !isStaff)) {
      toast.error("Bạn không có quyền truy cập trang quản trị");
      navigate("/");
      return;
    }
    // Staff không có quyền Dashboard/Users — tự điều hướng nếu cố vào bằng URL
    const restricted = ["/admin", "/admin/users"];
    if (isStaff && restricted.includes(location.pathname)) {
      navigate("/admin/orders");
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  useEffect(() => {
    // Đóng drawer khi đổi trang trên mobile
    setMobileOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || (!isAdmin && !isStaff)) return null;

  const navItems = isAdmin
    ? [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin/products", label: "Sản phẩm", icon: Package },
        { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
        { to: "/admin/users", label: "Người dùng", icon: Users },
        {
          to: "/admin/cancel-requests",
          label: "Yêu cầu huỷ",
          icon: AlertCircle,
        },
      ]
    : [
        {
          to: "/admin/orders",
          label: "Đơn hàng",
          icon: ShoppingCart,
          end: true,
        },
        { to: "/admin/products", label: "Sản phẩm & Kho", icon: Package },
        {
          to: "/admin/cancel-requests",
          label: "Yêu cầu huỷ",
          icon: AlertCircle,
        },
      ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-blue-700">
            {isAdmin ? "Quản trị Nhà thuốc" : "Khu vực Nhân viên"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.fullName || user?.userName} ({isStaff ? "Shipper / Dược sĩ" : "Admin"})
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <div className="border-t border-gray-100 my-4 pt-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại trang chủ
          </NavLink>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <ScrollRestoration />

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="font-bold text-sm text-blue-700">
              {isAdmin ? "Quản trị Nhà thuốc" : "Khu vực Nhân viên"}
            </div>
            <div className="text-[11px] text-gray-500">
              {isStaff ? "Shipper / Dược sĩ" : "Quản trị viên"}
            </div>
          </div>
        </div>
        <NavLink
          to="/"
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Trang chủ
        </NavLink>
      </header>

      {/* Mobile Slide-over Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-sm flex-col shrink-0 border-r border-gray-100 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
