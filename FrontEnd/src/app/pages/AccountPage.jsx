import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  EyeOff,
  User,
  ShoppingBag,
  Pencil,
  Lock,
  Mail,
  X,
  Check,
  // Heart,
  // MapPin,
  // Bell,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios.js";
import toast from "react-hot-toast";
import CancelOrderModal from "../components/CancelOrderModal.jsx";

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

// Status user có thể huỷ/yêu cầu huỷ
const CANCELLABLE = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

// ── Modal đổi email (OTP) ─────────────────────────────────────────
function ChangeEmailModal({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1=nhập email mới, 2=nhập OTP
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => api.post("/auth/request-email-change", { newEmail }),
    onSuccess: () => {
      toast.success("Mã OTP đã gửi!");
      setStep(2);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.post("/auth/verify-email-change", { otp }),
    onSuccess: () => {
      toast.success("Đổi email thành công!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "OTP không đúng"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Đổi địa chỉ email</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Nhập email mới. Chúng tôi sẽ gửi mã OTP để xác nhận.
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email mới..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={() => requestMutation.mutate()}
                disabled={!newEmail || requestMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: "#1250dc" }}
              >
                {requestMutation.isPending ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-1">
              Nhập mã OTP đã gửi đến:
            </p>
            <p className="text-sm font-semibold text-blue-700 mb-4">
              {newEmail}
            </p>
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập mã 6 số..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:border-blue-400 mb-2"
            />
            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              className="text-xs text-blue-600 hover:underline mb-4 block"
            >
              {requestMutation.isPending ? "Đang gửi..." : "Gửi lại mã"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
              >
                Quay lại
              </button>
              <button
                onClick={() => verifyMutation.mutate()}
                disabled={otp.length !== 6 || verifyMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: "#1250dc" }}
              >
                {verifyMutation.isPending ? "Đang xác nhận..." : "Xác nhận"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal đổi mật khẩu ────────────────────────────────────────────
function ChangePasswordModal({ onClose, logout }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      onClose();
      setTimeout(() => logout(), 1500);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
  });

  const handleSubmit = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    if (form.newPassword !== form.confirmPassword)
      return toast.error("Mật khẩu mới không khớp");
    if (form.newPassword.length < 6)
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Đổi mật khẩu</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { key: "currentPassword", label: "Mật khẩu hiện tại" },
            { key: "newPassword", label: "Mật khẩu mới" },
            { key: "confirmPassword", label: "Xác nhận mật khẩu mới" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type={
                    showPwd[
                      key.replace("Password", "").replace("confirm", "confirm")
                    ]
                      ? "text"
                      : "password"
                  }
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const k =
                      key === "currentPassword"
                        ? "current"
                        : key === "newPassword"
                          ? "new"
                          : "confirm";
                    setShowPwd({ ...showPwd, [k]: !showPwd[k] });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPwd[
                    key === "currentPassword"
                      ? "current"
                      : key === "newPassword"
                        ? "new"
                        : "confirm"
                  ] ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#1250dc" }}
          >
            {mutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal quên mật khẩu ───────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=nhập email, 2=nhập OTP+mật khẩu mới
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => api.post("/auth/forgot-password", { email }),
    onSuccess: () => {
      toast.success("Mã OTP đã gửi!");
      setStep(2);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Email không tồn tại"),
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      api.post("/auth/reset-password", { email, otp, newPassword: newPwd }),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
  });

  const handleReset = () => {
    if (newPwd !== confirmPwd) return toast.error("Mật khẩu không khớp");
    if (newPwd.length < 6)
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    resetMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Quên mật khẩu</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Nhập email đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={() => requestMutation.mutate()}
                disabled={!email || requestMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: "#1250dc" }}
              >
                {requestMutation.isPending ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Nhập mã OTP đã gửi đến <strong>{email}</strong> và mật khẩu mới.
            </p>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Mã OTP 6 số..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:border-blue-400"
              />
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Mật khẩu mới..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Xác nhận mật khẩu mới..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              className="text-xs text-blue-600 hover:underline mb-4 block"
            >
              {requestMutation.isPending ? "Đang gửi..." : "Gửi lại mã OTP"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
              >
                Quay lại
              </button>
              <button
                onClick={handleReset}
                disabled={
                  otp.length !== 6 || !newPwd || resetMutation.isPending
                }
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: "#1250dc" }}
              >
                {resetMutation.isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

//Trang chính
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
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [cancelOrder, setCancelOrder] = useState(null); // order đang muốn huỷ

  // Modals
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  // Edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

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

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put("/auth/profile", data),
    onSuccess: ({ data }) => {
      toast.success("Cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      // Cập nhật store auth với thông tin mới
      window.location.reload(); // đơn giản nhất — reload để fetch lại profile
    },
    onError: (err) => toast.error(err.response?.data?.message || "Thất bại"),
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
    )
      return toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
    if (regForm.password !== regForm.confirm)
      return toast.error("Xác nhận mật khẩu không khớp");
    register(
      {
        fullName: regForm.fullName,
        userName: regForm.userName,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
      },
      { onSuccess: () => setTab("login") },
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
                🔒 Vai trò: {user.role || "Người dùng"}
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

              {user.role === "ROLE_ADMIN" && (
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
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="font-semibold text-gray-800"
                    style={{ fontSize: "1rem" }}
                  >
                    Thông tin tài khoản
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditForm({
                          fullName: user.fullName || "",
                          phone: user.phone || "",
                        });
                      }}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={14} /> Chỉnh sửa
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Họ và tên
                        </label>
                        <input
                          value={editForm.fullName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="w-full border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={() => updateProfileMutation.mutate(editForm)}
                        disabled={updateProfileMutation.isPending}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                        style={{ backgroundColor: "#1250dc" }}
                      >
                        {updateProfileMutation.isPending
                          ? "Đang lưu..."
                          : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Họ và tên", value: user.fullName },
                      { label: "Tên đăng nhập", value: user.userName },
                      { label: "Email", value: user.email },
                      { label: "Số điện thoại", value: user.phone },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {label}
                        </label>
                        <input
                          disabled
                          value={value || ""}
                          className="w-full border border-gray-150 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Bảo mật */}
                {!isEditing && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Bảo mật tài khoản
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowChangeEmail(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Mail size={15} /> Đổi email
                      </button>
                      <button
                        onClick={() => setShowChangePwd(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Lock size={15} /> Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                )}
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
                        {/* Header */}
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

                        {/* Items */}
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {item.productName}{" "}
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

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#1250dc" }}
                          >
                            Tổng: {formatPrice(order.totalPrice)}
                          </span>

                          {/* Nút huỷ — chỉ hiện khi status cho phép */}
                          {CANCELLABLE.includes(order.orderStatus) && (
                            <button
                              onClick={() => setCancelOrder(order)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              {order.orderStatus === "DELIVERED"
                                ? "Yêu cầu hoàn hàng"
                                : order.orderStatus === "SHIPPING"
                                  ? "Yêu cầu huỷ"
                                  : "Huỷ đơn"}
                            </button>
                          )}

                          {/* Hiển thị lý do nếu đang chờ xử lý */}
                          {(order.orderStatus === "CANCEL_REQUESTED" ||
                            order.orderStatus === "RETURN_REQUESTED") && (
                            <span className="text-xs text-orange-600 italic">
                              Đang chờ nhà thuốc xử lý...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {cancelOrder && (
          <CancelOrderModal
            order={cancelOrder}
            onClose={() => setCancelOrder(null)}
          />
        )}
        {showChangeEmail && (
          <ChangeEmailModal onClose={() => setShowChangeEmail(false)} />
        )}
        {showChangePwd && (
          <ChangePasswordModal
            onClose={() => setShowChangePwd(false)}
            logout={logout}
          />
        )}
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

              {/* Quên mật khẩu */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPwd(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                style={{ backgroundColor: "#1250dc" }}
              >
                Đăng nhập
                {isLoggingIn && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {[
                {
                  label: "Họ và tên *",
                  field: "fullName",
                  type: "text",
                  placeholder: "Nguyễn Văn A",
                },
                {
                  label: "Tên đăng nhập *",
                  field: "userName",
                  type: "text",
                  placeholder: "Chỉ dùng chữ, số và dấu _",
                },
                {
                  label: "Số điện thoại *",
                  field: "phone",
                  type: "tel",
                  placeholder: "0912345678",
                },
                {
                  label: "Email *",
                  field: "email",
                  type: "email",
                  placeholder: "example@email.com",
                },
                {
                  label: "Mật khẩu *",
                  field: "password",
                  type: "password",
                  placeholder: "Tối thiểu 6 ký tự",
                },
                {
                  label: "Xác nhận mật khẩu *",
                  field: "confirm",
                  type: "password",
                  placeholder: "Nhập lại mật khẩu",
                },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={regForm[field]}
                    onChange={(e) =>
                      setRegForm({ ...regForm, [field]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 flex justify-center items-center gap-2"
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
        {/* Modal quên mật khẩu */}
        {showForgotPwd && (
          <ForgotPasswordModal onClose={() => setShowForgotPwd(false)} />
        )}

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
