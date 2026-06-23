import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, ChevronRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../../hooks/useProducts.js";

// Debounce hook — chờ user gõ xong mới fetch, tránh gọi API liên tục
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  // Debounce query — chờ 400ms sau khi gõ xong mới gọi API
  const debouncedQ = useDebounce(q, 400);

  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useProducts({
    search: debouncedQ || undefined,
    limit: 20, // ← giảm từ 100 xuống 20, đủ hiển thị, tải nhanh hơn
  });

  const matchedProducts = useMemo(() => {
    if (!debouncedQ || !productsData?.items) return [];
    return productsData.items.map((m, index) => ({
      id: m.slug,
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
      image:
        m.primaryImage ||
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
      images: [
        m.primaryImage ||
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
      ],
      description: m.description || "",
      unit: m.unit || "Hộp",
    }));
  }, [debouncedQ, productsData]);

  const total = productsData?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Tìm kiếm: "{q}"</span>
      </nav>

      {q ? (
        <>
          <div className="mb-6">
            {isLoading ? (
              <p className="text-gray-400 text-sm">Đang tìm kiếm...</p>
            ) : (
              <p className="text-gray-600 text-sm">
                Tìm thấy{" "}
                <span className="font-semibold text-gray-800">{total}</span> kết
                quả cho "
                <span className="font-semibold" style={{ color: "#1250dc" }}>
                  {q}
                </span>
                "
              </p>
            )}
          </div>

          {/* Skeleton khi đang load */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden">
                    <div className="h-40 bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {!isLoading && matchedProducts.length > 0 && (
            <section className="mb-8">
              <h2
                className="font-semibold text-gray-800 mb-4 flex items-center justify-between"
                style={{ fontSize: "1rem" }}
              >
                <span>Sản phẩm ({total})</span>
                {total > 20 && (
                  <Link
                    to={`/products?q=${q}`}
                    className="text-sm font-medium"
                    style={{ color: "#1250dc" }}
                  >
                    Xem tất cả →
                  </Link>
                )}
              </h2>

              {/* ← wrap thêm relative div này */}
              <div className="relative">
                {isFetching && (
                  <div
                    className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10
                        flex items-center justify-center rounded-xl"
                  >
                    <div
                      className="flex items-center gap-2 bg-white shadow-md
                          px-4 py-2 rounded-full text-sm text-gray-600"
                    >
                      <div
                        className="w-4 h-4 border-2 border-blue-600
                            border-t-transparent rounded-full animate-spin"
                      />
                      Đang tìm kiếm...
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {matchedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {!isLoading && matchedProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Thử từ khóa khác hoặc tìm trong danh mục sản phẩm
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm"
                style={{ backgroundColor: "#1250dc" }}
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">
            Nhập từ khóa để tìm kiếm
          </h3>
          <p className="text-sm text-gray-500">
            Tìm kiếm thuốc, thực phẩm chức năng, sản phẩm chăm sóc sức khỏe...
          </p>
        </div>
      )}
    </div>
  );
}

export { SearchPage as default };
