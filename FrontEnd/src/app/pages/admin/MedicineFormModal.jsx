// ================================================================
// MedicineFormModal.jsx — Modal thêm/sửa thuốc, hỗ trợ TỐI ĐA 3 ảnh
// Dùng FormData: field "images" (multiple), "keepImageIds" (JSON string)
// ================================================================
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../lib/axios.js";

const MAX_IMAGES = 3;

export default function MedicineFormModal({ medicineId, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!medicineId;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    unit: "Hộp",
    categoryId: "",
    manufacturerId: "",
    status: "ACTIVE",
    stock: 0,
  });

  // Ảnh ĐÃ CÓ trên server (chỉ xuất hiện khi edit) — { imageId, imageUrl }
  const [existingImages, setExistingImages] = useState([]);
  // Ảnh MỚI chọn để upload — { file, previewUrl }
  const [newImages, setNewImages] = useState([]);

  const totalImageCount = existingImages.length + newImages.length;

  // ── Lấy chi tiết medicine khi edit ──────────────────────────────
  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-medicine-detail", medicineId],
    queryFn: () =>
      api.get(`/admin/medicines/${medicineId}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (detail) {
      setForm({
        name: detail.name || "",
        description: detail.description || "",
        price: detail.price || "",
        unit: detail.unit || "Hộp",
        categoryId: detail.categoryId || "",
        manufacturerId: detail.manufacturerId || "",
        status: detail.status || "ACTIVE",
        stock: detail.stock || 0,
      });
      setExistingImages(detail.images || []);
    }
  }, [detail]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
    // SỬA: AuthInitializer đã prefetch key "categories" với data dạng {items, total}
    // select giúp luôn lấy đúng mảng items dù cache trả về object hay đã là mảng
    select: (data) => (Array.isArray(data) ? data : data?.items || []),
  });
  const { data: manufacturers } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: () => api.get("/manufacturers").then((r) => r.data.data),
    select: (data) => (Array.isArray(data) ? data : data?.items || []),
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (totalImageCount + files.length > MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh / sản phẩm`);
      return;
    }

    const newOnes = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...newOnes]);
    e.target.value = ""; // reset input để chọn lại cùng file nếu cần
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.imageId !== imageId));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: (formData) => {
      if (isEdit) {
        return api.put(`/admin/medicines/${medicineId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.post("/admin/medicines", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Cập nhật thành công" : "Thêm sản phẩm thành công",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-medicines"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Thao tác thất bại"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!form.price) {
      toast.error("Vui lòng nhập giá");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    // Ảnh mới — field "images" (multiple)
    newImages.forEach((img) => formData.append("images", img.file));

    // Khi edit: gửi kèm danh sách imageId muốn giữ lại
    if (isEdit) {
      formData.append(
        "keepImageIds",
        JSON.stringify(existingImages.map((img) => img.imageId)),
      );
    }

    mutation.mutate(formData);
  };

  if (isEdit && isLoadingDetail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 text-sm text-gray-500">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Vitamin C 1000mg..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) *
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="85000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                {["Hộp", "Chai", "Tuýp", "Gói", "Viên", "Ống"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Ngừng bán</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories?.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà sản xuất
              </label>
              <select
                name="manufacturerId"
                value={form.manufacturerId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">-- Chọn nhà sản xuất --</option>
                {manufacturers?.map((m) => (
                  <option key={m.manufacturerId} value={m.manufacturerId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả sản phẩm..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            {/* ── Ảnh sản phẩm — tối đa 3 ảnh ──────────────────────── */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh sản phẩm ({totalImageCount}/{MAX_IMAGES})
              </label>
              <div className="flex flex-wrap items-start gap-3">
                {/* Ảnh đã có trên server (chỉ khi edit) */}
                {existingImages.map((img) => (
                  <div key={img.imageId} className="relative">
                    <img
                      src={img.imageUrl}
                      alt="existing"
                      className="w-24 h-24 object-contain border border-gray-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.imageId)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Ảnh mới vừa chọn (chưa upload) */}
                {newImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.previewUrl}
                      alt="new"
                      className="w-24 h-24 object-contain border-2 border-blue-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Nút thêm ảnh — ẩn khi đã đủ MAX_IMAGES */}
                {totalImageCount < MAX_IMAGES && (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Tải ảnh</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleAddImages}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WEBP · Tối đa 5MB/ảnh · Tối đa {MAX_IMAGES} ảnh
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#1250dc" }}
            >
              {mutation.isPending
                ? "Đang xử lý..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
