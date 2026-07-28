import { Link } from "react-router-dom";
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
import { FaReact, FaDocker, FaNodeJs } from "react-icons/fa";

import {
  SiTailwindcss,
  SiVite,
  SiExpress,
  SiPrisma,
  SiPostgresql,
  SiRedis,
  SiSupabase,
  SiVercel,
  SiRender,
  SiJsonwebtokens,
  SiReactrouter,
} from "react-icons/si";
function Footer() {
  const techStack = {
    Frontend: [
      { name: "React", icon: FaReact },
      { name: "Vite", icon: SiVite },
      { name: "Tailwind", icon: SiTailwindcss },
    ],

    Backend: [
      { name: "Node.js", icon: FaNodeJs },
      { name: "Express.js", icon: SiExpress },
      { name: "JWT", icon: SiJsonwebtokens },
    ],

    "Database & Cache": [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "Supabase", icon: SiSupabase },
      { name: "Redis", icon: SiRedis },
    ],

    DevOps: [
      // { name: "Docker", icon: FaDocker },
      { name: "Render", icon: SiRender },
      { name: "Vercel", icon: SiVercel },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
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
                <div className="text-xs text-gray-500">Dự án Sản phẩm</div>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              Dự án Website CLONE từ trang website Nhà thuốc Long Châu.
            </p>
            <p className="text-sm text-red-600 mb-4 leading-relaxed font-semibold">
              Vui lòng không đặt mua sản phẩm nếu không có ý định mua sản phẩm
              hay có ý định mua sản phẩm.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#1250dc" }} />
                <span>giaphien1008@gmail.com</span>
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

          {/* Tech Stack */}
          <div className="w-full md:col-span-3">
            <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-4">
              {["Frontend", "Backend", "Database & Cache", "DevOps"].map(
                (group) => (
                  <div key={group} className="text-left">
                    <h3 className="mb-3 text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                      {group}
                    </h3>

                    {/* Chi tiết công nghệ: hàng ngang trên mobile, hàng dọc trên desktop */}
                    <div className="flex flex-row flex-wrap md:flex-col items-start gap-2.5 sm:gap-3">
                      {(techStack[group] || []).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.name}
                            className="group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-default w-auto md:w-full max-w-[170px]"
                          >
                            {Icon && (
                              <Icon className="text-xl sm:text-2xl text-slate-700 group-hover:text-blue-600 transition-colors shrink-0" />
                            )}
                            <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export { Footer };
