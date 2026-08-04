import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
  MapPin,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useProducts, useCategoriesWithCount } from "../hooks/useProducts.js";
function HomePage() {
  const [slide, setSlide] = useState(0);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    limit: 12,
  });
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategoriesWithCount();

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
      count: c.count,
    })) || [];

  const productsList = productsData?.items || [];
  const liveProducts = productsList.map((m, index) => ({
    id: m.slug || m.productId,
    productId: m.productId,
    name: m.name,
    brand: m.manufacturerName || "Dược phẩm",
    category: m.categorySlug || "products",
    price: m.price,
    originalPrice: m.originalPrice || m.price * 1.15,
    discount: m.originalPrice
      ? Math.round((1 - m.price / m.originalPrice) * 100)
      : 15,
    rating: 4.8,
    reviewCount: 42 + index,
    sold: 120 + index * 5,
    stock: m.stock || 50,
    image:
      m.primaryImage ||
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
    images: [
      m.primaryImage ||
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
    ],
    description: m.description || "",
    unit: m.unit || "Hộp",
    isBestSeller: index >= 4 && index < 8,
    isFeatured: index >= 8,
  }));

  const bestSellers =
    liveProducts.slice(4, 8).length > 0
      ? liveProducts.slice(4, 8)
      : liveProducts.slice(0, 4);
  const featured =
    liveProducts.slice(8, 12).length > 0
      ? liveProducts.slice(8, 12)
      : liveProducts.length > 2
        ? liveProducts.slice(2, 6)
        : liveProducts.slice(0, 4);

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Đang tải dữ liệu từ API...</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Banner + sidebar */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-4"> */}
      {/* Main banner */}
      {/* <div
          className="lg:col-span-3 relative rounded-2xl overflow-hidden"
          style={{ height: "300px" }}
        > */}
      {/* {bannerSlides.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-all duration-700 ${i === slide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              style={{ background: b.bg }}
            >
              <div className="flex h-full">
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <div className="text-white/80 text-sm mb-2 font-medium">
                    Nhà thuốc Long Châu
                  </div>
                  <h1
                    className="text-white mb-3"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {b.title}
                  </h1>
                  <p className="text-white/90 mb-6 text-sm">{b.subtitle}</p>
                  <Link
                    to={b.href}
                    className="inline-flex items-center gap-2 bg-white font-semibold px-5 py-2.5 rounded-xl self-start hover:bg-gray-50 transition-colors text-sm"
                    style={{ color: "#1250dc" }}
                  >
                    {b.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="hidden md:block flex-1 relative overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="h-full w-full object-cover opacity-40"
                  />
                </div>
              </div>
            </div>
          ))} */}
      {/* Controls */}
      {/* <button
            onClick={() =>
              setSlide(
                (s) => (s - 1 + bannerSlides.length) % bannerSlides.length,
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft size={20} />
          </button> */}
      {/* <button
            onClick={() => setSlide((s) => (s + 1) % bannerSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronRight size={20} />
          </button> */}
      {/* <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {bannerSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? "bg-white w-6" : "bg-white/50 w-2"}`}
              />
            ))}
          </div> */}
      {/* </div> */}

      {/* Side banners */}
      {/* <div className="hidden lg:flex flex-col gap-4">
          <div
            className="rounded-xl overflow-hidden flex-1"
            style={{ background: "linear-gradient(135deg, #7b1fa2, #4a148c)" }}
          >
            <Link
              to="/products?category=duoc-my-pham"
              className="block h-full p-5 text-white"
            >
              <div className="text-xs text-white/70 mb-1">Chăm sóc sắc đẹp</div>
              <div className="font-bold text-lg leading-tight mb-2">
                Làm đẹp an toàn mỗi ngày
              </div>
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=100&fit=crop&auto=format"
                alt=""
                className="w-full rounded-lg mt-2 opacity-70"
              />
            </Link>
          </div>
          <div
            className="rounded-xl overflow-hidden flex-1"
            style={{ background: "linear-gradient(135deg, #2e7d32, #1b5e20)" }}
          >
            <Link
              to="/products?category=vitamin-khoang-chat"
              className="block h-full p-5 text-white"
            >
              <div className="text-xs text-white/70 mb-1">
                Thực phẩm chức năng
              </div>
              <div className="font-bold text-lg leading-tight mb-2">
                Bổ sung dưỡng chất tự nhiên
              </div>
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=100&fit=crop&auto=format"
                alt=""
                className="w-full rounded-lg mt-2 opacity-70"
              />
            </Link>
          </div>
        </div> */}
      {/* </div> */}
      {/* Quick services */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickServices.map((s) => (
          <Link
            key={s.title}
            to={s.href}
            className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${s.color}15`, color: s.color }}
            >
              {s.icon}
            </div>
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {s.title}
            </span>
          </Link>
        ))}
      </div> */}
      {/* Categories */}
      <section className="bg-white rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-bold text-gray-800 text-base sm:text-lg">
            Danh mục sản phẩm
          </h2>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#1250dc" }}
          >
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
          {liveCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group flex flex-col items-center p-2.5 sm:p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer text-center"
            >
              <div className="text-2xl sm:text-3xl mb-1.5">{cat.icon}</div>
              <div className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-blue-700 leading-tight">
                {cat.name}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                {cat.count.toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-bold text-gray-800 text-base sm:text-lg">
            ⭐ Sản phẩm nổi bật
          </h2>
          <Link
            to="/products?sort=featured"
            className="text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#1250dc" }}
          >
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      {/* Promo banner - hidden until promotion feature is ready */}
      {false && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Giao nhanh 2H",
              desc: "N\u1ED9i th\xE0nh",
              color: "#1250dc",
              img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&auto=format",
            },
            {
              label: "T\xEDch \u0111i\u1EC3m \u0111\u1ED5i qu\xE0",
              desc: "M\u1ED7i \u0111\u01A1n h\xE0ng",
              color: "#e65100",
              img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&auto=format",
            },
            {
              label: "D\u01B0\u1EE3c s\u0129 t\u01B0 v\u1EA5n",
              desc: "Mi\u1EC5n ph\xED 24/7",
              color: "#2e7d32",
              img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop&auto=format",
            },
          ].map((b) => (
            <div
              key={b.label}
              className="relative rounded-2xl overflow-hidden h-32 cursor-pointer group"
            >
              <img
                src={b.img}
                alt={b.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                className="absolute inset-0"
                style={{ background: `${b.color}cc` }}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-5 text-white">
                <div className="font-bold text-lg">{b.label}</div>
                <div className="text-sm text-white/80">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Health Blog - hidden until blog feature is ready */}
      {false && (
        <section className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-bold text-gray-800"
              style={{ fontSize: "1.125rem" }}
            >
              📖 Góc sức khỏe
            </h2>
            <Link
              to="/blog"
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: "#1250dc" }}
            >
              Xem tất cả <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.slice(0, 3).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="overflow-hidden rounded-xl mb-3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#e8efff", color: "#1250dc" }}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {post.readTime} phút đọc
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-500">{post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export { HomePage as default };
