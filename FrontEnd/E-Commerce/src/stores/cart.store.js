// ================================================================
// cart.store.js — Zustand store quản lý giỏ hàng
// Giỏ hàng lưu trong memory — sau này kết nối API
// ================================================================
import { create } from "zustand";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  // items = [{ medicine, quantity }]
  items: [],

  // Tổng số lượng sản phẩm trong giỏ (dùng cho badge header)
  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Tổng tiền
  get totalPrice() {
    return get().items.reduce(
      (sum, item) => sum + Number(item.medicine.price) * item.quantity,
      0,
    );
  },

  // Thêm sản phẩm vào giỏ
  // Nếu đã có → tăng số lượng, chưa có → thêm mới
  addItem: (medicine, quantity = 1) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.medicine.medicineId === medicine.medicineId,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.medicine.medicineId === medicine.medicineId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, { medicine, quantity }] };
    });
    toast.success("Đã thêm vào giỏ hàng");
  },

  // Cập nhật số lượng — nếu quantity = 0 thì xoá luôn
  updateQuantity: (medicineId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(medicineId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.medicine.medicineId === medicineId ? { ...i, quantity } : i,
      ),
    }));
  },

  // Xoá 1 sản phẩm khỏi giỏ
  removeItem: (medicineId) => {
    set((state) => ({
      items: state.items.filter((i) => i.medicine.medicineId !== medicineId),
    }));
    toast.success("Đã xoá khỏi giỏ hàng");
  },

  // Xoá toàn bộ giỏ hàng (sau khi đặt hàng thành công)
  clearCart: () => set({ items: [] }),
}));
