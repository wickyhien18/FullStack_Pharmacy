import api from "@/services/axiosInstance.js";

export const getProfile = (token) =>
  api.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
