// ================================================================
// LoginPage.jsx — Style theo Bigspring
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
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Vui lòng nhập email";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) login(form);
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "480px" }}>
        <div className="card mt-0">
          <h2 className="text-center mb-2">Đăng nhập</h2>
          <p className="text-center text-text text-sm mb-6">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@gmail.com"
                className={`form-input w-full rounded ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`form-input w-full rounded ${errors.password ? "border-red-400" : ""}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
