import { useEffect } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { to: "/admin/users", label: "Người dùng", icon: Users },
  { to: "/admin/cancel-requests", label: "Yêu cầu huỷ", icon: AlertCircle },
];

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-gray-100">
      <ScrollRestoration />
      <aside className="w-64 bg-white shadow-sm flex flex-col shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-blue-700">
            {isAdmin ? "Quản trị Nhà thuốc" : "Khu vực Nhân viên"}
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              Quay lại trang chủ
            </NavLink>
          </div>
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
