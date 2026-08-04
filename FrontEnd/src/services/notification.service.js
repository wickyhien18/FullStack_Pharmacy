import api from "../services/axiosInstance.js";

export const getNotification = () =>
  api.get("/notifications").then((r) => r.data.data);

export const markAllRead = () => api.patch("/notifications/mark-all-read");
