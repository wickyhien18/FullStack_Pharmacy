
// ================================================================
// MedicineDetailPage.jsx — Style theo Bigspring
// ================================================================
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, AlertCircle, ChevronRight } from "lucide-react";
import { useMedicine } from "@/hooks/useMedicines.js";
import { useCartStore } from "@/stores/cart.store.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

export default function MedicineDetailPage() {
  const { slug }    = useParams();
  const { data: medicine, isLoading, isError } = useMedicine(slug);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return (
    <section className="section">
      <div className="container animate-pulse">
        <div className="row">
          <div className="w-full px-4 md:w-1/2">
            <div className="bg-theme-light rounded-xl h-80" />
          </div>
          <div className="w-full px-4 md:w-1/2 space-y-4 mt-6 md:mt-0">
            <div className="h-6 bg-theme-light rounded w-3/4" />
            <div className="h-4 bg-theme-light rounded w-1/2" />
            <div className="h-10 bg-theme-light rounded w-1/3" />
          </div>
        </div>
      </div>
    </section>
  );

  if (isError || !medicine) return (
    <section className="section">
      <div className="container text-center text-text py-20">
        <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
        <p>Không tìm thấy sản phẩm</p>
        <Link to="/medicines" className="btn btn-primary mt-4 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    </section>
  );

  const discountPercent = medicine.originalPrice
    ? Math.round((1 - medicine.price / medicine.originalPrice) * 100)
    : null;

  return (
    <section className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text mb-8">
          <Link to="/" className="hover:text-primary transition">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/medicines" className="hover:text-primary transition">Sản phẩm</Link>
          <ChevronRight size={14} />
          <span className="text-dark line-clamp-1">{medicine.name}</span>
        </nav>

        <div className="row">
          {/* Ảnh */}
          <div className="w-full px-4 md:w-1/2 mb-8 md:mb-0">
            <div className="shadow rounded-xl p-8 flex items-center justify-center bg-white">
              <img
                src={medicine.primaryImage || "/images/placeholder.png"}
                alt={medicine.name}
                className="max-h-72 object-contain"
              />
            </div>
          </div>

          {/* Thông tin */}
          <div className="w-full px-4 md:w-1/2">
            <p className="text-primary text-sm font-semibold mb-1">{medicine.categoryName}</p>
            <h1 className="font-bold leading-tight mb-2">{medicine.name}</h1>
            <p className="text-text text-sm mb-4">
              {medicine.manufacturerName} • {medicine.unit}
            </p>

            {/* Giá */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(medicine.price)}
              </span>
              {discountPercent > 0 && (
                <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {medicine.originalPrice && (
              <p className="text-light text-sm line-through mb-5">
                {formatPrice(medicine.originalPrice)}
              </p>
            )}

            {/* Tồn kho */}
            <p className="text-sm text-text mb-6">
              Còn lại:{" "}
              <span className={`font-bold ${medicine.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {medicine.stock > 0 ? `${medicine.stock} ${medicine.unit}` : "Hết hàng"}
              </span>
            </p>

            {/* Số lượng */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-[30px] overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-theme-light transition"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(medicine.stock, q + 1))}
                  className="px-4 py-2 hover:bg-theme-light transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => addItem(medicine, quantity)}
              disabled={medicine.stock === 0}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              {medicine.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
          </div>
        </div>

        {/* Mô tả */}
        {medicine.description && (
          <div className="mt-10 shadow rounded-xl p-8">
            <h3 className="mb-4">Mô tả sản phẩm</h3>
            <p className="text-text leading-relaxed whitespace-pre-line">
              {medicine.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
