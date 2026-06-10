// ================================================================
// OrderHistoryPage.jsx — Lịch sử đơn hàng
// ================================================================
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import api from "@/lib/axios.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

// Map status sang màu badge
const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  SHIPPING: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100 text-red-700" },
  RETURN_REQUESTED: {
    label: "Yêu cầu hoàn",
    color: "bg-orange-100 text-orange-700",
  },
  RETURNED: { label: "Đã hoàn", color: "bg-gray-100 text-gray-700" },
};

export default function OrderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders/my").then((r) => r.data.data),
  });

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl h-32 animate-pulse"
            />
          ))}
      </div>
    );

  if (!data?.items?.length)
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="mx-auto mb-4 text-gray-300" size={64} />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          Chưa có đơn hàng nào
        </h2>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Lịch sử đơn hàng
      </h1>
      <div className="space-y-4">
        {data.items.map((order) => {
          const status = STATUS_CONFIG[order.orderStatus] || {
            label: order.orderStatus,
            color: "bg-gray-100 text-gray-700",
          };
          return (
            <div
              key={order.orderId}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-700">
                    #{order.orderCode}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Danh sách sản phẩm trong đơn */}
              <div className="space-y-1 mb-3">
                {order.items?.map((item) => (
                  <p key={item.orderItemId} className="text-sm text-gray-600">
                    {item.medicineName} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-500">
                  {order.paymentMethod} • {order.items?.length} sản phẩm
                </span>
                <span className="font-bold text-primary-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
