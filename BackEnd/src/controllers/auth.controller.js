import * as authService from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const REFRESH_TOKEN_COOKIE = "refreshToken"; //cookie name

const cookieOptions = {
  httpOnly: true, // JS phía client KHÔNG đọc được → chống XSS lấy token
  secure: process.env.NODE_ENV === "production", // chỉ gửi qua HTTPS ở production
  sameSite: "strict", // chống CSRF — chỉ gửi cookie cùng origin
  maxAge: 7 * 24 * 60 * 60 * 1000, // thời gian sống cookie = 7 ngày (tính bằng ms)
};

export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, user, "User registered successfully", 201);
  } catch (error) {
    sendError(res, error.message, error.status || 500);
  }
};

export const login = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body,
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
