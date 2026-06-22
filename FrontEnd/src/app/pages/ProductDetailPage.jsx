import { useState } from "react";
import { useParams, Link } from "react-router";
import { ShoppingCart, Minus, Plus, ChevronRight, Check } from "lucide-react";
import { formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "@/hooks/useCart.js";
import { useProduct, useProducts } from "../../hooks/useProducts.js";
import NotFoundPage from "./NotFoundPage";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format";
const tabs = ["Mô tả", "Thành phần", "Hướng dẫn sử dụng"];

function ProductDetailPage() {
  const { id } = useParams();
  const { data: m, isLoading } = useProduct(id);
  const { data: relatedData } = useProducts({
    categoryId: m?.categoryId || undefined,
    limit: 10,
  });

  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (!m) return <NotFoundPage />;

  // ── Xây dựng mảng images đầy đủ ──────────────────────────────────
  // Ưu tiên: m.images (từ bảng product_images, đã sort theo display_order)
  // Fallback: m.primaryImage (cột image cũ) hoặc ảnh placeholder
  const imageList = (() => {
    if (m.images && m.images.length > 0) {
      return m.images.map((img) => img.imageUrl || img);
    }
    const primary = m.primaryImage || m.image || FALLBACK_IMAGE;
    return [primary];
  })();

  const product = {
    id: m.slug,
    productId: m.productId,
    name: m.name,
    brand: m.manufacturerName || "Dược phẩm",
    price: m.price,
    stock: m.stock || 50,
    images: imageList,
    description: m.description || "",
    ingredients: "Dược chất hoạt tính",
    usage: "Theo chỉ định của bác sĩ",
    unit: m.unit || "Hộp",
  };

  const related =
    relatedData?.items
      ?.filter((item) => item.slug !== id)
      ?.slice(0, 4)
      ?.map((item) => ({
        id: item.slug,
        productId: item.productId,
        name: item.name,
        brand: item.manufacturerName || "Dược phẩm",
        price: item.price,
        stock: item.stock || 50,
        image: item.primaryImage || item.image || FALLBACK_IMAGE,
        images: [item.primaryImage || item.image || FALLBACK_IMAGE],
        description: item.description || "",
        unit: item.unit || "Hộp",
      })) || [];

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const tabContent = [product.description, product.ingredients, product.usage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-blue-700">
          Sản phẩm
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* ── Images ── */}
        <div>
          {/* Ảnh lớn */}
          <div className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-100">
            <img
              src={product.images[activeImg] || FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-80 object-contain p-4"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Thumbnail — chỉ hiện nếu có hơn 1 ảnh */}
          {product.images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    activeImg === i
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img || FALLBACK_IMAGE}
                    alt={`Ảnh ${i + 1}`}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">{product.brand}</span>
          </div>
          <h1
            className="text-gray-800 mb-3"
            style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 }}
          >
            {product.name}
          </h1>

          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-end gap-3 mb-1">
              <span className="font-bold" style={{ fontSize: "1.75rem" }}>
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="text-xs text-gray-500">{product.unit}</div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm text-gray-600">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium border-x border-gray-200 min-w-[3rem] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="px-3 py-2 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-gray-400">
              Còn {product.stock} sản phẩm
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: added ? "#16a34a" : "#1250dc",
                color: "white",
              }}
            >
              {added ? (
                <>
                  <Check size={18} /> Đã thêm vào giỏ
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Thêm vào giỏ hàng
                </>
              )}
            </button>
          </div>

          <Link
            to="/cart"
            onClick={() => addToCart(product, qty)}
            className="block w-full text-center py-3 rounded-xl border-2 font-semibold text-sm transition-colors hover:bg-blue-50"
            style={{ borderColor: "#1250dc", color: "#1250dc" }}
          >
            Mua ngay
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl mb-8">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === i
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {tabContent[activeTab] || "Đang cập nhật..."}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2
            className="font-semibold text-gray-800 mb-4"
            style={{ fontSize: "1rem" }}
          >
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { ProductDetailPage as default };
