// ================================================================
// ProfilePage.jsx — Trang thông tin tài khoản
// ================================================================
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, Shield } from "lucide-react";
import api from "@/lib/axios.js";

export default function ProfilePage() {
  // Lấy thông tin profile từ API
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/auth/profile").then((r) => r.data.data),
  });

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    );

  const infoItems = [
    { icon: User, label: "Tên đăng nhập", value: data?.userName },
    { icon: User, label: "Họ và tên", value: data?.fullName },
    { icon: Mail, label: "Email", value: data?.email },
    { icon: Phone, label: "Số điện thoại", value: data?.phone },
    { icon: Shield, label: "Vai trò", value: data?.role },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Tài khoản của tôi
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Avatar banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-28 flex items-center px-8">
          <div
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center
                          text-2xl font-bold text-primary-600"
          >
            {data?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="ml-4 text-white">
            <p className="font-bold text-lg">{data?.fullName}</p>
            <p className="text-primary-100 text-sm">{data?.role}</p>
          </div>
        </div>

        {/* Info list */}
        <div className="divide-y divide-gray-50">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <Icon size={18} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-700">
                  {value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
