import api from "../services/axiosInstance.js";

export const createVnpay = (orderId) =>
  api.post("/payment/vnpay/create", { orderId }).then((r) => r.data.data);

export const createCOD = (orderId) =>
  api.post("/payment/cod", { orderId }).then((r) => r.data.data);
