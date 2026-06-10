// ================================================================
// Header.jsx — Convert từ bigspring Header.js
// Thay đổi:
//   next/link      → Link từ react-router-dom
//   usePathname()  → useLocation() từ react-router-dom
//   "use client"   → bỏ đi (Vite mặc định client-side)
//   Thêm auth state: hiện tên user + nút logout khi đã đăng nhập
// ================================================================
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useCartStore } from "@/stores/cart.store.js";

// Menu điều hướng — tuỳ chỉnh theo project pharmacy
const mainMenu = [
  { name: "Trang chủ", url: "/" },
  { name: "Sản phẩm", url: "/medicines" },
  { name: "Đơn hàng", url: "/orders" },
];

const Header = () => {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  const { items } = useCartStore();

  // Tổng số lượng sản phẩm trong giỏ
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="header sticky top-0 z-50 shadow-sm">
      <nav className="navbar container">
        {/* Logo */}
        <div className="order-0">
          <Link to="/" className="navbar-brand flex items-center gap-2">
            <span className="text-2xl font-bold text-primary font-primary">
              💊 Nhà Thuốc
            </span>
          </Link>
        </div>

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
