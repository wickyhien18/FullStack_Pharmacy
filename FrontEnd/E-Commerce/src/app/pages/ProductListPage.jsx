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
  useMedicines,
  useCategoriesWithCount,
} from "../../hooks/useMedicines.js";
const sortOptions = [
  { value: "popular", label: "Ph\u1ED5 bi\u1EBFn nh\u1EA5t" },
  { value: "bestseller", label: "B\xE1n ch\u1EA1y nh\u1EA5t" },
  { value: "price-asc", label: "Gi\xE1 t\u0103ng d\u1EA7n" },
  { value: "price-desc", label: "Gi\xE1 gi\u1EA3m d\u1EA7n" },
  { value: "rating", label: "\u0110\xE1nh gi\xE1 cao" },
  { value: "newest", label: "M\u1EDBi nh\u1EA5t" },
];
const priceRanges = [
  { label: "D\u01B0\u1EDBi 100.000\u0111", min: 0, max: 1e5 },
  { label: "100.000\u0111 - 300.000\u0111", min: 1e5, max: 3e5 },
  { label: "300.000\u0111 - 500.000\u0111", min: 3e5, max: 5e5 },
  { label: "500.000\u0111 - 1.000.000\u0111", min: 5e5, max: 1e6 },
  { label: "Tr\xEAn 1.000.000\u0111", min: 1e6, max: Infinity },
];
const ITEMS_PER_PAGE = 12;
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("popular");
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

  // Call medicines API with categoryId
  const { data: medicinesData, isLoading: isLoadingMedicines } = useMedicines({
    categoryId: categoryId || undefined,
    limit: 100,
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

  const category = categorySlug;
  const activeCategory = liveCategories.find((c) => c.id === categorySlug);

  const medicinesList = medicinesData?.items || [];
  const liveMedicines = medicinesList.map((m, index) => ({
    id: m.slug || m.medicineId,
    medicineId: m.medicineId,
    name: m.name,
    brand: m.manufacturerName || "Dược phẩm",
    category: m.categorySlug || "medicines",
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
    isFlashSale: index % 5 === 0,
    isBestSeller: index % 5 === 1,
    isFeatured: index % 5 === 2,
  }));

  const filtered = useMemo(() => {
    let list = [...liveMedicines];
    if (categorySlug) list = list.filter((p) => p.category === categorySlug);
    if (searchParams.get("sale") === "flash")
      list = list.filter((p) => p.isFlashSale);
    if (searchParams.get("sort") === "bestseller")
      list = list.filter((p) => p.isBestSeller);
    if (searchParams.get("sort") === "featured")
      list = list.filter((p) => p.isFeatured);
    if (priceRange)
      list = list.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max,
      );
    switch (sort) {
      case "bestseller":
        list.sort((a, b) => b.sold - a.sold);
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return list;
  }, [liveMedicines, categorySlug, sort, priceRange, searchParams]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  if (isLoadingMedicines || isLoadingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }
  const handleCategoryChange = (catId) => {
    const p = new URLSearchParams(searchParams);
    if (catId) p.set("category", catId);
    else p.delete("category");
    setSearchParams(p);
    setPage(1);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">
          {activeCategory?.name || "T\u1EA5t c\u1EA3 s\u1EA3n ph\u1EA9m"}
        </span>
      </nav>

      <div className="flex gap-5">
        {/* Sidebar filters - desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Filter size={16} /> Danh mục
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? "text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                style={!category ? { backgroundColor: "#1250dc" } : {}}
              >
                Tất cả sản phẩm
              </button>
              {liveCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${category === cat.id ? "text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  style={
                    category === cat.id ? { backgroundColor: "#1250dc" } : {}
                  }
                >
                  <span>
                    {cat.icon} {cat.name}
                  </span>
                  <span
                    className={`text-xs ${category === cat.id ? "text-white/70" : "text-gray-400"}`}
                  >
                    {cat.count.toLocaleString()}
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
              <span className="font-medium">{filtered.length}</span> sản phẩm
              {priceRange && (
                <button
                  onClick={() => setPriceRange(null)}
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
                  className={`text-sm px-3 py-2 rounded-lg text-left ${!category ? "text-white" : "bg-gray-50 text-gray-700"}`}
                  style={!category ? { backgroundColor: "#1250dc" } : {}}
                >
                  Tất cả
                </button>
                {liveCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryChange(cat.id);
                      setShowFilter(false);
                    }}
                    className={`text-sm px-3 py-2 rounded-lg text-left ${category === cat.id ? "text-white" : "bg-gray-50 text-gray-700"}`}
                    style={
                      category === cat.id ? { backgroundColor: "#1250dc" } : {}
                    }
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((p) => (
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
