import { useState } from "react";
import { Link } from "react-router";
import {
  ChevronRight,
  Eye,
  EyeOff,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Bell,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios.js";
import toast from "react-hot-toast";

const statusMap = {
  PENDING: {
    label: "Chờ xác nhận",
    style: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    style: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    style: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  DELIVERED: {
    label: "Đã giao hàng",
    style: "bg-green-50 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    style: "bg-red-50 text-red-700 border-red-200",
  },
};

function AccountPage() {
  const {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    isLoggingIn,
    isRegistering,
  } = useAuth();
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("profile");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  // Query order history
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api.get("/orders/my").then((r) => r.data.data),
    enabled: isAuthenticated && activeSubTab === "orders",
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Vui lòng điền đầy đủ email và mật khẩu");
      return;
    }
    login(loginForm);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (
      !regForm.fullName ||
      !regForm.userName ||
      !regForm.email ||
      !regForm.phone ||
      !regForm.password
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }
    if (regForm.password !== regForm.confirm) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    register(
      {
        fullName: regForm.fullName,
        userName: regForm.userName,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
      },
      {
        onSuccess: () => setTab("login"), // ← chuyển sang tab login sau khi đăng ký thành công
      },
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isAuthenticated && user) {
    const ordersList = ordersData?.items || [];
    return (
      <div className="max-w-7xl mx-auto px-4 py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link to="/" className="hover:text-blue-700">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800">Tài khoản</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl"
                style={{ backgroundColor: "#1250dc" }}
              >
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div className="font-semibold text-gray-800">{user.fullName}</div>
              <div className="text-sm text-gray-500">
                {user.phone || "@" + user.userName}
              </div>
              <div className="mt-3 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full inline-block font-medium">
                🔒 Vai trò: {user.role?.roleName || "Người dùng"}
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden">
              {[
                {
                  id: "profile",
                  icon: <User size={16} />,
                  label: "Thông tin tài khoản",
                },
                {
                  id: "orders",
                  icon: <ShoppingBag size={16} />,
                  label: "Đơn hàng của tôi",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 text-left ${
                    activeSubTab === item.id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span style={{ color: "#1250dc" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {user.role?.roleName === "ROLE_ADMIN" && (
                <Link
                  to="/admin"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 font-semibold transition-colors border-b border-gray-50 text-left"
                >
                  <span className="text-amber-600">🛡️</span>
                  Quản trị hệ thống
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 bg-white rounded-2xl p-6">
            {activeSubTab === "profile" ? (
              <>
                <h2
                  className="font-semibold text-gray-800 mb-5"
                  style={{ fontSize: "1rem" }}
                >
                  Thông tin tài khoản
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      disabled
                      value={user.fullName || ""}
                      className="w-full border border-gray-150 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên đăng nhập
                    </label>
                    <input
                      disabled
                      value={user.userName || ""}
                      className="w-full border border-gray-150 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      disabled
                      value={user.email || ""}
                      className="w-full border border-gray-150 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      disabled
                      value={user.phone || ""}
                      className="w-full border border-gray-150 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2
                  className="font-semibold text-gray-800 mb-5"
                  style={{ fontSize: "1rem" }}
                >
                  Đơn hàng của tôi
                </h2>
                {isLoadingOrders ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Đang tải lịch sử đơn hàng...
                    </p>
                  </div>
                ) : ordersList.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">
                    Bạn chưa đặt đơn hàng nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersList.map((order) => (
                      <div
                        key={order.orderId}
                        className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-2 mb-3">
                          <div>
                            <span className="font-mono text-xs text-gray-500 font-semibold">
                              {order.orderCode}
                            </span>
                            <span className="text-xs text-gray-400 ml-3">
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMap[order.orderStatus]?.style || "bg-gray-100 text-gray-600"}`}
                          >
                            {statusMap[order.orderStatus]?.label ||
                              order.orderStatus}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {item.medicineName}{" "}
                                <span className="text-gray-400">
                                  x{item.quantity}
                                </span>
                              </span>
                              <span className="font-medium text-gray-800">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-2 text-sm font-semibold">
                          <span className="text-gray-500">
                            Tổng thanh toán:
                          </span>
                          <span style={{ color: "#1250dc" }}>
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
        <span className="text-gray-800">Tài khoản</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols gap-8 items-start max-w-4xl mx-auto">
        {/* Forms */}
        <div className="bg-white rounded-2xl p-8 shadow-sm ">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                style={tab === t ? { backgroundColor: "#1250dc" } : {}}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email đăng nhập *
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="Nhập email của bạn"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    placeholder="Nhập mật khẩu"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                style={{ backgroundColor: "#1250dc" }}
              >
                {isLoggingIn && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Đăng nhập
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={regForm.fullName}
                  onChange={(e) =>
                    setRegForm({ ...regForm, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên đăng nhập (Username) *
                </label>
                <input
                  type="text"
                  value={regForm.userName}
                  onChange={(e) =>
                    setRegForm({ ...regForm, userName: e.target.value })
                  }
                  placeholder="Chỉ dùng chữ, số và dấu gạch dưới"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) =>
                    setRegForm({ ...regForm, phone: e.target.value })
                  }
                  placeholder="0912345678"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm({ ...regForm, email: e.target.value })
                  }
                  placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  placeholder="Mật khẩu tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  value={regForm.confirm}
                  onChange={(e) =>
                    setRegForm({ ...regForm, confirm: e.target.value })
                  }
                  placeholder="Nhập lại mật khẩu"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                style={{ backgroundColor: "#1250dc" }}
              >
                {isRegistering && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Đăng ký
              </button>
            </form>
          )}
        </div>

        {/* Benefits panel */}
        {/* <div className="space-y-4">
          <div
            className="rounded-2xl p-6 text-white shadow-sm animate-fade-in"
            style={{ backgroundColor: "#1250dc" }}
          >
            <h3 className="font-bold mb-3" style={{ fontSize: "1.1rem" }}>
              Lợi ích thành viên Long Châu
            </h3>
            <ul className="space-y-3">
              {[
                "💰 Tích điểm mỗi đơn hàng, đổi quà hấp dẫn",
                "🎁 Quản lý thông tin thành viên dễ dàng",
                "🚀 Miễn phí giao hàng toàn quốc với đơn từ 150k",
                "📱 Tra cứu lịch sử mua hàng dễ dàng",
                "💊 Theo dõi trạng thái đơn thuốc nhanh chóng",
              ].map((b) => (
                <li key={b} className="text-sm text-white/95">
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3
              className="font-semibold text-gray-800 mb-3"
              style={{ fontSize: "0.95rem" }}
            >
              Cần hỗ trợ?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Liên hệ hotline của chúng tôi để được hỗ trợ tận tình
            </p>
            <a
              href="tel:18006928"
              className="block text-center py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#1250dc" }}
            >
              📞 1800 6928 (Miễn phí)
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default AccountPage;
