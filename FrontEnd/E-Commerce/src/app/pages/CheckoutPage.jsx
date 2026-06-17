import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  Check,
  Clock,
  MapPin,
  CreditCard,
  Package,
  PhoneCall,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";
import api from "../../lib/axios.js";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";

const steps = ["Địa chỉ giao hàng", "Thanh toán", "Xác nhận"];
const paymentMethods = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: "💵" },
  { id: "vnpay", label: "VNPAY - QR Code", icon: "📱" },
  { id: "momo", label: "Ví MoMo", icon: "💜" },
  { id: "bank", label: "Thẻ ngân hàng / Thẻ quốc tế", icon: "💳" },
];
const ORDER_PROCESSING_STEPS = [
  {
    icon: PhoneCall,
    title: "Nhà thuốc xác nhận đơn",
    time: "5-10 phút",
  },
  {
    icon: Package,
    title: "Chuẩn bị thuốc",
    time: "15-30 phút",
  },
  {
    icon: Truck,
    title: "Giao đến địa chỉ của bạn",
    time: "30-60 phút sau xác nhận",
  },
];

const validateShippingForm = (values) => {
  const errors = {};
  const phone = values.phone.trim();

  if (!values.name.trim()) errors.name = "Vui lòng nhập họ và tên";
  if (!phone) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ";
  }
  if (!values.address.trim()) errors.address = "Vui lòng nhập địa chỉ cụ thể";

  return errors;
};

