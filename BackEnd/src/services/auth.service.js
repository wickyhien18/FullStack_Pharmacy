import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import * as jwt from "../utils/jwt.js";
import * as authRepository from "../repositories/auth.repository.js";

const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Set expiry to 7 days from now
  return expiry;
};

const formatUser = (user) => ({
  userId: user.userId.toString(),
  userName: user.userName,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role ? user.role.roleName : null,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const buildTokenPayload = (user) => ({
  userId: Number(user.userId),
  userName: user.userName,
  role: user.role ? user.role.roleName : "ROLE_CUSTOMER",
});

export const register = async ({
  userName,
  fullName,
  email,
  phone,
  password,
}) => {
  const existingUser = await authRepository.existUser(email, userName, phone);
  if (existingUser) {
    if (existingUser.email === email) {
      throw { status: 400, message: "Email already in use" };
    }
    if (existingUser.userName === userName) {
      throw { status: 400, message: "Username already in use" };
    }
    if (existingUser.phone === phone) {
      throw { status: 400, message: "Phone number already in use" };
    }
  }

  const role = await authRepository.findRoleByName("ROLE_CUSTOMER");
  if (!role) throw { status: 500, message: "Role not found" };

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await authRepository.createUser({
    userName,
    fullName,
    email,
    phone,
    password: hashedPassword,
    roleId: role.roleId,
  });

  const payload = buildTokenPayload(user);
  const accessToken = jwt.generateAccessTokens(payload);
  const refreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  await authRepository.saveRefreshToken(user.userId, refreshToken, expireAt);
  await authRepository.updateLastActivity(user.userId);
  return { accessToken, refreshToken, user: formatUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw { status: 401, message: "Invalid email or password" };
  if (!user.isActive) throw { status: 403, message: "Account is inactive" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid email or password" };

  const payload = buildTokenPayload(user);
  const accessToken = jwt.generateAccessTokens(payload);
  const refreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  await authRepository.saveRefreshToken(user.userId, refreshToken, expireAt);
  await authRepository.updateLastActivity(user.userId);
  return { accessToken, refreshToken, user: formatUser(user) };
};

export const refreshToken = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "Refresh token is required" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 401, message: "Invalid refresh token" };

  if (tokenData.expireAt && tokenData.expireAt < new Date()) {
    await authRepository.deleteRefreshToken(refreshToken);
    throw {
      status: 401,
      message: "Refresh token has expired. Please log in again.",
    };
  }

  if (!tokenData.user.isActive)
    throw { status: 403, message: "Account is inactive" };

  const payload = buildTokenPayload(tokenData.user);
  const accessToken = jwt.generateAccessTokens(payload);
  await authRepository.deleteRefreshToken(refreshToken);
  const newRefreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  await authRepository.saveRefreshToken(
    tokenData.user.userId,
    newRefreshToken,
    expireAt,
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: formatUser(tokenData.user),
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "Refresh token is required" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 401, message: "Invalid refresh token" };

  await authRepository.deleteRefreshToken(refreshToken);
};

export const logoutAll = async (userId) => {
  await authRepository.deleteRefreshTokensByUserId(userId);
};

export const getProfile = async (userId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (!user.isActive) throw { status: 403, message: "Account is inactive" };

  return formatUser(user);
};
