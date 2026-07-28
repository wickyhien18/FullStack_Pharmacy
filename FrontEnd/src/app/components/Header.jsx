import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  MapPin,
  Github,
  ChevronDown,
  Menu,
  X,
  Bell,
  Package,
  FileText,
  Stethoscope,
} from "lucide-react";
import { useCart } from "@/hooks/useCart.js";
import { useCategories } from "../../hooks/useProducts.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";

function Header() {
  const { totalItems } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catNavOpen, setCatNavOpen] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const { items: notifications, unreadCount, markAllRead } = useNotifications();

  const { data: categoriesData } = useCategories();
  const categoryIconMap = {
    "duoc-my-pham": "✨",
    "thiet-bi-y-te": "🩺",
    "thuoc-ho-hap": "🫁",
    "thuoc-tim-mach": "❤️",
    "vitamin-khoang-chat": "💊",
    "thuoc-tieu-hoa": "🤢",
    "thuoc-giam-dau-ha-sot": "🤧",
    "cham-soc-da": "💅",
    "san-pham-me-va-be": "👩‍🍼",
  };

  const categoriesArray = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.items || [];

  const liveCategories =
    (categoriesArray || []).map((c) => ({
      id: c.slug,
      name: c.name,
      icon: categoryIconMap[c.slug] || "💊",
      slug: c.slug,
    })) || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div
        style={{ backgroundColor: "#1250dc" }}
        className="text-white py-1.5 px-4 text-xs overflow-hidden"
      >
        <Link
          to="https://github.com/wickyhien18/FullStack_Pharmacy"
          target="_blank"
          className="hover:text-blue-200 transition-colors"
        >
          <span className="animate-marquee text-sm inline-flex items-center gap-2">
            {Array(10)
              .fill(null)
              .map((_, i) => (
                <span key={i} className="inline-flex items-center gap-3">
                  <Github size={20} />
                  WICKY HIEN — SOURCE CODE GITHUB
                  <span className="mx-3">•</span>
                </span>
              ))}
          </span>
        </Link>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2 md:gap-4">
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
                className="font-bold text-base md:text-lg leading-tight"
              >
                WICKY HIEN
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 leading-tight">
                Dự án Sản phẩm
              </div>
            </div>
          </Link>

          {/* Search — Desktop */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-5xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thực phẩm chức năng..."
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

          {/* Action icons */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <Link
              to="/account"
              className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex"
            >
              <User size={20} />
              <span>
                {user && isAuthenticated ? user.userName : "Đăng Nhập"}
              </span>
            </Link>
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
              <span className="text-[11px] sm:text-xs">Giỏ hàng</span>
            </Link>

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen && unreadCount > 0) markAllRead();
                  }}
                  className="relative flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  <div className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                        style={{ backgroundColor: "#f05a22", fontSize: "9px" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs">Thông báo</span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400 text-center">
                        Chưa có thông báo
                      </p>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n.notificationId || i}
                          className="p-3 border-b border-gray-50 text-sm text-gray-700"
                        >
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="block md:hidden px-4 pb-2.5">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-3 pr-10 py-2 border-2 rounded-xl text-xs focus:outline-none"
                style={{ borderColor: "#1250dc" }}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3 rounded-r-xl text-white flex items-center justify-center"
                style={{ backgroundColor: "#1250dc" }}
              >
                <Search size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-white border-b border-gray-100 hidden md:block ">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide hide-scrollbar overflow-hidden">
            {liveCategories.map((link) => (
              <Link
                key={link.name}
                to={"/products?category=" + link.slug}
                className={`px-3 first:pl-0 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-blue-700 ${link.highlight ? "text-red-500 hover:text-red-600 hover:border-red-500" : "text-gray-700 hover:text-blue-700"}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="divide-y divide-gray-100">
            {/* Top: Thông tin đăng nhập / tài khoản */}
            <Link
              to="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-blue-700 bg-blue-50/60"
            >
              <User size={18} />
              <span>
                {user && isAuthenticated
                  ? `Tài khoản (${user.userName})`
                  : "Đăng nhập / Đăng ký"}
              </span>
            </Link>

            {/* Giỏ hàng */}
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-gray-500" />
                <span>Giỏ hàng</span>
              </div>
              {totalItems > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Collapsible Category Accordion */}
            <div>
              <button
                onClick={() => setCatNavOpen(!catNavOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>Danh mục sản phẩm</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${catNavOpen ? "rotate-180" : ""}`}
                />
              </button>

              {catNavOpen && (
                <div className="bg-gray-50/80 divide-y divide-gray-100 pl-4">
                  {liveCategories.map((link) => (
                    <Link
                      key={link.name}
                      to={"/products?category=" + link.slug}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:text-blue-700"
                    >
                      {link.icon} {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
export { Header };
