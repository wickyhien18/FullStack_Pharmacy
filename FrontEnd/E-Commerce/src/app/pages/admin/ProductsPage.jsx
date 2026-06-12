import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-medicines", page],
    queryFn: () =>
      api
        .get("/admin/medicines", { params: { page, limit: 15 } })
        .then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (medicineId) => api.delete(`/admin/medicines/${medicineId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      toast.success("Xoá sản phẩm thành công");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xoá sản phẩm thất bại");
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const handleDelete = (medicineId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá sản phẩm "${name}"?`)) {
      deleteMutation.mutate(medicineId);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý sản phẩm (Thuốc)
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Mã SP",
                "Tên sản phẩm",
                "Danh mục",
                "Giá bán",
                "Tồn kho",
                "Trạng thái",
                "Thao tác",
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
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : data?.items?.map((med) => (
                  <tr key={med.medicineId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {med.medicineId}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {med.name}
                    </td>
                    <td className="px-6 py-4 text-gray-650">
                      {med.categoryName || "Chưa phân loại"}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-700">
                      {formatPrice(med.price)}
                    </td>
                    <td className="px-6 py-4 text-gray-605">
                      {med.stock} Hộp
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                        ${med.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {med.status === "ACTIVE" ? "Đang bán" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(med.medicineId, med.name)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                        title="Xoá sản phẩm"
                      >
                        <Trash2 size={18} />
                      </button>
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
