import api from "../services/axiosInstance.js";

export const cancelOrder = (orderId, reason) =>
  api.post(`/orders/${orderId}/cancel`, { reason });
