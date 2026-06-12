import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  Stethoscope
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCategories } from "../../hooks/useMedicines.js";

const navLinks = [
  { label: "Thuốc tiêu hóa", href: "/products?category=thuoc-tieu-hoa" },
  { label: "TPCN", href: "/products?category=vitamin-khoang-chat" },
  { label: "Làm đẹp", href: "/products?category=duoc-my-pham" },
  { label: "Thiết bị y tế", href: "/products?category=thiet-bi-y-te" },
  { label: "Khuyến mãi", href: "/promotions", highlight: true },
  { label: "Sức khỏe", href: "/blog" }
];
function Header() {
  const { totalItems, wishlist } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categoriesData } = useCategories();
  const categoryIconMap = {
    "duoc-my-pham": "✨",
    "thiet-bi-y-te": "🩺",
    "thuoc-ho-hap": "🫁",
    "thuoc-tieu-hoa": "🧪",
    "thuoc-tim-mach": "❤️",
    "vitamin-khoang-chat": "💊"
  };

  const liveCategories = categoriesData?.items?.map(c => ({
    id: c.slug,
    name: c.name,
    icon: categoryIconMap[c.slug] || "💊",
    count: 100
  })) || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return <header className="sticky top-0 z-50 bg-white shadow-sm">
    {
      /* Top bar */
    }
    <div style={{ backgroundColor: "#1250dc" }} className="text-white py-1.5 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <a href="tel:18006928" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
            <Phone size={12} />
            <span>Hotline: 1800 6928 (Miễn phí)</span>
          </a>
          <span className="hidden md:flex items-center gap-1">
            <Package size={12} />
            <Link to="/account" className="hover:text-blue-200 transition-colors">Tra cứu đơn hàng</Link>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1">
            <Bell size={12} />
            <span>Nhận thông báo khuyến mãi</span>
          </span>
          <Link to="/pharmacies" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
            <MapPin size={12} />
            <span>Tìm nhà thuốc</span>
          </Link>
        </div>
      </div>
    </div>

    {
      /* Main header */
    }
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {
          /* Logo */
        }
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div style={{ backgroundColor: "#1250dc" }} className="p-2 rounded-xl">
            <span className="text-white text-xl">💊</span>
          </div>
          <div>
            <div style={{ color: "#1250dc" }} className="font-bold text-lg leading-tight">Long Châu</div>
            <div className="text-xs text-gray-500 leading-tight">Nhà thuốc FPT</div>
          </div>
        </Link>

        {
          /* Search */
        }
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

        {
          /* Services icons */
        }
        <div className="hidden lg:flex items-center gap-1 text-xs text-gray-600">
          <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
            <FileText size={20} className="text-gray-500" />
            <span>Đơn thuốc</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50">
            <Stethoscope size={20} className="text-gray-500" />
            <span>Tư vấn</span>
          </div>
        </div>

        {
          /* Action icons */
        }
        <div className="flex items-center gap-2">
          <Link to="/account" className="flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex">
            <User size={20} />
            <span>Tài khoản</span>
          </Link>
          <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex">
            <div className="relative">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" style={{ fontSize: "9px" }}>
                {wishlist.length}
              </span>}
            </div>
            <span>Yêu thích</span>
          </Link>
          <Link to="/cart" className="relative flex flex-col items-center gap-0.5 text-xs text-gray-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50">
            <div className="relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: "#f05a22", fontSize: "9px" }}>
                {totalItems}
              </span>}
            </div>
            <span>Giỏ hàng</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </div>

    {
      /* Category nav */
    }
    <div className="bg-white border-b border-gray-100 hidden md:block">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          <div className="group relative">
            <button className="flex items-center gap-1 px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-700 whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-blue-700">
              <Menu size={16} />
              Danh mục
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 bg-white shadow-xl rounded-b-xl border border-t-0 border-gray-100 z-50 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {liveCategories.map((cat) => <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span className="text-lg">{cat.icon}</span>
                <div>
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-xs text-gray-400">{cat.count.toLocaleString()} sản phẩm</div>
                </div>
              </Link>)}
            </div>
          </div>
          {navLinks.map((link) => <Link
            key={link.label}
            to={link.href}
            className={`px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-blue-700 ${link.highlight ? "text-red-500 hover:text-red-600 hover:border-red-500" : "text-gray-700 hover:text-blue-700"}`}
          >
            {link.label}
          </Link>)}
        </nav>
      </div>
    </div>

    {
      /* Mobile menu */
    }
    {menuOpen && <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
      <form onSubmit={handleSearch} className="p-4 border-b border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-4 pr-12 py-2.5 border-2 rounded-xl text-sm focus:outline-none"
            style={{ borderColor: "#1250dc" }}
          />
          <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 rounded-r-xl text-white" style={{ backgroundColor: "#1250dc" }}>
            <Search size={18} />
          </button>
        </div>
      </form>
      <div className="divide-y divide-gray-100">
        {navLinks.map((link) => <Link
          key={link.label}
          to={link.href}
          onClick={() => setMenuOpen(false)}
          className={`block px-4 py-3 text-sm font-medium ${link.highlight ? "text-red-500" : "text-gray-700"}`}
        >
          {link.label}
        </Link>)}
        <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700">Tài khoản</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-gray-700">Giỏ hàng ({totalItems})</Link>
      </div>
    </div>}
  </header>;
}
export {
  Header
};
