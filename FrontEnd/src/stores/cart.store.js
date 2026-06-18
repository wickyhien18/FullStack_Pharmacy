// ================================================================
// cart.store.js — Đơn giản hoá, chỉ dùng cho UI badge header
// Actual cart data đến từ useCart hook (API)
// ================================================================
import { create } from "zustand";

export const useCartStore = create(() => ({
  // Không còn items, totalPrice ở đây nữa
  // Tất cả đến từ useCart() hook
}));
