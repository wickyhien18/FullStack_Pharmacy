import api from "../services/axiosInstance.js";

export const createOrder = (payload) =>
  api.post("/orders", payload).then((r) => r.data.data);

export const cancelOrder = (orderId, reason) =>
  api.post(`/orders/${orderId}/cancel`, { reason });
