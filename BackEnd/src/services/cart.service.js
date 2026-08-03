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

//── GET USER CART ────────────────────────────────────────────────
export const getCart = async (userId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Cart not found" };
  return formatCartForRaw(cart);
};

//── ADD OR UPDATE CART ITEM ──────────────────────────────────────
export const addToCart = async (userId, productId, quantity = 1) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Cart not found" };

  const bigProductId = BigInt(productId);

  const med = await cartRepo.existProduct(bigProductId);

  if (!med || med.deletedAt)
    throw { status: 404, message: "Product does not exist" };

  const stock = med.quantity ?? 0;

  /// Get current quantity in cart, if any, to calculate the new total.
  const existingItem = await cartRepo.findCartItem(cart.cartId, bigProductId);
  const currentQty = existingItem?.quantity ?? 0;
  const newQuantity = currentQty + quantity;

  if (newQuantity > stock) {
    throw { status: 400, message: `Only ${stock} products left in stock` };
  }

  // Upsert only after stock validation has passed.
  await cartRepo.upsertCartItem(cart.cartId, bigProductId, newQuantity);

  return getCart(userId);
};

//── UPDATE CART ITEM QUANTITY ────────────────────────────────────
export const updateCartItem = async (userId, cartItemId, quantity) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Cart not found" };

  // Verify the item belongs to this user's cart.
  const item = cart.items.find(
    (i) => BigInt(i.cartItemId) === BigInt(cartItemId),
  );
  if (!item) throw { status: 404, message: "Product not found in cart" };

  if (quantity <= 0) {
    await cartRepo.deleteCartItem(BigInt(cartItemId));
  } else {
    const stock = item.inventoryQuantity ?? 0;
    if (quantity > stock) {
      throw { status: 400, message: `Only ${stock} products left in stock` };
    }
    await cartRepo.upsertCartItem(cart.cartId, item.productId, quantity);
  }

  return getCart(userId);
};

//── REMOVE CART ITEM ─────────────────────────────────────────────
export const removeFromCart = async (userId, cartItemId) => {
  const cart = await cartRepo.findCartByUserId(BigInt(userId));
  if (!cart) throw { status: 404, message: "Cart not found" };

  const item = cart.items.find(
    (i) => BigInt(i.cartItemId) === BigInt(cartItemId),
  );
  if (!item) throw { status: 404, message: "Product not found in cart" };

  await cartRepo.deleteCartItem(BigInt(cartItemId));
  return getCart(userId);
};
