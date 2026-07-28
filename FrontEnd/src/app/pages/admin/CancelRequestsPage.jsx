// ================================================================
// CancelRequestsPage.jsx — Admin xử lý yêu cầu huỷ/hoàn hàng
// ================================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { translateApiMessage } from "../../../lib/errorMessages.js";
import api from "../../../lib/axios.js";

const STATUS_CONFIG = {
  CANCEL_REQUESTED: { label: "Yêu cầu huỷ",  color: "bg-orange-100 text-orange-700" },
  RETURN_REQUESTED: { label: "Yêu cầu hoàn", color: "bg-purple-100 text-purple-700" },
};

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

function RejectModal({ order, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-gray-800 mb-3">Lý do từ chối</h3>
        <p className="text-sm text-gray-500 mb-4">
          Đơn hàng <span className="font-semibold">#{order.orderCode}</span> sẽ tiếp tục
          {order.orderStatus === "CANCEL_REQUESTED" ? " được giao." : " ở trạng thái đã giao."}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Nhập lý do từ chối..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                     focus:outline-none focus:border-blue-400 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
          >
            {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CancelRequestsPage() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cancel-requests"],
    queryFn:  () =>
      api.get("/admin/orders?status=CANCEL_REQUESTED,RETURN_REQUESTED")
         .then((r) => r.data.data),
  });

  const handleMutation = useMutation({
    mutationFn: ({ orderId, action, rejectReason }) =>
      api.patch(`/admin/orders/${orderId}/cancel-request`, { action, rejectReason }),
    onSuccess: ({ data }) => {
      toast.success(data.data?.message || "Xử lý thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-cancel-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setRejectTarget(null);
    },
    onError: (err) =>
      toast.error(
        translateApiMessage(err.response?.data?.message) || "Thất bại",
      ),
  });

  const handleApprove = (order) => {
    const label = order.orderStatus === "RETURN_REQUESTED" ? "hoàn hàng" : "huỷ đơn";
    if (!confirm(`Xác nhận đồng ý ${label} cho đơn #${order.orderCode}?`)) return;
    handleMutation.mutate({ orderId: order.orderId, action: "approve" });
  };

  const handleReject = (reason) => {
    if (!rejectTarget) return;
    handleMutation.mutate({
      orderId:      rejectTarget.orderId,
      action:       "reject",
      rejectReason: reason,
    });
  };

  const orders = data?.items || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Yêu cầu huỷ / hoàn hàng
      </h1>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500 font-medium">Không có yêu cầu nào cần xử lý</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.orderStatus];
            return (
              <div key={order.orderId} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">#{order.orderCode}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.user?.fullName} · {order.user?.email}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg?.color}`}>
                    {cfg?.label}
                  </span>
                </div>

                {/* Lý do */}
                {order.cancelledReason && (
                  <div className="bg-orange-50 rounded-xl p-3 mb-3 text-sm text-orange-700">
                    <span className="font-medium">Lý do: </span>
                    {order.cancelledReason}
                  </div>
                )}

                {/* Sản phẩm */}
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.medicineName} <span className="text-gray-400">x{item.quantity}</span></span>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền */}
                <div className="flex justify-between items-center text-sm font-semibold border-t border-gray-100 pt-3 mb-4">
                  <span className="text-gray-500">Tổng cộng</span>
                  <span style={{ color: "#1250dc" }}>{formatPrice(order.totalPrice)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleApprove(order)}
                    disabled={handleMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition"
                  >
                    ✅ Đồng ý {order.orderStatus === "RETURN_REQUESTED" ? "hoàn hàng" : "huỷ đơn"}
                  </button>
                  <button
                    onClick={() => setRejectTarget(order)}
                    disabled={handleMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition"
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          isPending={handleMutation.isPending}
        />
      )}
    </div>
  );
}
