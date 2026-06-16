import { Link } from "react-router";
import {
  Phone,
  Mail,
  MapPin,
  Github,
  Linkedin,
  Shield,
  Award,
  Clock,
  Truck,
} from "lucide-react";
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      {/* Trust badges */}
      {/* <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
    { icon: <Truck size={28} />, title: "Giao h\xE0ng nhanh 2H", desc: "N\u1ED9i th\xE0nh TP.HCM & H\xE0 N\u1ED9i" },
    { icon: <Shield size={28} />, title: "100% H\xE0ng ch\xEDnh h\xE3ng", desc: "Cam k\u1EBFt kh\xF4ng h\xE0ng gi\u1EA3" },
    { icon: <Clock size={28} />, title: "H\u1ED7 tr\u1EE3 24/7", desc: "D\u01B0\u1EE3c s\u0129 t\u01B0 v\u1EA5n mi\u1EC5n ph\xED" },
    { icon: <Award size={28} />, title: "3.200+ Nh\xE0 thu\u1ED1c", desc: "To\xE0n qu\u1ED1c" }
  ].map((item) => <div key={item.title} className="flex items-center gap-3">
                <div style={{ color: "#1250dc" }} className="shrink-0">{item.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>)}
          </div>
        </div>
      </div> */}

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
                  WICKY HIEN
                </div>
                <div className="text-xs text-gray-500">Dự án Nhà thuốc</div>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Dự án Website clone từ trang website Nhà thuốc Long Châu. Vui lòng
              không đặt mua thuốc nếu có hay không có ý định mua thuốc
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#1250dc" }} />
                <span>giaphienhap2005@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Github size={14} style={{ color: "#1250dc" }} />

                <Link to={"https://github.com/wickyhien18"} target="_blank">
                  {" "}
                  Wicky Hien{" "}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin size={14} style={{ color: "#1250dc" }} />
                <Link
                  to={"https://www.linkedin.com/in/hien-giap-wicky"}
                  target="_blank"
                >
                  {" "}
                  Hien Giap{" "}
                </Link>
              </div>
            </div>
          </div>

          {/* Quick links */}
          {/* <div>
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
          </div> */}

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
        </div>
      </div>
    </footer>
  );
}
export { Footer };
