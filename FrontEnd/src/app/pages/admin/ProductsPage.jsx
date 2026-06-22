// ================================================================
// ProductsPage.jsx — Admin quản lý sản phẩm: Add/Edit/Delete
// ================================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";
import productFormModal from "./productFormModal.jsx";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    p,
  );

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  // null = thêm mới, số = đang sửa productId đó
  const [editproductId, setEditproductId] = useState(null);

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
            setEditproductId(null);
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
                        src={m.primaryImage || "/placeholder.png"}
                        alt={m.name}
                        className="w-10 h-10 object-contain rounded-lg border border-gray-100"
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
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditproductId(m.productId);
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

      {showForm && (
        <productFormModal
          productId={editproductId}
          onClose={() => {
            setShowForm(false);
            setEditproductId(null);
          }}
        />
      )}
    </div>
  );
}
