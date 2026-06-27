import * as authService from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const REFRESH_TOKEN_COOKIE = "refreshToken"; //cookie name

const cookieOptions = {
  httpOnly: true, // JS phía client KHÔNG đọc được → chống XSS lấy token
  secure: process.env.NODE_ENV === "production", // chỉ gửi qua HTTPS ở production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // chống CSRF — chỉ gửi cookie cùng origin
  maxAge: 7 * 24 * 60 * 60 * 1000, // thời gian sống cookie = 7 ngày (tính bằng ms)
};

export const register = async (req, res) => {
  try {
    //201 - Created
    const user = await authService.register(req.body);
    return sendSuccess(res, user, "User registered successfully", 201);
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const login = async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"];
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await authService.login(
      { email, password },
      userAgent,
    );
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
    return sendSuccess(res, { accessToken, user }, "Login successful");
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;
    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await authService.refreshToken(token);
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, cookieOptions);
    return sendSuccess(
      res,
      { accessToken, user },
      "Token refreshed successfully",
    );
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;
    await authService.logout(token);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const logoutAll = async (req, res) => {
  try {
    await authService.logoutAll(req.user.userId);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return sendSuccess(res, null, "Logged out from all devices successfully");
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    return sendSuccess(res, user, "Profile retrieved successfully");
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    if (!fullName && !phone)
      return sendError(res, "Vui lòng nhập thông tin cần cập nhật", 400);
    const data = await authService.updateProfile(req.user.userId, {
      fullName,
      phone,
    });
    return sendSuccess(res, data, "Cập nhật thông tin thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const data = await authService.changePassword(req.user.userId, req.body);
    res.clearCookie("refreshToken");
    return sendSuccess(res, data, data.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/auth/request-email-change
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const data = await authService.requestEmailChange(
      req.user.userId,
      newEmail,
    );
    return sendSuccess(res, data, data.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/auth/verify-email-change
export const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const data = await authService.verifyEmailChange(req.user.userId, otp);
    return sendSuccess(res, data, data.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/auth/forgot-password (không cần authenticate)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    return sendSuccess(res, data, data.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/auth/reset-password (không cần authenticate)
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const data = await authService.resetPassword(email, otp, newPassword);
    return sendSuccess(res, data, data.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
