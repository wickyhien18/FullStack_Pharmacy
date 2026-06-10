// ================================================================
// CheckoutPage.jsx — Trang thanh toán
// ================================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/cart.store.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";
import api from "@/lib/axios.js";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [form, setForm] = useState({
    shippingAddress: "",
    paymentMethod: "COD",
    note: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Mutation đặt hàng
  const orderMutation = useMutation({
    mutationFn: (orderData) => api.post("/orders", orderData),
    onSuccess: ({ data }) => {
      clearCart(); // xoá giỏ hàng sau khi đặt thành công
      toast.success("Đặt hàng thành công!");
      navigate("/orders"); // chuyển sang trang lịch sử đơn hàng
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Đặt hàng thất bại");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.shippingAddress) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Build order data gửi lên API
    orderMutation.mutate({
      shippingAddress: form.shippingAddress,
      paymentMethod: form.paymentMethod,
      note: form.note,
      // Backend sẽ lấy giỏ hàng từ DB, hoặc ta gửi items luôn
      items: items.map((i) => ({
        medicineId: i.medicine.medicineId,
        quantity: i.quantity,
      })),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* ── Form thông tin ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">
              Thông tin giao hàng
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-primary-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "COD",
                      label: "💵 Thanh toán khi nhận hàng (COD)",
                    },
                    { value: "VNPAY", label: "🏦 VNPay" },
                    { value: "MOMO", label: "📱 Ví MoMo" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={form.paymentMethod === value}
                        onChange={handleChange}
                        className="accent-primary-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tuỳ chọn)
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ghi chú cho người giao hàng..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-primary-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tóm tắt đơn ──────────────────────────────────── */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <h2 className="font-semibold text-gray-700 mb-4">
              Đơn hàng của bạn
            </h2>

            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
              {items.map(({ medicine, quantity }) => (
                <div
                  key={medicine.medicineId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {medicine.name} × {quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPrice(Number(medicine.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-gray-800 mb-5">
              <span>Tổng cộng</span>
              <span className="text-primary-600">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              type="submit"
              disabled={orderMutation.isPending}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold
                         hover:bg-primary-600 transition disabled:opacity-60"
            >
              {orderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
