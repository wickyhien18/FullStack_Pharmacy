// ================================================================
// Header.jsx — Thanh điều hướng chính
// ================================================================
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store.js";
import { useAuth } from "@/hooks/useAuth.js";

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary-600 shrink-0">
            💊 Nhà Thuốc
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm thuốc, vitamin..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm
                           focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-4">
            <Link
              to="/medicines"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Sản phẩm
            </Link>

            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart size={22} />
              {/* Badge số lượng — sẽ kết nối cart store sau */}
              <span
                className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs
                               rounded-full w-4 h-4 flex items-center justify-center"
              >
                0
              </span>
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-primary-600"
                >
                  <User size={18} />
                  <span className="max-w-24 truncate">{user?.fullName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-primary-500 text-white px-4 py-1.5 rounded-full
                             hover:bg-primary-600 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
