
// ================================================================
// MedicineCard.jsx — Style theo Bigspring (card có shadow, hover)
// ================================================================
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart.store.js";

export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function MedicineCard({ medicine }) {
  const { addItem } = useCartStore();

  const discountPercent = medicine.originalPrice
    ? Math.round((1 - medicine.price / medicine.originalPrice) * 100)
    : null;

  return (
    <div className="card feature-card group flex flex-col p-0 overflow-hidden mt-0">
      {/* Ảnh */}
      <Link to={`/medicines/${medicine.slug}`} className="relative block overflow-hidden">
        <img
          src={medicine.primaryImage || "/images/placeholder.png"}
          alt={medicine.name}
          className="w-full h-44 object-contain p-4 group-hover:scale-105 transition duration-300"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs
                           font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link
          to={`/medicines/${medicine.slug}`}
          className="text-sm font-bold text-dark hover:text-primary transition line-clamp-2 flex-1 mb-2"
        >
          {medicine.name}
        </Link>
        <p className="text-xs text-light mb-3">{medicine.unit}</p>

        {/* Giá */}
        <div className="mb-4">
          <span className="text-primary font-bold text-base">
            {formatPrice(medicine.price)}
          </span>
          {medicine.originalPrice && (
            <span className="text-light text-xs line-through ml-2">
              {formatPrice(medicine.originalPrice)}
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(medicine)}
          className="btn btn-primary py-2 px-4 text-sm w-full flex items-center justify-center gap-2"
        >
          <ShoppingCart size={15} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
