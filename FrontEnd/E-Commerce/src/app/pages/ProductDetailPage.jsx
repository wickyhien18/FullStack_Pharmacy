import { useState } from "react";
import { useParams, Link } from "react-router";
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronRight, Shield, Truck, Phone, Check } from "lucide-react";
import { formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useMedicine, useMedicines } from "../../hooks/useMedicines.js";

const tabs = ["Mô tả", "Thành phần", "Hướng dẫn sử dụng", "Đánh giá"];

function ProductDetailPage() {
  const { id } = useParams(); // id is the slug
  const { data: m, isLoading, error } = useMedicine(id);
  const { data: relatedData } = useMedicines({
    categoryId: m?.categoryId || undefined,
    limit: 10
  });

  const { addToCart, wishlist, toggleWishlist } = useCart();
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

  const product = m ? {
    id: m.slug,
    name: m.name,
    brand: m.manufacturerName || "Dược phẩm",
    category: m.categorySlug || "medicines",
    price: m.price,
    originalPrice: m.originalPrice || m.price * 1.15,
    discount: m.originalPrice ? Math.round((1 - m.price / m.originalPrice) * 100) : 15,
    rating: 4.8,
    reviewCount: 42,
    sold: 120,
    stock: m.stock || 50,
    image: m.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
    images: [m.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format"],
    description: m.description || "",
    ingredients: "Dược chất hoạt tính",
    usage: "Theo chỉ định của bác sĩ",
    unit: m.unit || "Hộp",
    isFlashSale: false,
    isBestSeller: false,
    isFeatured: false
  } : null;

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="text-blue-700 hover:underline">← Quay lại danh sách</Link>
      </div>;
  }

  const related = relatedData?.items
    ?.filter(item => item.slug !== id)
    ?.slice(0, 4)
    ?.map((item, index) => ({
      id: item.slug,
      name: item.name,
      brand: item.manufacturerName || "Dược phẩm",
      category: item.categorySlug || "medicines",
      price: item.price,
      originalPrice: item.originalPrice || item.price * 1.15,
      discount: item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 15,
      rating: 4.8,
      reviewCount: 30 + index,
      sold: 80 + index * 5,
      stock: item.stock || 50,
      image: item.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format",
      images: [item.primaryImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&auto=format"],
      description: item.description || "",
      unit: item.unit || "Hộp",
    })) || [];

  const isWishlisted = wishlist.includes(product.id);
  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2e3);
  };
  const tabContent = [
    product.description,
    product.ingredients,
    product.usage,
    "Đánh giá từ khách hàng"
  ];
  const mockReviews = [
    { name: "Nguy\u1EC5n Th\u1ECB A", rating: 5, date: "10/06/2026", comment: "S\u1EA3n ph\u1EA9m r\u1EA5t t\u1ED1t, u\u1ED1ng th\u1EA5y s\u1EE9c \u0111\u1EC1 kh\xE1ng t\u0103ng r\xF5 r\u1EC7t. Giao h\xE0ng nhanh, \u0111\xF3ng g\xF3i c\u1EA9n th\u1EADn.", verified: true },
    { name: "Tr\u1EA7n V\u0103n B", rating: 4, date: "08/06/2026", comment: "H\xE0ng ch\xEDnh h\xE3ng, gi\xE1 t\u1ED1t. S\u1EBD mua l\u1EA1i l\u1EA7n sau.", verified: true },
    { name: "L\xEA Th\u1ECB C", rating: 5, date: "05/06/2026", comment: "D\xF9ng \u0111\u01B0\u1EE3c 1 th\xE1ng th\u1EA5y da d\u1EBB t\u01B0\u01A1i s\xE1ng h\u01A1n, ng\u1EE7 ngon h\u01A1n. R\u1EA5t h\xE0i l\xF2ng!", verified: true }
  ];
  return <div className="max-w-7xl mx-auto px-4 py-5">
      {
    /* Breadcrumb */
  }
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-blue-700">Sản phẩm</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {
    /* Images */
  }
        <div>
          <div className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-100">
            <img
    src={product.images[activeImg]}
    alt={product.name}
    className="w-full h-80 object-cover"
  />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => <button
    key={i}
    onClick={() => setActiveImg(i)}
    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? "border-blue-600" : "border-gray-200 hover:border-gray-300"}`}
  >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>)}
          </div>
        </div>

        {
    /* Info */
  }
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">{product.brand}</span>
            {product.isBestSeller && <span className="text-xs text-white px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#f05a22" }}>Bán chạy</span>}
            {product.isFlashSale && <span className="text-xs text-white px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#e53935" }}>⚡ Flash Sale</span>}
          </div>
          <h1 className="text-gray-800 mb-3" style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 }}>{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill={s <= Math.round(product.rating) ? "#fbbf24" : "none"} className={s <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"} />)}
              <span className="text-sm font-semibold ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount.toLocaleString()} đánh giá)</span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-500">Đã bán {product.sold.toLocaleString()}</span>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-end gap-3 mb-1">
              <span className="font-bold" style={{ fontSize: "1.75rem", color: "#e53935" }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && <span className="text-gray-400 line-through text-base mb-1">
                  {formatPrice(product.originalPrice)}
                </span>}
              {product.discount && <span className="text-white text-sm font-bold px-2 py-0.5 rounded-lg mb-1" style={{ backgroundColor: "#e53935" }}>
                  -{product.discount}%
                </span>}
            </div>
            <div className="text-xs text-gray-500">{product.unit}</div>
          </div>

          {
    /* Quantity */
  }
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm text-gray-600">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium border-x border-gray-200 min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <span className="text-xs text-gray-400">Còn {product.stock} sản phẩm</span>
          </div>

          {
    /* Actions */
  }
          <div className="flex gap-3 mb-6">
            <button
    onClick={handleAddToCart}
    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
    style={{ backgroundColor: added ? "#16a34a" : "#1250dc", color: "white" }}
  >
              {added ? <><Check size={18} /> Đã thêm vào giỏ</> : <><ShoppingCart size={18} /> Thêm vào giỏ hàng</>}
            </button>
            <button
    onClick={() => toggleWishlist(product.id)}
    className={`p-3 rounded-xl border-2 transition-all ${isWishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"}`}
  >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <Link
    to="/cart"
    onClick={() => addToCart(product, qty)}
    className="block w-full text-center py-3 rounded-xl border-2 font-semibold text-sm transition-colors hover:bg-blue-50 mb-5"
    style={{ borderColor: "#1250dc", color: "#1250dc" }}
  >
            Mua ngay
          </Link>

          {
    /* Guarantees */
  }
          <div className="space-y-2.5">
            {[
    { icon: <Shield size={16} />, text: "S\u1EA3n ph\u1EA9m ch\xEDnh h\xE3ng 100%" },
    { icon: <Truck size={16} />, text: "Giao h\xE0ng nhanh 2H n\u1ED9i th\xE0nh" },
    { icon: <Phone size={16} />, text: "H\u1ED7 tr\u1EE3 24/7: 1800 6928" }
  ].map((item) => <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span style={{ color: "#1250dc" }}>{item.icon}</span>
                {item.text}
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Tabs */
  }
      <div className="bg-white rounded-2xl mb-8">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab, i) => <button
    key={tab}
    onClick={() => setActiveTab(i)}
    className={`px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === i ? "border-blue-700 text-blue-700" : "border-transparent text-gray-600 hover:text-gray-800"}`}
  >
              {tab}
            </button>)}
        </div>
        <div className="p-6">
          {activeTab < 3 ? <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{tabContent[activeTab]}</div> : <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="font-bold" style={{ fontSize: "2.5rem", color: "#1250dc" }}>{product.rating}</div>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="#fbbf24" className="text-yellow-400" />)}
                  </div>
                  <div className="text-xs text-gray-500">{product.reviewCount} đánh giá</div>
                </div>
              </div>
              {mockReviews.map((r, i) => <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "#1250dc" }}>
                      {r.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{r.name}</span>
                        {r.verified && <span className="text-xs text-green-600 flex items-center gap-0.5"><Check size={11} /> Đã mua</span>}
                        <span className="text-xs text-gray-400 ml-auto">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill={s <= r.rating ? "#fbbf24" : "none"} className={s <= r.rating ? "text-yellow-400" : "text-gray-300"} />)}
                      </div>
                      <p className="text-sm text-gray-700">{r.comment}</p>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>

      {
    /* Related */
  }
      {related.length > 0 && <div className="bg-white rounded-2xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4" style={{ fontSize: "1rem" }}>Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>}
    </div>;
}
export {
  ProductDetailPage as default
};
