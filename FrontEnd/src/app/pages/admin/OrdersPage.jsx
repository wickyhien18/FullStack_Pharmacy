// ================================================================
// OrdersPage.jsx — Admin quản lý đơn hàng
// Hiển thị danh sách, lọc theo status, đổi status, xem chi tiết
// ================================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import { translateApiMessage } from "../../../lib/errorMessages.js";
import api from "../../../lib/axios.js";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  SHIPPING: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100 text-red-700" },
  CANCEL_REQUESTED: {
    label: "Yêu cầu huỷ",
    color: "bg-orange-100 text-orange-700",
  },
  RETURN_REQUESTED: {
    label: "Yêu cầu hoàn",
    color: "bg-purple-100 text-purple-700",
  },
  RETURNED: { label: "Đã hoàn", color: "bg-gray-100 text-gray-600" },
};

// Các status admin có thể chuyển sang (không cho phép đổi lung tung)
const NEXT_STATUS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// ── Modal xem chi tiết + đổi status ─────────────────────────────
function OrderDetailModal({ order, onClose }) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const nextStatuses = NEXT_STATUS[order.orderStatus] || [];

  const statusMutation = useMutation({
    mutationFn: (orderStatus) =>
      api.patch(`/admin/orders/${order.orderId}/status`, { orderStatus }),
    onSuccess: ({ data }) => {
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      onClose();
    },
    onError: (err) =>
      toast.error(
        translateApiMessage(err.response?.data?.message) || "Thất bại",
      ),
  });

  // Admin xử lý yêu cầu huỷ/hoàn
  const cancelRequestMutation = useMutation({
    mutationFn: ({ action, rejectReason }) =>
      api.patch(`/admin/orders/${order.orderId}/cancel-request`, {
        action,
        rejectReason,
      }),
    onSuccess: ({ data }) => {
      toast.success(data.data?.message || "Xử lý thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      onClose();
    },
    onError: (err) =>
      toast.error(
        translateApiMessage(err.response?.data?.message) || "Thất bại",
      ),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">#{order.orderCode}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Thông tin người đặt */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">Khách hàng</p>
            <p className="text-gray-600">{order.user?.fullName || "—"}</p>
            <p className="text-gray-500">{order.user?.email}</p>
          </div>

          {/* Địa chỉ giao hàng */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">
                Địa chỉ giao hàng
              </p>
              <p className="text-gray-600">{order.shippingAddress}</p>
            </div>
          )}

          {/* Ghi chú */}
          {order.note && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">Ghi chú</p>
              <p className="text-gray-600">{order.note}</p>
            </div>
          )}

          {/* Lý do huỷ (nếu có) */}
          {order.cancelledReason && (
            <div className="bg-orange-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-orange-700 mb-1">
                Lý do huỷ / hoàn
              </p>
              <p className="text-orange-600">{order.cancelledReason}</p>
            </div>
          )}

          {/* Danh sách sản phẩm */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Sản phẩm</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.productName}{" "}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3 font-semibold">
            <span className="text-gray-700">Tổng cộng</span>
            <span style={{ color: "#1250dc" }}>
              {formatPrice(order.totalPrice)}
            </span>
          </div>

          {/* Trạng thái hiện tại */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Trạng thái:</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[order.orderStatus]?.color}`}
            >
              {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
            </span>
          </div>

          {/* Xử lý yêu cầu huỷ/hoàn */}
          {(order.orderStatus === "CANCEL_REQUESTED" ||
            order.orderStatus === "RETURN_REQUESTED") && (
            <div className="flex gap-3">
              <button
                onClick={() =>
                  cancelRequestMutation.mutate({ action: "approve" })
                }
                disabled={cancelRequestMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-60"
              >
                ✅ Đồng ý{" "}
                {order.orderStatus === "RETURN_REQUESTED" ? "hoàn" : "huỷ"}
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Lý do từ chối:");
                  if (reason !== null) {
                    cancelRequestMutation.mutate({
                      action: "reject",
                      rejectReason: reason,
                    });
                  }
                }}
                disabled={cancelRequestMutation.isPending}
                className="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
              >
                ❌ Từ chối
              </button>
            </div>
          )}

          {/* Đổi status */}
          {nextStatuses.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Chuyển trạng thái
              </p>
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border-2 hover:opacity-90 disabled:opacity-60 transition"
                    style={{ borderColor: "#1250dc", color: "#1250dc" }}
                  >
                    → {STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Trang chính ──────────────────────────────────────────────────
export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, filterStatus],
    queryFn: () =>
      api
        .get(
          `/admin/orders?page=${page}&limit=20${filterStatus ? `&status=${filterStatus}` : ""}`,
        )
        .then((r) => r.data.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>

        {/* Filter status */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Mã đơn",
                "Khách hàng",
                "Tổng tiền",
                "Trạng thái",
                "Ngày đặt",
                "",
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
            {isLoading ? (
              Array(5)
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
            ) : data?.items?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-400 text-sm"
                >
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              data?.items?.map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                    #{order.orderCode}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700">
                      {order.user?.fullName || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "#1250dc" }}
                  >
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[order.orderStatus]?.color || "bg-gray-100 text-gray-600"}`}
                    >
                      {STATUS_CONFIG[order.orderStatus]?.label ||
                        order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-gray-400 hover:text-blue-500 transition"
                      title="Xem chi tiết"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${page === p ? "text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              style={page === p ? { backgroundColor: "#1250dc" } : {}}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
