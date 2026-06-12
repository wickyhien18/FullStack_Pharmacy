import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Eye, EyeOff, User, ShoppingBag, Heart, MapPin, Bell } from "lucide-react";
function AccountPage() {
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const mockUser = {
    name: "Nguy\u1EC5n V\u0103n A",
    phone: "0912 345 678",
    email: "example@email.com",
    points: 1250,
    orders: 12
  };
  if (loggedIn) {
    return <div className="max-w-7xl mx-auto px-4 py-5">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800">Tài khoản</span>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {
      /* Sidebar */
    }
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl" style={{ backgroundColor: "#1250dc" }}>
                {mockUser.name[0]}
              </div>
              <div className="font-semibold text-gray-800">{mockUser.name}</div>
              <div className="text-sm text-gray-500">{mockUser.phone}</div>
              <div className="mt-3 text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full inline-block font-medium">
                ⭐ {mockUser.points.toLocaleString()} điểm tích lũy
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden">
              {[
      { icon: <User size={16} />, label: "Th\xF4ng tin t\xE0i kho\u1EA3n" },
      { icon: <ShoppingBag size={16} />, label: `\u0110\u01A1n h\xE0ng c\u1EE7a t\xF4i (${mockUser.orders})` },
      { icon: <Heart size={16} />, label: "S\u1EA3n ph\u1EA9m y\xEAu th\xEDch" },
      { icon: <MapPin size={16} />, label: "\u0110\u1ECBa ch\u1EC9 giao h\xE0ng" },
      { icon: <Bell size={16} />, label: "Th\xF4ng b\xE1o" }
    ].map((item) => <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0 text-left">
                  <span style={{ color: "#1250dc" }}>{item.icon}</span>
                  {item.label}
                </button>)}
              <button onClick={() => setLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                Đăng xuất
              </button>
            </div>
          </div>

          {
      /* Main */
    }
          <div className="md:col-span-3 bg-white rounded-2xl p-6">
            <h2 className="font-semibold text-gray-800 mb-5" style={{ fontSize: "1rem" }}>Thông tin tài khoản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
      { label: "H\u1ECD v\xE0 t\xEAn", value: mockUser.name },
      { label: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", value: mockUser.phone },
      { label: "Email", value: mockUser.email },
      { label: "Ng\xE0y sinh", value: "01/01/1990" },
      { label: "Gi\u1EDBi t\xEDnh", value: "Nam" }
    ].map((field) => <div key={field.label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                  <input defaultValue={field.value} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>)}
            </div>
            <button className="mt-5 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: "#1250dc" }}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Tài khoản</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
        {
    /* Login/Register form */
  }
        <div className="bg-white rounded-2xl p-8">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            {["login", "register"].map((t) => <button
    key={t}
    onClick={() => setTab(t)}
    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
    style={tab === t ? { backgroundColor: "#1250dc" } : {}}
  >
                {t === "login" ? "\u0110\u0103ng nh\u1EADp" : "\u0110\u0103ng k\xFD"}
              </button>)}
          </div>

          {tab === "login" ? <form onSubmit={(e) => {
    e.preventDefault();
    setLoggedIn(true);
  }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại / Email</label>
                <input
    type="text"
    value={loginForm.phone}
    onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
    placeholder="Nhập số điện thoại hoặc email"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
    type={showPwd ? "text" : "password"}
    value={loginForm.password}
    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
    placeholder="Nhập mật khẩu"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-400"
  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button type="button" className="text-xs hover:underline" style={{ color: "#1250dc" }}>Quên mật khẩu?</button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#1250dc" }}>
                Đăng nhập
              </button>
              <div className="relative flex items-center gap-3 text-gray-400 text-xs">
                <div className="flex-1 h-px bg-gray-200" />
                <span>hoặc đăng nhập với</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="text-lg">G</span> Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="text-blue-600 text-lg">f</span> Facebook
                </button>
              </div>
            </form> : <form onSubmit={(e) => {
    e.preventDefault();
    setTab("login");
  }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                <input
    type="text"
    value={regForm.name}
    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
    placeholder="Nguyễn Văn A"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                <input
    type="tel"
    value={regForm.phone}
    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
    placeholder="0912 345 678"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
    type="email"
    value={regForm.email}
    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
    placeholder="example@email.com"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                <input
    type="password"
    value={regForm.password}
    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
    placeholder="Tối thiểu 8 ký tự"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                <input
    type="password"
    value={regForm.confirm}
    onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
    placeholder="Nhập lại mật khẩu"
    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
  />
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-blue-700" required />
                <span>Tôi đồng ý với <a href="#" className="underline" style={{ color: "#1250dc" }}>Điều khoản sử dụng</a> và <a href="#" className="underline" style={{ color: "#1250dc" }}>Chính sách bảo mật</a></span>
              </label>
              <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#1250dc" }}>
                Đăng ký
              </button>
            </form>}
        </div>

        {
    /* Benefits */
  }
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#1250dc" }}>
            <h3 className="font-bold mb-2" style={{ fontSize: "1.1rem" }}>Lợi ích thành viên Long Châu</h3>
            <ul className="space-y-3">
              {[
    "\u{1F4B0} T\xEDch \u0111i\u1EC3m m\u1ED7i \u0111\u01A1n h\xE0ng, \u0111\u1ED5i qu\xE0 h\u1EA5p d\u1EABn",
    "\u{1F381} \u01AFu \u0111\xE3i \u0111\u1ED9c quy\u1EC1n cho th\xE0nh vi\xEAn",
    "\u{1F680} Mi\u1EC5n ph\xED ship to\xE0n qu\u1ED1c",
    "\u{1F4F1} Tra c\u1EE9u l\u1ECBch s\u1EED mua h\xE0ng d\u1EC5 d\xE0ng",
    "\u{1F48A} Nh\u1EADn th\xF4ng b\xE1o khuy\u1EBFn m\xE3i thu\u1ED1c s\u1EDBm nh\u1EA5t"
  ].map((b) => <li key={b} className="text-sm text-white/90">{b}</li>)}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3" style={{ fontSize: "0.95rem" }}>Cần hỗ trợ?</h3>
            <p className="text-sm text-gray-600 mb-3">Liên hệ hotline của chúng tôi để được hỗ trợ tận tình</p>
            <a href="tel:18006928" className="block text-center py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#1250dc" }}>
              📞 1800 6928 (Miễn phí)
            </a>
          </div>
        </div>
      </div>
    </div>;
}
export {
  AccountPage as default
};
