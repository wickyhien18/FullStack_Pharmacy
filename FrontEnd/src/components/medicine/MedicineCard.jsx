// ================================================================
// MedicineCard.jsx — Card hiển thị sản phẩm trong danh sách
// ================================================================
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart.store.js";

// Hàm format tiền VNĐ — tái sử dụng ở nhiều nơi
export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

export default function MedicineCard({ medicine }) {
  const { addItem } = useCartStore();

  const discountPercent = medicine.originalPrice
    ? Math.round((1 - medicine.price / medicine.originalPrice) * 100)
    : null;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:shadow-md
                    transition overflow-hidden group flex flex-col"
    >
      {/* Ảnh sản phẩm */}
      <Link
        to={`/medicines/${medicine.slug}`}
        className="relative block overflow-hidden"
      >
        <img
          src={medicine.primaryImage || "/placeholder.png"}
          alt={medicine.name}
          className="w-full h-44 object-contain p-3 group-hover:scale-105 transition duration-300"
        />
        {/* Badge giảm giá */}
        {discountPercent > 0 && (
          <span
            className="absolute top-2 left-2 bg-red-500 text-white text-xs
                           font-bold px-2 py-0.5 rounded-full"
          >
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Thông tin */}
      <div className="p-3 flex flex-col flex-1">
        <Link
          to={`/medicines/${medicine.slug}`}
          className="text-sm text-gray-700 font-medium hover:text-primary-600
                     line-clamp-2 flex-1 mb-2"
        >
          {medicine.name}
        </Link>

        <p className="text-xs text-gray-400 mb-2">{medicine.unit}</p>

        {/* Giá */}
        <div className="mb-3">
          <span className="text-primary-600 font-bold text-base">
            {formatPrice(medicine.price)}
          </span>
          {medicine.originalPrice && (
            <span className="text-gray-400 text-xs line-through ml-2">
              {formatPrice(medicine.originalPrice)}
            </span>
          )}
        </div>

        {/* Nút thêm giỏ hàng */}
        <button
          onClick={() => addItem(medicine)}
          className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white
                     py-2 rounded-lg text-sm hover:bg-primary-600 transition"
        >
          <ShoppingCart size={15} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
