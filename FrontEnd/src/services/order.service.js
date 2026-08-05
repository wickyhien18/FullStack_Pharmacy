import api from "../services/axiosInstance.js";

export const getOrder = (page, filterStatus) =>
  api
    .get(
      `/admin/orders?page=${page}&limit=20${filterStatus ? `&status=${filterStatus}` : ""}`,
    )
    .then((r) => r.data.data);

export const createOrder = (payload) =>
  api.post("/orders", payload).then((r) => r.data.data);

export const updateOrderStatus = (orderId, orderStatus) =>
  api.patch(`/admin/orders/${orderId}/status`, { orderStatus });

export const getCancelOrder = () =>
  api
    .get("/admin/orders?status=CANCEL_REQUESTED,RETURN_REQUESTED")
    .then((r) => r.data.data);

export const handleCancelOrder = (orderId, action, rejectReason) =>
  api.patch(`/admin/orders/${orderId}/cancel-request`, {
    action,
    rejectReason,
  });

export const cancelOrder = (orderId, reason) =>
  api.post(`/orders/${orderId}/cancel`, { reason });

export const getMyOrder = () => api.get("/orders/my").then((r) => r.data.data);
