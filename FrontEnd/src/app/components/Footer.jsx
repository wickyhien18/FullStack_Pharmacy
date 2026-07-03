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
          <div className="space-y-10 w-full md:col-span-3">
            {/* Two-column layout: Frontend on left, others on right */}

            <div className="mt-4 flex justify-end">
              {["Frontend", "Backend", "Database & Cache", "DevOps"].map(
                (group) => (
                  <div key={group} className="min-h-[120px] text-center">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">
                      {group}
                    </h3>

                    <div className="flex flex-col gap-6">
                      {(techStack[group] || []).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.name}
                            className="group w-40 mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg text-center"
                          >
                            <div className="flex flex-col items-center gap-3">
                              {Icon && (
                                <Icon className="text-3xl text-slate-700" />
                              )}
                              <span className="text-sm font-medium break-words">
                                {item.name}
                              </span>
                            </div>
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
