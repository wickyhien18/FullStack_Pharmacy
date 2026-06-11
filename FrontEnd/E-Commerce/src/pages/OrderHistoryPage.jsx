// ================================================================
// OrderHistoryPage.jsx — Style theo Bigspring
// ================================================================
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import api from "@/lib/axios.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

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
  RETURNED: { label: "Đã hoàn", color: "bg-theme-light text-text" },
};

export default function OrderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders/my").then((r) => r.data.data),
  });

  if (isLoading)
    return (
      <section className="section">
        <div className="container max-w-3xl space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-theme-light rounded-xl h-32 animate-pulse"
              />
            ))}
        </div>
      </section>
    );

  if (!data?.items?.length)
    return (
      <section className="section">
        <div className="container text-center py-20">
          <Package className="mx-auto mb-4 text-border" size={64} />
          <h3 className="font-normal text-text mb-2">Chưa có đơn hàng nào</h3>
        </div>
      </section>
    );

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "768px" }}>
        <h1 className="font-normal mb-8">Lịch sử đơn hàng</h1>
        <div className="space-y-4">
          {data.items.map((order) => {
            const status = STATUS_CONFIG[order.orderStatus] || {
              label: order.orderStatus,
              color: "bg-theme-light text-text",
            };
            return (
              <div key={order.orderId} className="card mt-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-dark">#{order.orderCode}</p>
                    <p className="text-xs text-light mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items?.map((item) => (
                    <p key={item.orderItemId} className="text-sm text-text">
                      {item.medicineName} × {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-light">
                    {order.items?.length} sản phẩm
                  </span>
                  <span className="font-bold text-primary">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
