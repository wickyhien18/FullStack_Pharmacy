import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { translateApiMessage } from "../../lib/errorMessages.js";

const CANCEL_MESSAGE = {
  PENDING: "Đơn hàng sẽ được huỷ ngay lập tức.",
  CONFIRMED: "Đơn hàng sẽ được huỷ ngay lập tức.",
  SHIPPING: "Đơn hàng đang giao. Yêu cầu huỷ sẽ gửi đến nhà thuốc để xử lý.",
  DELIVERED: "Đơn hàng đã giao. Yêu cầu hoàn hàng sẽ gửi đến nhà thuốc.",
};

const CANCEL_LABEL = {
  PENDING: "Huỷ đơn hàng",
  CONFIRMED: "Huỷ đơn hàng",
  SHIPPING: "Yêu cầu huỷ",
  DELIVERED: "Yêu cầu hoàn hàng",
};

export default function CancelOrderModal({ order, onClose }) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/orders/${order.orderId}/cancel`, { reason }),
    onSuccess: ({ data }) => {
      toast.success(data.data?.message || "Thành công");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      onClose();
    },
    onError: (err) =>
      toast.error(
        translateApiMessage(err.response?.data?.message) || "Thất bại",
      ),
  });

  const label = CANCEL_LABEL[order.orderStatus] || "Huỷ đơn";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-2">{label}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {CANCEL_MESSAGE[order.orderStatus]}
        </p>

        {/* Thông tin đơn */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
          <p className="font-semibold text-gray-700">#{order.orderCode}</p>
          <p className="text-gray-500">{order.items?.length} sản phẩm</p>
        </div>

        {/* Lý do */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Lý do (không bắt buộc)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              cancelMutation.mutate();
            }}
            disabled={cancelMutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold
                       hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#e53935" }}
          >
            {cancelMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}
