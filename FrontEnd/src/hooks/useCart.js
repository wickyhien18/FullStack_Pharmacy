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
    // Chạy TRƯỚC khi gọi API — cập nhật UI ngay
    onMutate: async ({ productId, quantity }) => {
      // Huỷ bất kỳ refetch nào đang chạy để tránh overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Lưu lại state cũ để rollback nếu cần
      const previousCart = queryClient.getQueryData(["cart"]);

      // Cập nhật cache ngay lập tức
      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;

        const existingItem = old.items?.find(
          (item) => item.productId?.toString() === productId?.toString(),
        );

        let newItems;
        if (existingItem) {
          // Tăng quantity nếu đã có trong giỏ
          newItems = old.items.map((item) =>
            item.productId?.toString() === productId?.toString()
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        } else {
          // Thêm item mới (tạm thời, chưa có cartItemId thật)
          newItems = [
            ...(old.items || []),
            {
              cartItemId: `temp-${Date.now()}`,
              productId,
              quantity,
              name: "Đang tải...",
              price: 0,
              image: null,
            },
          ];
        }

        return {
          ...old,
          items: newItems,
          totalItems: (old.totalItems || 0) + quantity,
        };
      });

      return { previousCart }; // trả về context để dùng trong onError
    },

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
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        const newItems = old.items.map((item) =>
          item.cartItemId?.toString() === cartItemId?.toString()
            ? { ...item, quantity }
            : item,
        );
        const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = newItems.reduce(
          (sum, i) => sum + (i.price || 0) * i.quantity,
          0,
        );
        return { ...old, items: newItems, totalItems, totalPrice };
      });

      return { previousCart };
    },

    onSuccess: invalidateCart,
    onError: (err) =>
      toast.error(err.response?.data?.message || "Cập nhật thất bại"),
  });

  // Xoá item
  const removeMutation = useMutation({
    mutationFn: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        const newItems = old.items.filter(
          (item) => item.cartItemId?.toString() !== cartItemId?.toString(),
        );
        const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = newItems.reduce(
          (sum, i) => sum + (i.price || 0) * i.quantity,
          0,
        );
        return { ...old, items: newItems, totalItems, totalPrice };
      });

      return { previousCart };
    },

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

    clearCart: () => invalidateCart(),

    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
