
// ================================================================
// CartPage.jsx — Style theo Bigspring
// ================================================================
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart.store.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  if (items.length === 0) return (
    <section className="section">
      <div className="container text-center py-20">
        <ShoppingBag className="mx-auto mb-4 text-border" size={64} />
        <h3 className="font-normal text-text mb-2">Giỏ hàng trống</h3>
        <p className="text-text mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <Link to="/medicines" className="btn btn-primary inline-block">
          Mua sắm ngay
        </Link>
      </div>
    </section>
  );

  return (
    <section className="section">
      <div className="container">
        <h1 className="font-normal mb-8">Giỏ hàng ({items.length} sản phẩm)</h1>

        <div className="row">
          {/* Danh sách sản phẩm */}
          <div className="w-full px-4 lg:w-8/12 mb-8 lg:mb-0">
            <div className="space-y-4">
              {items.map(({ medicine, quantity }) => (
                <div key={medicine.medicineId}
                  className="card mt-0 flex gap-4 p-4">
                  <img
                    src={medicine.primaryImage || "/images/placeholder.png"}
                    alt={medicine.name}
                    className="w-20 h-20 object-contain rounded-lg border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold line-clamp-2 mb-1">{medicine.name}</h5>
                    <p className="text-xs text-light mb-3">{medicine.unit}</p>
                    <div className="flex items-center justify-between">
                      {/* Số lượng */}
                      <div className="flex items-center border border-border rounded-[30px] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(medicine.medicineId, quantity - 1)}
                          className="px-3 py-1 hover:bg-theme-light transition"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 py-1 text-sm font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(medicine.medicineId, quantity + 1)}
                          className="px-3 py-1 hover:bg-theme-light transition"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary">
                          {formatPrice(Number(medicine.price) * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(medicine.medicineId)}
                          className="text-light hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="w-full px-4 lg:w-4/12">
            <div className="card mt-0 sticky top-24">
              <h4 className="mb-4">Tóm tắt đơn hàng</h4>
              <div className="space-y-2 text-sm text-text mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-dark border-t border-border pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn btn-primary w-full text-center block">
                Tiến hành thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
