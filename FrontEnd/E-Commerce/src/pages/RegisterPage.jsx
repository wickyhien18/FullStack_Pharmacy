// ================================================================
// RegisterPage.jsx — Trang đăng ký tài khoản
// ================================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [form, setForm] = useState({
    userName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.userName) errs.userName = "Vui lòng nhập tên đăng nhập";
    if (!form.fullName) errs.fullName = "Vui lòng nhập họ tên";
    if (!form.email) errs.email = "Vui lòng nhập email";
    if (!form.phone) errs.phone = "Vui lòng nhập số điện thoại";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6)
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu không khớp";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Bỏ confirmPassword trước khi gửi lên API
    const { confirmPassword, ...data } = form;
    register(data);
  };

  // Dùng mảng để render field tránh lặp code
  const fields = [
    {
      name: "userName",
      label: "Tên đăng nhập",
      type: "text",
      placeholder: "vd: wicky123",
    },
    {
      name: "fullName",
      label: "Họ và tên",
      type: "text",
      placeholder: "vd: Nguyễn Văn A",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "email@gmail.com",
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "tel",
      placeholder: "0912345678",
    },
    {
      name: "password",
      label: "Mật khẩu",
      type: "password",
      placeholder: "••••••••",
    },
    {
      name: "confirmPassword",
      label: "Xác nhận mật khẩu",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tạo tài khoản
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none
                    focus:ring-2 focus:ring-primary-300 transition
                    ${errors[name] ? "border-red-400" : "border-gray-200"}`}
                />
                {errors[name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-primary-500 text-white py-2.5 rounded-lg text-sm font-medium
                         hover:bg-primary-600 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isRegistering ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
