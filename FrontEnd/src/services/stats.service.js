import api from "../services/axiosInstance.js";

export const getGeneralStats = () =>
  api.get("/admin/stats").then((r) => r.data.data);
