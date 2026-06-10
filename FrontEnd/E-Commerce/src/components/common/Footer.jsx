// ================================================================
// Footer.jsx — Convert từ bigspring Footer.js
// Thay đổi:
//   next/link  → Link từ react-router-dom
//   next/image → <img> thông thường
//   Xoá import Social, config, menu (hardcode thẳng)
// ================================================================
import { Link } from "react-router-dom";

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
    <footer className="section bg-theme-light pb-0">
      <div className="container">
        <div className="row">
          {/* Logo + mô tả */}
          <div className="mb-12 w-full px-4 sm:w-1/2 lg:w-1/4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-primary font-primary">
                💊 Nhà Thuốc Online
              </span>
            </Link>
            <p className="text-sm text-text leading-relaxed">
              Nhà thuốc online uy tín — hơn 10,000 sản phẩm chính hãng, giao
              hàng nhanh toàn quốc.
            </p>
          </div>

          {/* Footer menu */}
          {footerMenu.map((col) => (
            <div className="mb-12 w-full px-4 sm:w-1/2 lg:w-1/4" key={col.name}>
              <h4 className="text-dark font-bold mb-4">{col.name}</h4>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.text}>
                    <Link
                      to={item.url}
                      className="text-sm text-text hover:text-primary transition"
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-border py-6">
          <p className="text-sm text-center text-text">
            © {new Date().getFullYear()} Nhà Thuốc Online. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
