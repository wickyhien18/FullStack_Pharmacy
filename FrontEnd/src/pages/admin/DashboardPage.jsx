import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import { getGeneralStats } from "../../services/stats.service.js";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getGeneralStats(),
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Tổng Quan
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className={`${color} p-2.5 rounded-xl`}>
                <Icon size={20} className="text-white" />
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

      {/* Overview message */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">
          Trạng thái hệ thống
        </h2>
        <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-4 rounded-xl">
          <span className="text-lg">✅</span>
          <span>Hệ thống cơ sở dữ liệu và API hoạt động bình thường.</span>
        </div>
      </div>
    </div>
  );
}
