// ================================================================
// ProductsPage.jsx — Admin quản lý sản phẩm: Add/Edit/Delete
// ================================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";
import ProductFormModal from "./ProductFormModal.jsx";
import { adminTableImage } from "../../../lib/imageUrl.js";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  // null = thêm mới, số = đang sửa productId đó
  const [editProductId, setEditProductId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () =>
      api.get(`/admin/products?page=${page}&limit=20`).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Đã xoá sản phẩm");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xoá thất bại"),
  });

  const handleDelete = (id, name) => {
    if (confirm(`Xoá sản phẩm "${name}"?`)) deleteMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            setEditProductId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90"
          style={{ backgroundColor: "#1250dc" }}
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Ảnh",
                "Sản phẩm",
                "Danh mục",
                "Giá",
                "Tồn kho",
                "Trạng thái",
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
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                    </tr>
                  ))
              : data?.items?.map((m) => (
                  <tr key={m.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={adminTableImage(m.primaryImage)}
                        alt={m.name}
                        className="w-15 h-15 object-contain rounded-lg border border-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-700 line-clamp-1 max-w-[200px]">
                        {m.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {m.categoryName || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-700">
                      {formatPrice(m.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          m.stock > 0 ? "text-green-600" : "text-red-500"
                        }
                      >
                        {m.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : m.status === "OUT_OF_STOCK"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {m.status === "ACTIVE"
                          ? "Đang bán"
                          : m.status === "OUT_OF_STOCK"
                          ? "Hết hàng"
                          : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditProductId(m.productId);
                            setShowForm(true);
                          }}
                          className="text-gray-400 hover:text-blue-500 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.productId, m.name)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      {showForm && (
        <ProductFormModal
          productId={editProductId}
          onClose={() => {
            setShowForm(false);
            setEditProductId(null);
          }}
        />
      )}
    </div>
  );
}
