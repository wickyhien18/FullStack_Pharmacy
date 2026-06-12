// ================================================================
// Footer.jsx — Convert từ bigspring Footer.js
// Thay đổi:
//   next/link  → Link từ react-router-dom
//   next/image → <img> thông thường
//   Xoá import Social, config, menu (hardcode thẳng)
// ================================================================
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
  Shield,
  Award,
  Clock,
  Truck,
} from "lucide-react";

const footerMenu = [
  {
    name: "Sản phẩm",
    items: [
      { text: "Thuốc tiêu hoá", url: "/medicines?categoryId=1" },
      { text: "Vitamin", url: "/medicines?categoryId=2" },
      { text: "Thuốc ho hấp", url: "/medicines?categoryId=3" },
      { text: "Thiết bị y tế", url: "/medicines?categoryId=6" },
    ],
  },
  {
    name: "Hỗ trợ",
    items: [
      { text: "Hướng dẫn đặt hàng", url: "#" },
      { text: "Chính sách đổi trả", url: "#" },
      { text: "Câu hỏi thường gặp", url: "#" },
    ],
  },
  {
    name: "Công ty",
    items: [
      { text: "Giới thiệu", url: "#" },
      { text: "Liên hệ", url: "#" },
      { text: "Tuyển dụng", url: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      {/* Trust badges */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck size={28} />,
                title: "Giao h\xE0ng nhanh 2H",
                desc: "N\u1ED9i th\xE0nh TP.HCM & H\xE0 N\u1ED9i",
              },
              {
                icon: <Shield size={28} />,
                title: "100% H\xE0ng ch\xEDnh h\xE3ng",
                desc: "Cam k\u1EBFt kh\xF4ng h\xE0ng gi\u1EA3",
              },
              {
                icon: <Clock size={28} />,
                title: "H\u1ED7 tr\u1EE3 24/7",
                desc: "D\u01B0\u1EE3c s\u0129 t\u01B0 v\u1EA5n mi\u1EC5n ph\xED",
              },
              {
                icon: <Award size={28} />,
                title: "3.200+ Nh\xE0 thu\u1ED1c",
                desc: "To\xE0n qu\u1ED1c",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div style={{ color: "#1250dc" }} className="shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div
                style={{ backgroundColor: "#1250dc" }}
                className="p-2 rounded-xl"
              >
                <span className="text-white text-xl">💊</span>
              </div>
              <div>
                <div style={{ color: "#1250dc" }} className="font-bold text-lg">
                  Long Châu
                </div>
                <div className="text-xs text-gray-500">Nhà thuốc FPT</div>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Hệ thống nhà thuốc Long Châu với hơn 3.200 nhà thuốc trên toàn
              quốc. Cam kết cung cấp thuốc chính hãng, giá tốt nhất.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: "#1250dc" }} />
                <span>Hotline: 1800 6928 (Miễn phí 24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#1250dc" }} />
                <span>cskh@nhathuoclongchau.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  style={{ color: "#1250dc" }}
                  className="mt-0.5 shrink-0"
                />
                <span>Tòa nhà FPT, 17 Duy Tân, Cầu Giấy, Hà Nội</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>
          /*
          {/*Quick links}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Về Long Châu</h4>
            <ul className="space-y-2.5">
              {[
                "Gi\u1EDBi thi\u1EC7u",
                "H\u1EC7 th\u1ED1ng nh\xE0 thu\u1ED1c",
                "Tuy\u1EC3n d\u1EE5ng",
                "Tin t\u1EE9c",
                "Li\xEAn h\u1EC7",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          {/* <div>
            <h4 className="font-semibold text-gray-800 mb-4">Dịch vụ</h4>
            <ul className="space-y-2.5">
              {[
                "\u0110\u1EB7t thu\u1ED1c theo \u0111\u01A1n",
                "T\u01B0 v\u1EA5n d\u01B0\u1EE3c s\u0129",
                "Giao h\xE0ng t\u1EADn n\u01A1i",
                "Ch\u01B0\u01A1ng tr\xECnh kh\xE1ch h\xE0ng th\xE2n thi\u1EBFt",
                "Ki\u1EC3m tra h\xE0ng ch\xEDnh h\xE3ng",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
          {/* Policy */}
          {/* <div>
            <h4 className="font-semibold text-gray-800 mb-4">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              {[
                "Ch\xEDnh s\xE1ch b\u1EA3o m\u1EADt",
                "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng",
                "Ch\xEDnh s\xE1ch \u0111\u1ED5i tr\u1EA3",
                "H\u01B0\u1EDBng d\u1EABn mua h\xE0ng",
                "C\xE2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
          {footerMenu.map((section) => (
            <div key={section.name}>
              <h4 className="font-semibold text-gray-800 mb-4">
                {section.name}
              </h4>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item.text}>
                    <Link
                      to={item.url}
                      className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>
            © 2026 Công ty Cổ phần Dược phẩm Long Châu (FPT Retail). Tất cả
            quyền được bảo lưu.
          </span>
          <div className="flex items-center gap-4">
            <span>GPKD: 0108750671</span>
            <span>|</span>
            <span>GPHD: 01-NH/HN-CBNB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
