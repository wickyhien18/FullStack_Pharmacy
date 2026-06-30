// ================================================================
// cart.repository.js
// ================================================================
import { prisma } from "../config/prisma.js";

// Lấy cart của user — mỗi user chỉ có 1 cart
export const findCartByUserId = async (userId) => {
  const rows = await prisma.$queryRaw`
    SELECT c.cart_id as "cartId",
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
        'cartItemId',   ci.cart_item_id,
        'productId',    ci.product_id,
        'itemQuantity', ci.quantity,
        'productName',  p.name,
        'productSlug',  p.slug ,
        'productPrice', p.price,
        'productUnit',  p.unit,
        'productImage', p.image ,
        'inventoryQuantity', i.quantity
        ) ORDER BY ci.cart_item_id ASC
      ) FILTER (WHERE ci.cart_item_id IS NOT NULL), '[]'
    ) as items
    FROM carts c
    LEFT JOIN cart_items ci on c.cart_id = ci.cart_id
    LEFT JOIN products p on p.product_id = ci.product_id
    LEFT JOIN inventory i on i.product_id = p.product_id
    WHERE c.user_id = ${userId}
    GROUP BY c.cart_id
  `;

  return rows[0];
};

// Tìm cart item theo cartId + productId
export const findCartItem = (cartId, productId) => {
  return prisma.cartItem.findUnique({
    where: { uk_cart_medicine: { cartId, productId } },
    select: { quantity: true },
  });
};

// cart.repository.js — thêm hàm upsert
export const upsertCartItem = (cartId, productId, quantity) => {
  return prisma.cartItem.upsert({
    where: { uk_cart_medicine: { cartId, productId } },
    update: { quantity },
    create: { cartId, productId, quantity },
  });
};

export const existProduct = async (productId) => {
  const rows = await prisma.$queryRaw`
    SELECT
    p.deleted_at as "deletedAt",
    i.quantity
    FROM products p 
    JOIN inventory i on p.product_id = i.product_id
    WHERE p.product_id = ${productId}
  `;
  return rows[0];
};

// Xoá 1 item khỏi cart
export const deleteCartItem = (cartItemId) => {
  return prisma.cartItem.delete({ where: { cartItemId } });
};

// Xoá toàn bộ items sau khi đặt hàng thành công
export const clearCart = (cartId) => {
  return prisma.cartItem.deleteMany({ where: { cartId } });
};
