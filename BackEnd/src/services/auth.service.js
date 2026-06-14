import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import * as jwt from "../utils/jwt.js";
import { getDeviceInfo } from "../utils/device.js";
import * as authRepository from "../repositories/auth.repository.js";

// ── GET REFRESHTOKEN EXPIRY ────────────────────────────────────────────────
const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Set expiry to 7 days from now
  return expiry;
};

//── FORMAT USER ────────────────────────────────────────────────
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

// ── BUILD TOKEN PAYLOAD ────────────────────────────────────────────────
const buildTokenPayload = (user) => ({
  userId: Number(user.userId),
  userName: user.userName,
  role: user.role ? user.role.roleName : "ROLE_CUSTOMER",
});

// ── GET MY DEVICES ────────────────────────────────────────────────
export const getMyDevices = async (userId) => {
  const tokens = await authRepository.findAllTokensByUser(BigInt(userId));
  return tokens.map((t) => ({
    id: t.id.toString(),
    deviceInfo: t.deviceInfo,
    createdAt: t.createdAt,
    expireAt: t.expireAt,
  }));
};

// ── REGISTER ──────────────────────────────────────────────────────
export const register = async ({
  userName,
  fullName,
  email,
  phone,
  password,
}) => {
  const existingUser = await authRepository.existUser(email, userName, phone);
  if (existingUser) {
    //409 - Conflict data in database
    if (existingUser.email === email) {
      throw { status: 409, message: "Email đã được sử dụng" };
    }
    if (existingUser.userName === userName) {
      throw { status: 409, message: "Tên đăng nhập đã được sử dụng" };
    }
    if (existingUser.phone === phone) {
      throw { status: 409, message: "Số điện thoại đã được sử dụng" };
    }
  }

  const role = await authRepository.findRoleByName("ROLE_CUSTOMER");
  if (!role) throw { status: 500, message: "Không tìm thấy role mặc định" };

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await authRepository.createUser({
    userName,
    fullName,
    email,
    phone,
    password: hashedPassword,
    roleId: role.roleId,
  });

  return { user: formatUser(user) };
};

// ── LOGIN ─────────────────────────────────────────────────────────
export const login = async ({ email, password }, userAgent) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  if (!user.isActive) throw { status: 403, message: "Tài khoản đang bị khóa" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };

  const deviceInfo = getDeviceInfo(userAgent);
  const payload = buildTokenPayload(user);
  const accessToken = jwt.generateAccessTokens(payload);
  const refreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  // Tìm xem device này đã có token chưa (đã login trước, chưa logout)
  const existingToken = await authRepository.findTokenByDevice(
    user.userId,
    deviceInfo,
  );

  if (existingToken) {
    // Device đã login, chưa logout
    // → cập nhật nội dung token + gia hạn thời gian, GIỮ NGUYÊN id
    await authRepository.updateRefreshTokenById(
      existingToken.id,
      refreshToken,
      expireAt,
    );
  } else {
    // Device mới hoàn toàn → tạo record mới
    await authRepository.saveRefreshToken(
      user.userId,
      refreshToken,
      expireAt,
      deviceInfo,
    );
  }
  await authRepository.updateLastActivity(user.userId);
  return { accessToken, refreshToken, user: formatUser(user) };
};

export const refreshToken = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "Refresh token không tồn tại" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 401, message: "Refresh token không hợp lệ" };

  if (tokenData.expireAt && tokenData.expireAt < new Date()) {
    await authRepository.deleteRefreshToken(refreshToken);
    throw {
      status: 401,
      message: "Refresh token đã hết hạn, vui lòng đăng nhập lại",
    };
  }

  if (!tokenData.user.isActive)
    throw { status: 403, message: "Tài khoản đang bị khóa" };

  const newToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  // Rotate: cập nhật nội dung token + gia hạn thêm 7 ngày
  // Giữ nguyên id + deviceInfo — chỉ đổi token string + expireAt
  await authRepository.updateRefreshTokenById(tokenData.id, newToken, expireAt);

  const accessToken = jwt.generateAccessTokens(
    buildTokenPayload(tokenData.user),
  );

  return {
    accessToken,
    refreshToken: newToken,
    user: formatUser(tokenData.user),
  };
};

// ── LOGOUT ────────────────────────────────────────────────────────
export const logout = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 400, message: "Refresh token không tồn tại" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 400, message: "Refresh token không hợp lệ" };

  await authRepository.deleteRefreshToken(refreshToken);
};

// ── LOGOUT ALL DEVICES ────────────────────────────────────────────
export const logoutAll = async (userId) => {
  await authRepository.deleteRefreshTokensByUserId(userId);
};

// ── GET PROFILE ───────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  if (!user.isActive) throw { status: 403, message: "Tài khoản đang bị khóa" };

  return formatUser(user);
};
