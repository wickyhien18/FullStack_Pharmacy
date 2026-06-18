import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const statusMap = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

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

  const updateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      api.patch(`/admin/orders/${orderId}/status`, { orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý đơn hàng
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : data?.items?.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 font-semibold">
                      {order.orderCode}
                    </td>
                    <td className="px-6 py-4 text-gray-750">
                      {order.user?.fullName || "Khách hàng ẩn danh"}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-700">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.paymentMethod || "COD"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateMutation.mutate({
                            orderId: order.orderId,
                            orderStatus: e.target.value,
                          })
                        }
                        className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {statusMap[s] || s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs text-gray-500">
              Trang {page} / {data.totalPages}
            </span>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
