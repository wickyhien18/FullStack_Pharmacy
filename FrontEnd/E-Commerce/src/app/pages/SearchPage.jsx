import { useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, ChevronRight } from "lucide-react";
import { blogPosts } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useMedicines } from "../../hooks/useMedicines.js";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const { data: medicinesData, isLoading } = useMedicines({
    search: q || undefined,
    limit: 100
  });

  const matchedProducts = useMemo(() => {
    if (!q || !medicinesData?.items) return [];
    return medicinesData.items.map((m, index) => ({
      id: m.slug,
      name: m.name,
      brand: m.manufacturerName || "Dược phẩm",
      category: m.categorySlug || "medicines",
      price: m.price,
      originalPrice: m.originalPrice || m.price * 1.15,
      discount: m.originalPrice ? Math.round((1 - m.price / m.originalPrice) * 100) : 15,
      rating: 4.8,
      reviewCount: 42 + index,
      sold: 120 + index * 5,
      stock: m.stock || 50,
      image: m.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
      images: [m.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format"],
      description: m.description || "",
      unit: m.unit || "Hộp",
    }));
  }, [q, medicinesData]);

  const matchedPosts = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return blogPosts.filter(
      (p) => p.title.toLowerCase().includes(lower) || p.excerpt.toLowerCase().includes(lower) || p.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }, [q]);
  return <div className="max-w-7xl mx-auto px-4 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Tìm kiếm: "{q}"</span>
      </nav>

      {q ? <>
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Tìm thấy <span className="font-semibold text-gray-800">{matchedProducts.length + matchedPosts.length}</span> kết quả cho "<span className="font-semibold" style={{ color: "#1250dc" }}>{q}</span>"
            </p>
          </div>

          {matchedProducts.length > 0 && <section className="mb-8">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between" style={{ fontSize: "1rem" }}>
                <span>Sản phẩm ({matchedProducts.length})</span>
                {matchedProducts.length > 8 && <Link to={`/products?q=${q}`} className="text-sm font-medium" style={{ color: "#1250dc" }}>Xem tất cả →</Link>}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {matchedProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>}

          {matchedPosts.length > 0 && <section>
              <h2 className="font-semibold text-gray-800 mb-4" style={{ fontSize: "1rem" }}>Bài viết ({matchedPosts.length})</h2>
              <div className="space-y-4">
                {matchedPosts.map((post) => <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow border border-gray-100">
                    <img src={post.image} alt={post.title} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                    <div>
                      <div className="text-xs font-medium mb-1" style={{ color: "#1250dc" }}>{post.category}</div>
                      <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-1" style={{ fontSize: "0.9rem" }}>{post.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</div>
                    </div>
                  </Link>)}
              </div>
            </section>}

          {matchedProducts.length === 0 && matchedPosts.length === 0 && <div className="text-center py-16 bg-white rounded-2xl">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-sm text-gray-500 mb-6">Thử từ khóa khác hoặc tìm trong danh mục sản phẩm</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm" style={{ backgroundColor: "#1250dc" }}>
                Xem tất cả sản phẩm
              </Link>
            </div>}
        </> : <div className="text-center py-16 bg-white rounded-2xl">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Nhập từ khóa để tìm kiếm</h3>
          <p className="text-sm text-gray-500">Tìm kiếm thuốc, thực phẩm chức năng, sản phẩm chăm sóc sức khỏe...</p>
        </div>}
    </div>;
}
export {
  SearchPage as default
};
