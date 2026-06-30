// ================================================================
// cart.service.js
// ================================================================
import * as cartRepo from "../repositories/cart.repository.js";

const formatCartForRaw = (cart) => ({
  cartId: cart.cartId.toString(),
  items: cart.items.map((item) => ({
    cartItemId: item.cartItemId.toString(),
    productId: item.productId.toString(),
    name: item.productName,
    slug: item.productSlug,
    price: Number(item.productPrice),
    unit: item.productUnit,
    image: item.productImage || null,
    stock: item.inventoryQuantity ?? 0,
    quantity: item.itemQuantity,
    totalPrice: Number(item.productPrice) * item.itemQuantity,
  })),
  totalItems: cart.items.reduce((sum, i) => sum + i.itemQuantity, 0),
  totalPrice: cart.items.reduce(
    (sum, i) => sum + Number(i.productPrice) * i.itemQuantity,
    0,
  ),
});

// Lấy cart của user
export const getCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };
  return formatCartForRaw(cart);
};

// Thêm hoặc cập nhật item trong cart
export const addToCart = async (userId, productId, quantity = 1) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  const bigProductId = BigInt(productId);

  const med = await cartRepo.existProduct(bigProductId);

  if (!med || med.deletedAt)
    throw { status: 404, message: "Sản phẩm không tồn tại" };

  const stock = med.quantity ?? 0;

  /// Lấy số lượng hiện tại trong cart (nếu có) để tính tổng
  const existingItem = await cartRepo.findCartItem(cart.cartId, bigProductId);
  const currentQty = existingItem?.quantity ?? 0;
  const newQuantity = currentQty + quantity;

  if (newQuantity > stock) {
    throw { status: 400, message: `Chỉ còn ${stock} sản phẩm trong kho` };
  }

  // Giờ mới upsert — chắc chắn an toàn vì đã check trước
  await cartRepo.upsertCartItem(cart.cartId, bigProductId, newQuantity);

  return getCart(userId);
};

// Cập nhật số lượng item
export const updateCartItem = async (userId, cartItemId, quantity) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  // Kiểm tra item có thuộc cart của user không — tránh user sửa cart người khác
  const item = cart.items.find(
    (i) => BigInt(i.cartItemId) === BigInt(cartItemId),
  );
  if (!item)
    throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };

  if (quantity <= 0) {
    await cartRepo.deleteCartItem(BigInt(cartItemId));
  } else {
    const stock = item.inventoryQuantity ?? 0;
    if (quantity > stock) {
      throw { status: 400, message: `Chỉ còn ${stock} sản phẩm trong kho` };
    }
    await cartRepo.upsertCartItem(cart.cartId, item.productId, quantity);
  }

  return getCart(userId);
};

// Xoá 1 item khỏi cart
export const removeFromCart = async (userId, cartItemId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Không tìm thấy giỏ hàng" };

  const item = cart.items.find(
    (i) => BigInt(i.cartItemId) === BigInt(cartItemId),
  );
  if (!item)
    throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };

  await cartRepo.deleteCartItem(BigInt(cartItemId));
  return getCart(userId);
};
