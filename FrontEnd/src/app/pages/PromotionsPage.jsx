import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Tag, Clock, ChevronRight, Zap } from "lucide-react";
import { promotions, products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
function Countdown({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 1e3));
      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor(diff % 86400 / 3600),
        minutes: Math.floor(diff % 3600 / 60),
        seconds: diff % 60
      });
    };
    calc();
    const id = setInterval(calc, 1e3);
    return () => clearInterval(id);
  }, [endDate]);
  const pad = (n) => String(n).padStart(2, "0");
  return <div className="flex items-center gap-1">
      {timeLeft.days > 0 && <><span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">{pad(timeLeft.days)}d</span><span className="text-white/70">:</span></>}
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((v, i) => <span key={i} className="flex items-center gap-1">
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">{pad(v)}</span>
          {i < 2 && <span className="text-white/70">:</span>}
        </span>)}
    </div>;
}
function PromotionsPage() {
  const saleProducts = products.filter((p) => p.discount && p.discount >= 18).slice(0, 8);
  return <div className="max-w-7xl mx-auto px-4 py-5">
      {
    /* Breadcrumb */
  }
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Khuyến mãi</span>
      </nav>

      {
    /* Hero */
  }
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "linear-gradient(135deg, #1250dc, #0a3a9e)" }}>
        <div className="px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={20} />
              <span className="text-sm font-medium text-white/80">Ưu đãi hôm nay</span>
            </div>
            <h1 className="font-bold mb-2" style={{ fontSize: "2rem", lineHeight: 1.2 }}>Khuyến Mãi Long Châu</h1>
            <p className="text-white/80 text-sm">Hàng ngàn sản phẩm giảm giá mỗi ngày. Đặt hàng ngay để không bỏ lỡ!</p>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="text-center">
              <div className="font-bold" style={{ fontSize: "2.5rem" }}>50%</div>
              <div className="text-sm text-white/70">Giảm tối đa</div>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="font-bold" style={{ fontSize: "2.5rem" }}>500+</div>
              <div className="text-sm text-white/70">Sản phẩm sale</div>
            </div>
            <div className="w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="font-bold" style={{ fontSize: "2.5rem" }}>0đ</div>
              <div className="text-sm text-white/70">Ship từ 150k</div>
            </div>
          </div>
        </div>
      </div>

      {
    /* Promotion cards */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {promotions.map((promo) => <Link
    key={promo.id}
    to={promo.category ? `/products?category=${promo.category}` : "/products"}
    className="group relative rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
    style={{ height: "220px" }}
  >
            <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div>
                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: promo.badgeColor }}>
                  {promo.badge}
                </span>
                <h3 className="text-white font-bold mt-3 mb-1" style={{ fontSize: "1.25rem" }}>{promo.title}</h3>
                <p className="text-white/80 text-sm">{promo.subtitle}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Clock size={14} />
                  <span>Kết thúc sau:</span>
                  <Countdown endDate={promo.endDate} />
                </div>
                <span className="text-white text-sm font-medium">Xem ngay →</span>
              </div>
            </div>
          </Link>)}
      </div>

      {
    /* Coupon codes */
  }
      <div className="bg-white rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "1.1rem" }}>
          <Tag size={18} style={{ color: "#1250dc" }} /> Mã giảm giá
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
    { code: "LONGCHAU10", desc: "Gi\u1EA3m 10% cho \u0111\u01A1n h\xE0ng b\u1EA5t k\u1EF3", min: "Kh\xF4ng gi\u1EDBi h\u1EA1n" },
    { code: "FREESHIP50", desc: "Mi\u1EC5n ph\xED v\u1EADn chuy\u1EC3n cho \u0111\u01A1n t\u1EEB 50k", min: "\u0110\u01A1n t\u1EEB 50.000\u0111" },
    { code: "NEWUSER30", desc: "Gi\u1EA3m 30% cho kh\xE1ch h\xE0ng m\u1EDBi", min: "L\u1EA7n \u0111\u1EA7u mua h\xE0ng" }
  ].map((coupon) => <div key={coupon.code} className="border-2 border-dashed border-blue-200 rounded-xl p-4 relative hover:border-blue-400 transition-colors cursor-pointer">
              <div className="absolute -left-px top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full border-r-2 border-dashed border-blue-200" />
              <div className="absolute -right-px top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full border-l-2 border-dashed border-blue-200" />
              <div className="font-bold text-lg mb-1" style={{ color: "#1250dc" }}>{coupon.code}</div>
              <div className="text-sm text-gray-600 mb-1">{coupon.desc}</div>
              <div className="text-xs text-gray-400">{coupon.min}</div>
            </div>)}
        </div>
      </div>

      {
    /* Flash sale products */
  }
      <section className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 flex items-center gap-2" style={{ fontSize: "1.1rem" }}>
            <Zap size={20} className="text-red-500" fill="currentColor" /> Sản phẩm đang giảm giá
          </h2>
          <Link to="/products" className="text-sm font-medium flex items-center gap-1" style={{ color: "#1250dc" }}>
            Xem thêm <ChevronRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {saleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>;
}
export {
  PromotionsPage as default
};
