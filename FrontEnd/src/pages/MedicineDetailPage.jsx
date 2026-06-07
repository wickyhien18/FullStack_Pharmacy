// ================================================================
// MedicineDetailPage.jsx — Trang chi tiết sản phẩm
// ================================================================
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, Minus, Plus, AlertCircle } from "lucide-react";
import { useMedicine } from "@/hooks/useMedicines.js";
import { useCartStore } from "@/stores/cart.store.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

export default function MedicineDetailPage() {
  // useParams: lấy :slug từ URL /medicines/:slug
  const { slug } = useParams();
  const { data: medicine, isLoading, isError } = useMedicine(slug);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  if (isLoading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="bg-gray-100 rounded-2xl h-80" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-10 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );

  if (isError || !medicine)
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">
        <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );

  const discountPercent = medicine.originalPrice
    ? Math.round((1 - medicine.price / medicine.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ── Ảnh sản phẩm ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-center">
          <img
            src={medicine.primaryImage || "/placeholder.png"}
            alt={medicine.name}
            className="max-h-72 object-contain"
          />
        </div>

        {/* ── Thông tin sản phẩm ────────────────────────────── */}
        <div>
          <p className="text-sm text-primary-600 font-medium mb-1">
            {medicine.categoryName}
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {medicine.name}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {medicine.manufacturerName} • {medicine.unit}
          </p>

          {/* Giá */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(medicine.price)}
            </span>
            {discountPercent > 0 && (
              <span className="bg-red-100 text-red-500 text-sm font-bold px-2 py-0.5 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
          {medicine.originalPrice && (
            <p className="text-gray-400 text-sm line-through mb-4">
              {formatPrice(medicine.originalPrice)}
            </p>
          )}

          {/* Tồn kho */}
          <p className="text-sm text-gray-500 mb-6">
            Còn lại:{" "}
            <span
              className={`font-semibold ${medicine.stock > 0 ? "text-green-600" : "text-red-500"}`}
            >
              {medicine.stock > 0
                ? `${medicine.stock} ${medicine.unit}`
                : "Hết hàng"}
            </span>
          </p>

          {/* Chọn số lượng */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 transition"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(medicine.stock, q + 1))
                }
                className="px-3 py-2 hover:bg-gray-50 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Nút thêm giỏ */}
          <button
            onClick={() => addItem(medicine, quantity)}
            disabled={medicine.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white
                       py-3 rounded-xl font-semibold hover:bg-primary-600 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            {medicine.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </button>
        </div>
      </div>

      {/* ── Mô tả sản phẩm ────────────────────────────────────── */}
      {medicine.description && (
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Mô tả sản phẩm
          </h2>
          {/* whitespace-pre-line: giữ nguyên xuống dòng từ DB */}
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {medicine.description}
          </p>
        </div>
      )}
    </div>
  );
}
