// ================================================================
// Header.jsx — Convert từ bigspring Header.js
// Thay đổi:
//   next/link      → Link từ react-router-dom
//   usePathname()  → useLocation() từ react-router-dom
//   "use client"   → bỏ đi (Vite mặc định client-side)
//   Thêm auth state: hiện tên user + nút logout khi đã đăng nhập
// ================================================================
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useCartStore } from "@/stores/cart.store.js";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Bell,
  Package,
  FileText,
  Stethoscope,
  LogOut,
} from "lucide-react";

// Menu điều hướng — tuỳ chỉnh theo project pharmacy
const mainMenu = [
  { name: "Trang chủ", url: "/" },
  { name: "Sản phẩm", url: "/medicines" },
  { name: "Đơn hàng", url: "/orders" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  const { items } = useCartStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/medicines");
    }
  };

  // Tổng số lượng sản phẩm trong giỏ
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div
        style={{ backgroundColor: "#1250dc" }}
        className="text-white py-1.5 px-4 text-xs"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <a
              href="tel:18006928"
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
            >
              <Phone size={12} />
              <span>Hotline: 1800 6928 (Miễn phí)</span>
            </a>
            <span className="hidden md:flex items-center gap-1">
              <Package size={12} />
              <Link
                to="/account"
                className="hover:text-blue-200 transition-colors"
              >
                Tra cứu đơn hàng
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1">
              <Bell size={12} />
              <span>Nhận thông báo khuyến mãi</span>
            </span>
            <Link
              to="/pharmacies"
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
            >
              <MapPin size={12} />
              <span>Tìm nhà thuốc</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Main header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              style={{ backgroundColor: "#1250dc" }}
              className="p-2 rounded-xl"
            >
              <span className="text-white text-xl">💊</span>
            </div>
            <div>
              <div
                style={{ color: "#1250dc" }}
                className="font-bold text-lg leading-tight"
              >
                Long Châu
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                Nhà thuốc FPT
              </div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm thuốc, thực phẩm chức năng, sản phẩm..."
                className="w-full pl-4 pr-12 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors"
                style={{ borderColor: "#1250dc" }}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 rounded-r-xl text-white transition-colors"
                style={{ backgroundColor: "#1250dc" }}
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Services icons */}
          {/* <div className="hidden lg:flex items-center gap-1 text-xs text-gray-600">
            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
              <FileText size={20} className="text-gray-500" />
              <span>Đơn thuốc</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
              <Stethoscope size={20} className="text-gray-500" />
              <span>Tư vấn</span>
            </div>
          </div> */}

          {/* Action icons */}
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex"
            >
              <User size={20} />
              <span>Tài khoản</span>
            </Link>
            {/* <Link
              to="/wishlist"
              className="relative flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex"
            >
              <div className="relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ fontSize: "9px" }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span>Yêu thích</span>
            </Link> */}
            <Link
              to="/cart"
              className="relative flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ backgroundColor: "#f05a22", fontSize: "9px" }}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <span>Giỏ hàng</span>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setNavOpen(!navOpen)}
            >
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <nav className="navbar container">
        {/* Mobile toggle button */}
        <button
          className="order-2 flex cursor-pointer items-center md:order-1 md:hidden"
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? (
            <svg className="h-6 fill-current" viewBox="0 0 20 20">
              <title>Menu Open</title>
              <polygon
                points="11 9 22 9 22 11 11 11 11 22 9 22 9 11 -2 11 -2 9 9 9 9 -2 11 -2"
                transform="rotate(45 10 10)"
              />
            </svg>
          ) : (
            <svg className="h-6 fill-current" viewBox="0 0 20 20">
              <title>Menu Close</title>
              <path d="M0 3h20v2H0V3z m0 6h20v2H0V9z m0 6h20v2H0V15z" />
            </svg>
          )}
        </button>

        {/* Nav menu */}
        <div
          className={`order-3 w-full overflow-hidden transition-all duration-300 md:order-1 md:max-h-full md:w-auto ${
            navOpen ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          <ul className="navbar-nav block w-full md:flex md:w-auto lg:space-x-2">
            {mainMenu.map((menu, i) => (
              <li className="nav-item" key={i}>
                <Link
                  to={menu.url}
                  onClick={() => setNavOpen(false)}
                  className={`nav-link block ${
                    location.pathname === menu.url ? "nav-link-active" : ""
                  }`}
                >
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side — cart + auth */}
        <div className="order-1 ml-auto flex items-center gap-4 md:order-2 md:ml-0">
          {/* Giỏ hàng */}
          <Link
            to="/cart"
            className="relative text-dark hover:text-primary transition"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-primary text-white text-xs
                               rounded-full w-4 h-4 flex items-center justify-center"
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1 text-sm text-dark hover:text-primary"
              >
                <User size={18} />
                <span className="hidden md:inline max-w-[100px] truncate">
                  {user?.fullName}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-text hover:text-red-500 transition"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="nav-link hidden md:block">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn btn-primary py-[10px] px-5 text-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
