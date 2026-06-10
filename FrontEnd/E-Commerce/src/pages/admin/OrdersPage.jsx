// ================================================================
// Admin OrdersPage.jsx — Quản lý đơn hàng
// ================================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios.js";
import { formatPrice } from "@/components/medicine/MedicineCard.jsx";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () =>
      api
        .get("/admin/orders", { params: { page, limit: 20 } })
        .then((r) => r.data.data),
  });

  // Cập nhật status đơn hàng
  const updateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      api.patch(`/admin/orders/${orderId}/status`, { orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý đơn hàng
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Mã đơn",
                "Khách hàng",
                "Tổng tiền",
                "Thanh toán",
                "Trạng thái",
                "Ngày đặt",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : data?.items?.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.user?.fullName || "Khách"}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary-600">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      {/* Dropdown đổi status trực tiếp */}
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateMutation.mutate({
                            orderId: order.orderId,
                            orderStatus: e.target.value,
                          })
                        }
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
