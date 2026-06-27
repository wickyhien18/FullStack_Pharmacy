// ================================================================
// useCart.js — Hook quản lý cart qua API
// Thay thế useCartStore trực tiếp
// ================================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import api from "@/lib/axios.js";
import toast from "react-hot-toast";

export const useCart = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch cart từ API — chỉ khi đã đăng nhập
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/cart").then((r) => r.data.data),
    enabled: isAuthenticated, // không fetch khi chưa login
    staleTime: 0,
  });

  // Invalidate cart cache sau mỗi mutation
  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: ["cart"] });

  // Thêm vào cart
  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      api.post("/cart/items", { productId, quantity }),
    onSuccess: () => {
      invalidateCart();
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Thêm vào giỏ thất bại"),
  });

  // Cập nhật số lượng
  const updateMutation = useMutation({
    mutationFn: ({ cartItemId, quantity }) =>
      api.patch(`/cart/items/${cartItemId}`, { quantity }),
    onSuccess: invalidateCart,
    onError: (err) =>
      toast.error(err.response?.data?.message || "Cập nhật thất bại"),
  });

  // Xoá item
  const removeMutation = useMutation({
    mutationFn: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
    onSuccess: () => {
      invalidateCart();
      toast.success("Đã xoá khỏi giỏ hàng");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xoá thất bại"),
  });

  return {
    cart,
    isLoading,
    items: cart?.items || [],
    totalItems: cart?.totalItems || 0,
    totalPrice: cart?.totalPrice || 0,

    addToCart: (productId, quantity = 1) =>
      addMutation.mutate({ productId: productId.toString(), quantity }),
    updateItem: (cartItemId, quantity) =>
      updateMutation.mutate({ cartItemId, quantity }),
    removeItem: (cartItemId) => removeMutation.mutate(cartItemId),

    clearCart: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
