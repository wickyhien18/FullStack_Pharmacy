import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/hooks/useCart.js";
import { useState } from "react";
import { productThumb } from "../../lib/imageUrl.js";

// Skeleton cho 1 cart item
function CartItemSkeleton() {
  return (
    <div className="p-5 flex gap-4 animate-pulse">
      <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-8 bg-gray-100 rounded-lg w-24" />
          <div className="h-5 bg-gray-100 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const {
    items,
    removeItem,
    updateItem,
    totalItems,
    totalPrice,
    isLoading,
    isFetching,
    isAdding,
    isUpdating,
    isRemoving,
    formatPrice,
  } = useCart();

  const [deleteItemId, setDeleteItemId] = useState(null);

  // loading state includes query loading, background fetching (when empty), or any ongoing mutation
  const isPageLoading = isLoading || isAdding || isUpdating || isRemoving || (isFetching && items.length === 0);
  const isEmpty = !isPageLoading && items.length === 0;

  if (isEmpty) {
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
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">
          Giỏ hàng {!isPageLoading && `(${totalItems} sản phẩm)`}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                {isPageLoading ? (
                  <span className="inline-block h-5 bg-gray-100 rounded w-40 animate-pulse" />
                ) : (
                  `Sản phẩm trong giỏ (${totalItems})`
                )}
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
              {isPageLoading
                ? // Skeleton 3 items trong lúc loading
                  Array(3)
                    .fill(0)
                                 : items.map((item) => (
                    <div key={item.cartItemId} className="p-3 sm:p-5 flex gap-3 sm:gap-4 items-start">
                      <Link to={`/products/${item.slug}`} className="shrink-0">
                        <img
                          src={productThumb(item.image)}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-medium text-xs sm:text-sm text-gray-800 hover:text-blue-700 line-clamp-2 block mb-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-[11px] sm:text-xs text-gray-500 mb-1">
                          {item.unit}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() =>
                                updateItem(item.cartItemId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isUpdating || isRemoving}
                              className="px-2 py-1 sm:px-2.5 sm:py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItem(item.cartItemId, item.quantity + 1)
                              }
                              disabled={isUpdating || isRemoving}
                              className="px-2 py-1 sm:px-2.5 sm:py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="font-semibold text-xs sm:text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteItemId(item.cartItemId)}
                        disabled={isUpdating || isRemoving}
                        className="shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Tóm tắt đơn hàng
            </h3>
            {isPageLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="flex justify-between border-t pt-3">
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-11 bg-gray-100 rounded-xl mt-4" />
              </div>
            ) : (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                    <span>Tổng cộng</span>
                    <span style={{ color: "#e53935" }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="mt-4 block w-full text-center py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90"
                  style={{ backgroundColor: "#1250dc" }}
                >
                  Tiến hành đặt hàng →
                </Link>
                <Link
                  to="/products"
                  className="mt-3 block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">
              Phương thức thanh toán
            </h3>
            <div className="flex flex-wrap gap-2">
              {["VNPAY", "COD - Thanh toán khi nhận hàng"].map((pm) => (
                <span
                  key={pm}
                  className="text-xs px-2.5 py-1.5 bg-gray-100 rounded-lg text-gray-600"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {deleteItemId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa sản phẩm</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteItemId(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  removeItem(deleteItemId);
                  setDeleteItemId(null);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { CartPage as default };
