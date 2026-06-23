import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import {
  useProducts,
  useCategoriesWithCount,
} from "../../hooks/useProducts.js"; // ← đổi import

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
];

const priceRanges = [
  { label: "Dưới 100.000đ", min: 0, max: 1e5 },
  { label: "100.000đ - 300.000đ", min: 1e5, max: 3e5 },
  { label: "300.000đ - 500.000đ", min: 3e5, max: 5e5 },
  { label: "500.000đ - 1.000.000đ", min: 5e5, max: 1e6 },
  { label: "Trên 1.000.000đ", min: 1e6, max: Infinity },
];

const ITEMS_PER_PAGE = 12;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format";

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategoriesWithCount();
  const categorySlug = searchParams.get("category") || "";
  const matchedCategory = categoriesData?.items?.find(
    (c) => c.slug === categorySlug,
  );
  const categoryId = matchedCategory ? matchedCategory.categoryId : "";

  // ── Fetch từ backend với đầy đủ params ──────────────────────────
  // Không còn dùng limit:100 + filter frontend nữa
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isFetching,
  } = useProducts({
    categoryId: categoryId || undefined,
    page,
    limit: ITEMS_PER_PAGE,
    sort,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max !== Infinity ? priceRange?.max : undefined,
  });

  const categoryIconMap = {
    "duoc-my-pham": "✨",
    "thiet-bi-y-te": "🩺",
    "thuoc-ho-hap": "🫁",
    "thuoc-tieu-hoa": "🧪",
    "thuoc-tim-mach": "❤️",
    "vitamin-khoang-chat": "💊",
  };

  const liveCategories =
    categoriesData?.items?.map((c) => ({
      id: c.slug,
      name: c.name,
      icon: categoryIconMap[c.slug] || "💊",
      count: c.count,
    })) || [];

  const activeCategory = liveCategories.find((c) => c.id === categorySlug);
  const totalMedicineCount = liveCategories.reduce(
    (sum, c) => sum + (Number(c.count) || 0),
    0,
  );

  // Map API response → shape ProductCard cần — giữ nguyên các field bạn đang dùng
  const liveMedicines = (productsData?.items || []).map((m, index) => ({
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
    stock: m.stock || 50,
    image: m.primaryImage || FALLBACK_IMAGE,
    images: [m.primaryImage || FALLBACK_IMAGE],
    description: m.description || "",
    unit: m.unit || "Hộp",
    isFlashSale: index % 5 === 0,
    isBestSeller: index % 5 === 1,
    isFeatured: index % 5 === 2,
  }));

  // Tổng số trang — lấy từ backend, không tính frontend nữa
  const total = productsData?.total || 0;
  const totalPages =
    productsData?.totalPages || Math.ceil(total / ITEMS_PER_PAGE);

  const handleCategoryChange = (catId) => {
    const p = new URLSearchParams(searchParams);
    if (catId) p.set("category", catId);
    else p.delete("category");
    setSearchParams(p);
    setPage(1);
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">
          {activeCategory?.name || "Tất cả sản phẩm"}
        </span>
      </nav>

      <div className="flex gap-5">
        {/* Sidebar filters — desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Filter size={16} /> Danh mục
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${!categorySlug ? "text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                style={!categorySlug ? { backgroundColor: "#1250dc" } : {}}
              >
                <span>Tất cả sản phẩm</span>
                <span
                  className={`text-xs ${!categorySlug ? "text-white/70" : "text-gray-400"}`}
                >
                  {totalMedicineCount}
                </span>
              </button>
              {liveCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${categorySlug === cat.id ? "text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  style={
                    categorySlug === cat.id
                      ? { backgroundColor: "#1250dc" }
                      : {}
                  }
                >
                  <span>
                    {cat.icon} {cat.name}
                  </span>
                  <span
                    className={`text-xs ${categorySlug === cat.id ? "text-white/70" : "text-gray-400"}`}
                  >
                    {cat.count || "0"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Khoảng giá</h3>
            <div className="space-y-1">
              {priceRanges.map((range) => {
                const active =
                  priceRange?.min === range.min &&
                  priceRange?.max === range.max;
                return (
                  <button
                    key={range.label}
                    onClick={() => {
                      setPriceRange(active ? null : range);
                      setPage(1);
                    }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${active ? "text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    style={active ? { backgroundColor: "#1250dc" } : {}}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{total}</span> sản phẩm
              {priceRange && (
                <button
                  onClick={() => {
                    setPriceRange(null);
                    setPage(1);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100"
                >
                  {priceRange.label} <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="md:hidden flex items-center gap-2 text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} /> Lọc
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 pr-8 appearance-none bg-white cursor-pointer hover:border-blue-400 focus:outline-none"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filter */}
          {showFilter && (
            <div className="md:hidden bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Danh mục</h3>
                <button onClick={() => setShowFilter(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleCategoryChange("");
                    setShowFilter(false);
                  }}
                  className={`text-sm px-3 py-2 rounded-lg text-left ${!categorySlug ? "text-white" : "bg-gray-50 text-gray-700"}`}
                  style={!categorySlug ? { backgroundColor: "#1250dc" } : {}}
                >
                  Tất cả ({totalMedicineCount})
                </button>
                {liveCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryChange(cat.id);
                      setShowFilter(false);
                    }}
                    className={`text-sm px-3 py-2 rounded-lg text-left ${categorySlug === cat.id ? "text-white" : "bg-gray-50 text-gray-700"}`}
                    style={
                      categorySlug === cat.id
                        ? { backgroundColor: "#1250dc" }
                        : {}
                    }
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products grid */}
          {liveMedicines.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {liveMedicines.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center text-gray-500">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium text-gray-700 mb-1">
                Không tìm thấy sản phẩm
              </div>
              <div className="text-sm">Thử thay đổi bộ lọc hoặc danh mục</div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${page === p ? "text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                  style={page === p ? { backgroundColor: "#1250dc" } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ProductListPage as default };
