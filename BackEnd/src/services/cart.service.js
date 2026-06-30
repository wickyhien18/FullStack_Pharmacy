// ================================================================
// cart.service.js
// ================================================================
import * as cartRepo from "../repositories/cart.repository.js";

const formatCart = (cart) => ({
  cartId: cart.cartId.toString(),
  items: cart.items.map((item) => ({
    cartItemId: item.cartItemId.toString(),
    productId: item.productId.toString(),
    name: item.product.name || item.productName,
    slug: item.product.slug || item.productSlug,
    price: Number(item.product.price) || Number(item.productPrice),
    unit: item.product.unit || item.productUnit,
    image: item.product.image || item.productImage || null,
    stock: item.product.inventory?.quantity || item.inventoryQuantity || 0,
    quantity: item.quantity || item.itemQuantity,
    totalPrice:
      Number(item.product.price || item.productPrice) *
      (item.quantity || item.itemQuantity),
  })),
  totalItems: cart.items.reduce(
    (sum, i) => sum + (i.quantity || i.itemQuantity),
    0,
  ),
  totalPrice: cart.items.reduce(
    (sum, i) =>
      sum +
      Number(i.product.price || item.productPrice) *
        (i.quantity || i.itemQuantity),
    0,
  ),
});

// Lấy cart của user
export const getCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };
  return formatCart(cart);
};

// Thêm hoặc cập nhật item trong cart
export const addToCart = async (userId, productId, quantity = 1) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  const bigProductId = BigInt(productId);

  // Kiểm tra tồn kho
  const product = cart.items.find((i) => BigInt(i.productId) === bigProductId);

  // Nếu chưa có trong cart items thì cần query thêm
  const { prisma } = await import("../config/prisma.js");
  const med = await prisma.product.findUnique({
    where: { productId: bigProductId },
    include: { inventory: true },
  });

  if (!med || med.deletedAt)
    throw { status: 404, message: "Sản phẩm không tồn tại" };

  const stock = med.inventory?.quantity ?? 0;

  // Kiểm tra item đã có trong cart chưa
  const existingItem = await cartRepo.findCartItem(cart.cartId, bigProductId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > stock) {
      throw { status: 400, message: `Chỉ còn ${stock} sản phẩm trong kho` };
    }
    await cartRepo.updateCartItem(existingItem.cartItemId, newQuantity);
  } else {
    if (quantity > stock) {
      throw { status: 400, message: `Chỉ còn ${stock} sản phẩm trong kho` };
    }
    await cartRepo.createCartItem(cart.cartId, bigProductId, quantity);
  }

  // Trả về cart mới nhất
  return getCart(userId);
};

// Cập nhật số lượng item
export const updateCartItem = async (userId, cartItemId, quantity) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  // Kiểm tra item có thuộc cart của user không — tránh user sửa cart người khác
  const item = cart.items.find((i) => i.cartItemId === BigInt(cartItemId));
  if (!item)
    throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };

  if (quantity <= 0) {
    await cartRepo.deleteCartItem(BigInt(cartItemId));
  } else {
    const stock = item.product.inventory?.quantity ?? 0;
    if (quantity > stock) {
      throw { status: 400, message: `Chỉ còn ${stock} sản phẩm trong kho` };
    }
    await cartRepo.updateCartItem(BigInt(cartItemId), quantity);
  }

  return getCart(userId);
};

// Xoá 1 item khỏi cart
export const removeFromCart = async (userId, cartItemId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  const item = cart.items.find((i) => i.cartItemId === BigInt(cartItemId));
  if (!item)
    throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };

  await cartRepo.deleteCartItem(BigInt(cartItemId));
  return getCart(userId);
};
