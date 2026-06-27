import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import * as jwt from "../utils/jwt.js";
import { getDeviceInfo } from "../utils/device.js";
import * as authRepository from "../repositories/auth.repository.js";
import {
  sendOTPEmail,
  sendResetPasswordEmail,
} from "../services/email.service.js";

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
  role: user.role?.roleName || "ROLE_CUSTOMER",
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

  // Dùng transaction để đảm bảo user và cart tạo cùng lúc
  // Nếu 1 trong 2 fail → rollback cả 2
  const { prisma } = await import("../config/prisma.js");

  const user = await prisma.$transaction(
    async (tx) => {
      const newUser = await tx.user.create({
        data: {
          userName,
          fullName,
          email,
          phone,
          password: hashedPassword,
          roleId: role.roleId,
        },
        include: { role: true },
      });

      // Tạo cart ngay sau khi tạo user
      await tx.cart.create({
        data: { userId: newUser.userId },
      });

      return newUser;
    },
    {
      timeout: 30000, // tăng lên 30 giây
      maxWait: 10000, // chờ tối đa 10 giây để lấy connection
    },
  );

  return { user: formatUser(user) };
};

// ── LOGIN ─────────────────────────────────────────────────────────
export const login = async ({ email, password }, userAgent) => {
  const user = await authRepository.findUserByEmail(email);

  //401 - Unauthorized - incorrect email or password in database => NOT sure you have account?
  if (!user) throw { status: 401, message: "Email hoặc mật khẩu không đúng" };

  if (!user.isActive) throw { status: 403, message: "Tài khoản đang bị khóa" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };

  const deviceInfo = getDeviceInfo(userAgent);
  const accessToken = jwt.generateAccessTokens(buildTokenPayload(user));
  const refreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  const existingToken = await authRepository.findTokenByDevice(
    user.userId,
    deviceInfo,
  );

  if (existingToken) {
    await authRepository.updateRefreshTokenById(
      existingToken.id,
      refreshToken,
      expireAt,
    );
  } else {
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
  //401 - Unauthorized - can't find token or token is expired => can't know you are?
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
  //400 - Bad request - can't find token or invalid token => can't do next action
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

// ── UPDATE PROFILE (FULLNAME OR PHONE) ───────────────────────────
export const updateProfile = async (userId, { fullName, phone }) => {
  if (phone) {
    const existing = await authRepository.findUserByPhone(phone, userId);
    if (existing)
      throw { status: 409, message: "Số điện thoại đã được sử dụng" };
  }

  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (phone) updateData.phone = phone;

  const user = await authRepository.updateUserProfile(userId, updateData);
  return formatUser(user);
};

// ── CHANGE PASSWORD ─────────────────────────────────────────────────
export const changePassword = async (
  userId,
  { currentPassword, newPassword },
) => {
  if (!currentPassword || !newPassword)
    throw { status: 400, message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" };
  if (currentPassword === newPassword)
    throw { status: 400, message: "Mật khẩu mới phải khác mật khẩu cũ" };
  if (newPassword.length < 8)
    throw { status: 400, message: "Mật khẩu mới phải có ít nhất 8 ký tự" };

  const user = await authRepository.findUserPasswordById(userId);
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { status: 400, message: "Mật khẩu hiện tại không đúng" };

  const hashed = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS || 10);
  await authRepository.updateUserPassword(userId, hashed);

  // Logout tất cả thiết bị sau khi đổi mật khẩu
  await authRepository.deleteAllRefreshTokensByUserId(userId);

  return { message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." };
};

// ── SEND OTP TO CONFIRM CHANGE NEW EMAIL ───────────────────────────────────
export const requestEmailChange = async (userId, newEmail) => {
  if (!newEmail) throw { status: 400, message: "Vui lòng nhập email mới" };

  // Kiểm tra email mới chưa được dùng
  const existing = await authRepository.existUserEmail(newEmail, userId);
  if (existing) throw { status: 409, message: "Email đã được sử dụng" };

  // Tạo OTP 6 số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  // Lưu OTP vào DB
  await authRepository.saveEmailOTP(userId, newEmail, otp, expiresAt);

  // Gửi email
  await sendOTPEmail(newEmail, otp);

  return { message: "Mã OTP đã được gửi đến email mới của bạn" };
};

// ── CONFIRM EMAIL AND CHANGE EMAIL ───────────────────────────────
export const verifyEmailChange = async (userId, otp) => {
  if (!otp) throw { status: 400, message: "Vui lòng nhập mã OTP" };

  const record = await authRepository.findEmailOTP(userId);
  if (!record)
    throw { status: 404, message: "Không tìm thấy yêu cầu đổi email" };

  if (record.expiresAt < new Date())
    throw { status: 400, message: "Mã OTP đã hết hạn. Vui lòng gửi lại." };

  if (record.otp !== otp) throw { status: 400, message: "Mã OTP không đúng" };

  // Cập nhật email
  await authRepository.updateUserProfile(userId, { email: record.newEmail });

  // Xoá OTP sau khi dùng
  await authRepository.deleteEmailOTP(userId);

  return { message: "Đổi email thành công" };
};

// ── FORGOTPASSWORD ──────────────────
export const forgotPassword = async (email) => {
  if (!email) throw { status: 400, message: "Vui lòng nhập email" };

  const user = await authRepository.findUserByEmail(email);
  if (!user)
    throw { status: 404, message: "Email không tồn tại trong hệ thống" };
  if (!user.isActive) throw { status: 403, message: "Tài khoản đang bị khóa" };

  // Tạo OTP 6 số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  // Dùng lại bảng otp_verifications, newEmail = email hiện tại (để phân biệt flow)
  await authRepository.saveEmailOTP(
    user.userId,
    `reset:${email}`,
    otp,
    expiresAt,
  );

  // Gửi email OTP reset mật khẩu
  await sendResetPasswordEmail(email, user.fullName, otp);

  return { message: "Mã OTP đã được gửi đến email của bạn" };
};

// ── Reset mật khẩu bằng OTP ──────────────────────────────────────
export const resetPassword = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword)
    throw { status: 400, message: "Vui lòng nhập đầy đủ thông tin" };
  if (newPassword.length < 8)
    throw { status: 400, message: "Mật khẩu mới phải có ít nhất 8 ký tự" };

  const user = await authRepository.findUserByEmail(email);
  if (!user) throw { status: 404, message: "Email không tồn tại" };

  const record = await authRepository.findEmailOTP(user.userId);
  if (!record)
    throw { status: 404, message: "Không tìm thấy yêu cầu đặt lại mật khẩu" };

  // Kiểm tra đúng flow reset (không phải flow đổi email)
  if (record.newEmail !== `reset:${email}`)
    throw { status: 400, message: "Yêu cầu không hợp lệ" };

  if (record.expiresAt < new Date())
    throw { status: 400, message: "Mã OTP đã hết hạn. Vui lòng gửi lại." };

  if (record.otp !== otp) throw { status: 400, message: "Mã OTP không đúng" };

  // Hash mật khẩu mới và cập nhật
  const hashed = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS || 10);
  await authRepository.updateUserPassword(user.userId, hashed);

  // Xoá OTP sau khi dùng
  await authRepository.deleteEmailOTP(user.userId);

  // Logout tất cả thiết bị (bảo mật)
  await authRepository.deleteAllRefreshTokensByUser(user.userId);

  return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
};
