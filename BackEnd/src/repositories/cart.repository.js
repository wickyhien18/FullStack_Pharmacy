// ================================================================
// cart.repository.js
// ================================================================
import { prisma } from "../config/prisma.js";

// Lấy cart của user — mỗi user chỉ có 1 cart
export const findCartByUserId = (userId) => {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { inventory: { select: { quantity: true } } },
          },
        },
        orderBy: { cartItemId: "asc" },
      },
    },
  });
};

// Tìm cart item theo cartId + productId
export const findCartItem = (cartId, productId) => {
  return prisma.cartItem.findUnique({
    where: { uk_cart_product: { cartId, productId } },
  });
};

// Thêm item vào cart
export const createCartItem = (cartId, productId, quantity) => {
  return prisma.cartItem.create({
    data: { cartId, productId, quantity },
  });
};

// Cập nhật số lượng item
export const updateCartItem = (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { cartItemId },
    data: { quantity },
  });
};

// Xoá 1 item khỏi cart
export const deleteCartItem = (cartItemId) => {
  return prisma.cartItem.delete({ where: { cartItemId } });
};

// Xoá toàn bộ items sau khi đặt hàng thành công
export const clearCart = (cartId) => {
  return prisma.cartItem.deleteMany({ where: { cartId } });
};
