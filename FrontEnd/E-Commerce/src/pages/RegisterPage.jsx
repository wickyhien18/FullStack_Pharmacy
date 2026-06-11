// ================================================================
// RegisterPage.jsx — Style theo Bigspring
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
    return !Object.keys(errs).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...data } = form;
    register(data);
  };

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
    <section className="section">
      <div className="container" style={{ maxWidth: "560px" }}>
        <div className="card mt-0">
          <h2 className="text-center mb-2">Tạo tài khoản</h2>
          <p className="text-center text-text text-sm mb-6">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-bold text-dark mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`form-input w-full rounded ${errors[name] ? "border-red-400" : ""}`}
                />
                {errors[name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isRegistering}
              className="btn btn-primary w-full disabled:opacity-60 mt-2"
            >
              {isRegistering ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
