
// ================================================================
// ProfilePage.jsx — Style theo Bigspring
// ================================================================
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";
import api from "@/lib/axios.js";

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn:  () => api.get("/auth/profile").then((r) => r.data.data),
  });

  const infoItems = [
    { icon: User,     label: "Tên đăng nhập", value: data?.userName },
    { icon: User,     label: "Họ và tên",      value: data?.fullName },
    { icon: Mail,     label: "Email",           value: data?.email },
    { icon: Phone,    label: "Số điện thoại",   value: data?.phone },
    { icon: Shield,   label: "Vai trò",          value: data?.role },
    { icon: Calendar, label: "Ngày tạo",         value: data?.createdAt
        ? new Date(data.createdAt).toLocaleDateString("vi-VN") : "" },
  ];

  if (isLoading) return (
    <section className="section">
      <div className="container max-w-2xl animate-pulse space-y-4">
        <div className="h-28 bg-theme-light rounded-xl" />
        <div className="h-10 bg-theme-light rounded" />
        <div className="h-10 bg-theme-light rounded" />
      </div>
    </section>
  );

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "640px" }}>
        <h1 className="font-normal mb-8">Tài khoản của tôi</h1>

        <div className="card mt-0 p-0 overflow-hidden">
          {/* Banner */}
          <div className="bg-primary h-28 flex items-center px-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center
                            text-2xl font-bold text-primary">
              {data?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-4 text-white">
              <p className="font-bold text-lg">{data?.fullName}</p>
              <p className="text-white/80 text-sm">{data?.role}</p>
            </div>
          </div>

          {/* Info */}
          <div className="divide-y divide-border">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <Icon size={18} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-light">{label}</p>
                  <p className="text-sm font-bold text-dark">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
