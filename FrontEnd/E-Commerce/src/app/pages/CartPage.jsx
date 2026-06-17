import { Link } from "react-router";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Tag,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";
import { useState } from "react";
function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } =
    useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const shipping = totalPrice >= 15e4 ? 0 : 3e4;
  const discount = couponApplied ? Math.floor(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice - discount + shipping;
  const handleCoupon = () => {
    if (coupon.toUpperCase() === "LONGCHAU10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError(
        "M\xE3 gi\u1EA3m gi\xE1 kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n",
      );
      setCouponApplied(false);
    }
  };
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2
          className="font-bold text-gray-800 mb-2"
          style={{ fontSize: "1.25rem" }}
        >
          Giỏ hàng trống
        </h2>
        <p className="text-gray-500 mb-6">
          Thêm sản phẩm vào giỏ để tiến hành đặt hàng
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-colors"
          style={{ backgroundColor: "#1250dc" }}
        >
          <ArrowLeft size={18} /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Giỏ hàng ({totalItems} sản phẩm)</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Sản phẩm trong giỏ ({totalItems})
              </h2>
              <Link
                to="/products"
                className="text-sm hover:underline"
                style={{ color: "#1250dc" }}
              >
                + Thêm sản phẩm
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-5 flex gap-4">
                  <Link to={`/products/${product.id}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium text-sm text-gray-800 hover:text-blue-700 line-clamp-2 block mb-1"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-gray-500 mb-1">
                      {product.brand} · {product.unit}
                    </div>
                    {/* {product.discount && (
                      <span
                        className="text-xs text-white px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: "#e53935" }}
                      >
                        -{product.discount}%
                      </span>
                    )} */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-semibold text-sm"
                          // style={{ color: "#e53935" }}
                        >
                          {formatPrice(product.price * quantity)}
                        </div>
                        {/* {product.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice * quantity)}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          {/* <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={16} style={{ color: "#1250dc" }} /> Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleCoupon}
                className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: "#1250dc" }}
              >
                Áp dụng
              </button>
            </div>
            {couponApplied && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Đã áp dụng mã LONGCHAU10 - Giảm 10%
              </p>
            )}
            {couponError && (
              <p className="text-xs text-red-500 mt-2">{couponError}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Thử mã: LONGCHAU10</p>
          </div> */}

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (10%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span
                  className={shipping === 0 ? "text-green-600 font-medium" : ""}
                >
                  {shipping === 0 ? "Mi\u1EC5n ph\xED" : formatPrice(shipping)}
                </span>
              </div>
              {totalPrice < 15e4 && (
                <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg">
                  Thêm {formatPrice(15e4 - totalPrice)} để được miễn phí vận
                  chuyển
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span style={{ color: "#e53935" }}>
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-4 block w-full text-center py-3 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: "#1250dc" }}
            >
              Tiến hành đặt hàng →
            </Link>
            <Link
              to="/products"
              className="mt-3 block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>

          {/* Payment methods */}
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              Phương thức thanh toán
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", "VNPAY", "Momo", "ZaloPay", "COD"].map(
                (pm) => (
                  <span
                    key={pm}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 rounded-lg text-gray-600"
                  >
                    {pm}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { CartPage as default };
