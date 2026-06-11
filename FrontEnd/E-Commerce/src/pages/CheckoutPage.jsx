
// ================================================================
// CheckoutPage.jsx — Style theo Bigspring
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
    paymentMethod:   "COD",
    note:            "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const orderMutation = useMutation({
    mutationFn: (data) => api.post("/orders", data),
    onSuccess: () => {
      clearCart();
      toast.success("Đặt hàng thành công!");
      navigate("/orders");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Đặt hàng thất bại"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.shippingAddress) { toast.error("Vui lòng nhập địa chỉ giao hàng"); return; }
    if (!items.length)         { toast.error("Giỏ hàng trống"); return; }
    orderMutation.mutate({
      shippingAddress: form.shippingAddress,
      note:            form.note,
      items:           items.map((i) => ({
        medicineId: i.medicine.medicineId,
        quantity:   i.quantity,
      })),
    });
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="font-normal mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="row">
          {/* Form */}
          <div className="w-full px-4 lg:w-8/12 mb-8 lg:mb-0">
            <div className="card mt-0">
              <h4 className="mb-6">Thông tin giao hàng</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-dark mb-1">
                    Địa chỉ giao hàng *
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="form-textarea w-full rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "COD",   label: "💵 Thanh toán khi nhận hàng (COD)" },
                      { value: "VNPAY", label: "🏦 VNPay" },
                      { value: "MOMO",  label: "📱 Ví MoMo" },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={form.paymentMethod === value}
                          onChange={handleChange}
                          className="accent-primary"
                        />
                        <span className="text-sm text-text">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-1">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Ghi chú cho người giao hàng..."
                    className="form-textarea w-full rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full px-4 lg:w-4/12">
            <div className="card mt-0 sticky top-24">
              <h4 className="mb-4">Đơn hàng của bạn</h4>
              <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                {items.map(({ medicine, quantity }) => (
                  <div key={medicine.medicineId} className="flex justify-between text-sm">
                    <span className="text-text line-clamp-1 flex-1 mr-2">
                      {medicine.name} × {quantity}
                    </span>
                    <span className="font-bold text-dark shrink-0">
                      {formatPrice(Number(medicine.price) * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-dark border-t border-border pt-3 mb-5">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <button
                type="submit"
                disabled={orderMutation.isPending}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {orderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
