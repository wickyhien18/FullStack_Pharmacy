import * as cartService from "../services/cart.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const data = await cartService.getCart(req.user.userId);
    return sendSuccess(res, data, "Cart retrieved successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/cart/items
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return sendError(res, "productId is required", 400);
    const data = await cartService.addToCart(
      req.user.userId,
      productId,
      quantity,
    );
    return sendSuccess(res, data, "Item added to cart successfully", 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/cart/items/:cartItemId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined)
      return sendError(res, "quantity is required", 400);
    const data = await cartService.updateCartItem(
      req.user.userId,
      req.params.cartItemId,
      quantity,
    );
    return sendSuccess(res, data, "Cart updated successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// DELETE /api/cart/items/:cartItemId
export const removeFromCart = async (req, res) => {
  try {
    const data = await cartService.removeFromCart(
      req.user.userId,
      req.params.cartItemId,
    );
    return sendSuccess(res, data, "Item removed from cart successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
