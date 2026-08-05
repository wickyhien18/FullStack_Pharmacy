import api from "@/services/axiosInstance.js";

export const login = (credentials) => api.post("/auth/login", credentials);

export const register = (data) => api.post("/auth/register", data);

export const logOut = () => api.post("/auth/logout");

export const requestEmailChange = (newEmail) =>
  api.post("/auth/request-email-change", { newEmail });

export const verifyEmailChange = (otp) =>
  api.post("/auth/verify-email-change", { otp });

export const changePassword = (currentPassword, newPassword) =>
  api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });

export const requestForgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (email, otp, newPassword) =>
  api.post("/auth/reset-password", { email, otp, newPassword });

export const completeGoogleSignup = (data) =>
  api.post("/auth/google/complete-signup", data);

export const getProfile = (token) =>
  api.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (data) => api.put("/auth/profile", data);
