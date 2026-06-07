// ================================================================
// Admin DashboardPage.jsx — Trang tổng quan admin
// ================================================================
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import api from "@/lib/axios.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data.data),
  });

  const statCards = [
    {
      label: "Tổng đơn hàng",
      value: stats?.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Tổng người dùng",
      value: stats?.totalUsers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Tổng sản phẩm",
      value: stats?.totalProducts,
      icon: Package,
      color: "bg-amber-500",
    },
    {
      label: "Doanh thu",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: TrendingUp,
      color: "bg-green-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`${color} p-2 rounded-lg`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                (value ?? 0)
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Đơn hàng gần đây</h2>
        <p className="text-sm text-gray-400">
          Kết nối API{" "}
          <code className="bg-gray-100 px-1 rounded">/admin/orders/recent</code>{" "}
          để hiển thị
        </p>
      </div>
    </div>
  );
}
