import api from "../services/axiosInstance.js";

export const getRoles = () => api.get("/admin/roles").then((r) => r.data.data);

export const getUser = () => api.get("/admin/users").then((r) => r.data.data);

export const updateUserRole = (userId, roleName) =>
  api.patch(`/admin/users/${userId}/role`, { roleName });

export const changeUserStatus = (userId, isActive) =>
  api.patch(`/admin/users/${userId}/status`, { isActive });
