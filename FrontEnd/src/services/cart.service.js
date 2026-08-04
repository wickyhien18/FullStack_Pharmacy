import api from "../services/axiosInstance.js";

export const getCart = () => api.get("/cart").then((r) => r.data.data);

export const addToCart = (productId, quantity) =>
  api.post("/cart/items", { productId, quantity });

export const updateCart = (cartItemId, quantity) =>
  api.patch(`/cart/items/${cartItemId}`, { quantity });

export const removeItemInCart = (cartItemId) =>
  api.delete(`/cart/items/${cartItemId}`);