function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isOrdered, setOrdered] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    province: "Hà Nội",
    district: "Cầu Giấy",
    ward: "Dịch Vọng",
    address: "",
    note: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const shipping = totalPrice >= 15e4 ? 0 : 3e4;
  const total = totalPrice + shipping;

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.fullName || "",
      phone: current.phone || user.phone || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name]) {
      setErrors(validateShippingForm(nextForm));
    }
  };
  const handleBlur = (e) => {
    const nextTouched = { ...touched, [e.target.name]: true };
    setTouched(nextTouched);
    setErrors(validateShippingForm(form));
  };
  const validateBeforeLeavingShipping = () => {
    const nextErrors = validateShippingForm(form);
    setTouched({ ...touched, name: true, phone: true, address: true });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra thông tin giao hàng");
      return false;
    }

    return true;
  };
  const handleNext = () => {
    if (step === 0 && !validateBeforeLeavingShipping()) return;
    if (step < 2) setStep(step + 1);
  };
  const handlePlaceOrder = async () => {
    if (!validateBeforeLeavingShipping()) {
      setStep(0);
      return;
    }

    setOrdered(true);

    try {
      const payload = {
        items: items.map((item) => ({
          medicineId: item.product.medicineId,
          quantity: item.quantity,
        })),
        shippingAddress: `${form.address}, ${form.ward}, ${form.district}, ${form.province}`,
        note: form.note || "",
      };

      const response = await api.post("/orders", payload);
      setOrderCode(response.data.data.orderCode);
      setPlaced(true);
      toast.success(
        "Đơn hàng đang được xử lý. Vui lòng chờ xác nhận trong 5-10 phút.",
      );
      clearCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center bg-white rounded-2xl my-10 shadow-sm">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 text-sm mb-6">
          Bạn cần đăng nhập tài khoản để thực hiện thanh toán đơn hàng.
        </p>
        <Link
          to="/account"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: "#1250dc" }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-green-100">
          <Check size={40} className="text-green-600" />
        </div>
        <h2
          className="font-bold text-gray-800 mb-2"
          style={{ fontSize: "1.4rem" }}
        >
          Đặt hàng thành công!
        </h2>
        <p className="text-gray-600 mb-2">
          Mã đơn hàng:{" "}
          <span className="font-semibold" style={{ color: "#1250dc" }}>
            #{orderCode || "LC2026061201"}
          </span>
        </p>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left mb-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-1">
            <Clock size={16} />
            Đơn hàng đang được xử lý
          </div>
          <p className="text-sm text-blue-700">
            Vui lòng chờ nhà thuốc xác nhận trong khoảng 5-10 phút. Tổng thời
            gian nhận hàng dự kiến là 45-90 phút tùy khu vực giao hàng.
          </p>
        </div>
        <div className="space-y-3 text-left mb-6">
          {ORDER_PROCESSING_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#e8efff", color: "#1250dc" }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500">{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/products"
            className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tiếp tục mua sắm
          </Link>
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: "#1250dc" }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
        <Link to="/products" className="text-blue-700 hover:underline">
          ← Quay lại mua sắm
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
        <Link to="/cart" className="hover:text-blue-700">
          Giỏ hàng
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Thanh toán</span>
      </nav>

      {/* Steps */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? "text-white" : "bg-gray-200 text-gray-500"}`}
                style={i <= step ? { backgroundColor: "#1250dc" } : {}}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1 ${i <= step ? "font-medium" : "text-gray-500"}`}
                style={i === step ? { color: "#1250dc" } : {}}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mb-4 mx-2 ${i < step ? "" : "bg-gray-200"}`}
                style={i < step ? { backgroundColor: "#1250dc" } : {}}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <MapPin size={18} style={{ color: "#1250dc" }} /> Thông tin giao
                hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nguyễn Văn A"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0912 345 678"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="example@email.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option>Hà Nội</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                    <option>Hải Phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quận / Huyện *
                  </label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option>Cầu Giấy</option>
                    <option>Đống Đa</option>
                    <option>Hai Bà Trưng</option>
                    <option>Hoàn Kiếm</option>
                    <option>Ba Đình</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phường / Xã *
                  </label>
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    <option>Dịch Vọng</option>
                    <option>Quan Hoa</option>
                    <option>Mai Dịch</option>
                    <option>Nghĩa Đô</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Số nhà, tên đường..."
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 ${errors.address ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleNext}
                className="mt-5 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1250dc" }}
              >
                Tiếp theo →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <CreditCard size={18} style={{ color: "#1250dc" }} /> Phương
                thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === pm.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="accent-blue-700"
                    />
                    <span className="text-xl">{pm.icon}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {pm.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setStep(0)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90"
                  style={{ backgroundColor: "#1250dc" }}
                >
                  Xem lại đơn hàng →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Package size={18} style={{ color: "#1250dc" }} /> Xác nhận đơn
                hàng
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng
                </div>
                <div className="text-sm text-gray-600">
                  {form.name} · {form.phone}
                </div>
                <div className="text-sm text-gray-600">
                  {form.address}, {form.ward}, {form.district}, {form.province}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </div>
                <div className="text-sm text-gray-600">
                  {paymentMethods.find((p) => p.id === paymentMethod)?.label}
                </div>
              </div>
              <div className="divide-y divide-gray-100 mb-5">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">x{quantity}</div>
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#1250dc" }}
                    >
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#1250dc" }}
                >
                  Xác nhận đặt hàng ({formatPrice(totalPrice)})
                  {isOrdered && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-5 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">
            Đơn hàng ({totalItems} sản phẩm)
          </h3>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-2">
                <img
                  src={product.image}
                  alt=""
                  className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-700 line-clamp-2">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-400">x{quantity}</div>
                </div>
                <div className="text-xs font-semibold text-gray-800 shrink-0">
                  {formatPrice(product.price * quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {/* <div className="flex justify-between text-gray-600">
              <span>Vận chuyển</span>
              <span className={shipping === 0 ? "text-green-600" : ""}>
                {shipping === 0 ? "Mi\u1EC5n ph\xED" : formatPrice(shipping)}
              </span>
            </div> */}
            <div
              className="flex justify-between font-bold border-t border-gray-100 pt-2"
              style={{ color: "#e53935" }}
            >
              <span>Tổng cộng</span>
              <span>
                {
                  // formatPrice(total)
                  formatPrice(totalPrice)
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { CheckoutPage as default };
