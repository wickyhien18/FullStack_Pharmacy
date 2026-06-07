// ================================================================
// CartPage.jsx — Trang giỏ hàng
// ================================================================
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart.store.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  if (items.length === 0)
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-gray-300" size={64} />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          Giỏ hàng trống
        </h2>
        <p className="text-gray-400 mb-6">
          Hãy thêm sản phẩm vào giỏ hàng của bạn
        </p>
        <Link
          to="/medicines"
          className="bg-primary-500 text-white px-6 py-2.5 rounded-full hover:bg-primary-600 transition"
        >
          Mua sắm ngay
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Giỏ hàng ({items.length} sản phẩm)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Danh sách sản phẩm ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ medicine, quantity }) => (
            <div
              key={medicine.medicineId}
              className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
            >
              <img
                src={medicine.primaryImage || "/placeholder.png"}
                alt={medicine.name}
                className="w-20 h-20 object-contain rounded-lg border border-gray-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-700 line-clamp-2 mb-1">
                  {medicine.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3">{medicine.unit}</p>

                <div className="flex items-center justify-between">
                  {/* Điều chỉnh số lượng */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(medicine.medicineId, quantity - 1)
                      }
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(medicine.medicineId, quantity + 1)
                      }
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary-600">
                      {formatPrice(Number(medicine.price) * quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(medicine.medicineId)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tổng tiền ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-primary-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-primary-500 text-white text-center py-3 rounded-xl
                         font-semibold hover:bg-primary-600 transition"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
