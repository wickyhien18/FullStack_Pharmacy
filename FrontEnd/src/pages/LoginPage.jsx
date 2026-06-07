// ================================================================
// LoginPage.jsx — Trang đăng nhập
// ================================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Xoá lỗi của field khi user bắt đầu gõ lại
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Vui lòng nhập email";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    setErrors(errs);
    return Object.keys(errs).length === 0; // true = hợp lệ
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // ngăn reload trang
    if (!validate()) return;
    login(form); // gọi mutation từ useAuth
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 text-sm mb-6">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary-600 hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@gmail.com"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none
                  focus:ring-2 focus:ring-primary-300 transition
                  ${errors.email ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none
                  focus:ring-2 focus:ring-primary-300 transition
                  ${errors.password ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary-500 text-white py-2.5 rounded-lg text-sm font-medium
                         hover:bg-primary-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
