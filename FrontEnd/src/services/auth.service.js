import api from "@/services/axiosInstance.js";

export const login = (credentials) => api.post("/auth/login", credentials);

export const register = (data) => api.post("/auth/register", data);

export const logOut = () => api.post("/auth/logout");

export const completeGoogleSignup = (data) =>
  api.post("/auth/google/complete-signup", data);

export const getProfile = (token) =>
  api.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
