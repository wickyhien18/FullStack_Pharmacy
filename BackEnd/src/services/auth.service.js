import bcrypt from "bcrypt";
import { env } from "../config/env.config.js";
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
  email: user.email || user.userEmail,
  phone: user.phone || user.userPhone,
  role: (user.role ? user.role.roleName : null) || user.roleName,
  isActive: user.isActive,
});

// ── BUILD TOKEN PAYLOAD ────────────────────────────────────────────────
const buildTokenPayload = (user) => ({
  userId: Number(user.userId),
  userName: user.userName,
  role: user.role?.roleName || user.roleName || "ROLE_CUSTOMER",
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
      throw { status: 409, message: "Email is already in use" };
    }
    if (existingUser.userName === userName) {
      throw { status: 409, message: "Username is already in use" };
    }
    if (existingUser.phone === phone) {
      throw { status: 409, message: "Phone number is already in use" };
    }
  }

  const role = await authRepository.findRoleByName("ROLE_CUSTOMER");
  if (!role) throw { status: 500, message: "Default role not found" };

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  // Use a transaction so user and cart are created together.
  // If either operation fails, both are rolled back.
  const { prisma } = await import("../config/prisma.config.js");

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

      // Create the cart immediately after creating the user.
      await tx.cart.create({
        data: { userId: newUser.userId },
      });

      return newUser;
    },
    {
      timeout: 30000, // Increase timeout to 30 seconds.
      maxWait: 10000, // Wait up to 10 seconds for a connection.
    },
  );

  return { user: formatUser(user) };
};

// ── LOGIN ─────────────────────────────────────────────────────────
export const login = async ({ email, password }, req) => {
  const user = await authRepository.findUserByEmail(email);

  //401 - Unauthorized - incorrect email or password in database => NOT sure you have account?
  if (!user) throw { status: 401, message: "Email or password is incorrect" };

  if (!user.isActive) throw { status: 403, message: "Account is locked" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw { status: 401, message: "Email or password is incorrect" };

  const deviceInfo = getDeviceInfo(req);
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
    throw { status: 401, message: "Refresh token does not exist" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 401, message: "Refresh token is invalid" };

  if (tokenData.isRevoked)
    throw { status: 401, message: "Refresh token has been revoked" };

  if (tokenData.expireAt && tokenData.expireAt < new Date()) {
    await authRepository.revokeRefreshToken(refreshToken);
    throw {
      status: 401,
      message: "Refresh token has expired, please log in again",
    };
  }

  if (!tokenData.isActive)
    throw { status: 403, message: "Account is locked" };

  const newToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry();

  await authRepository.updateRefreshTokenById(tokenData.id, newToken, expireAt);

  const accessToken = jwt.generateAccessTokens({
    userId: Number(tokenData.userId),
    userName: tokenData.userName,
    role: tokenData.roleName || "ROLE_CUSTOMER",
  });

  return {
    accessToken,
    refreshToken: newToken,
    user: formatUser(tokenData),
  };
};

// ── LOGOUT ────────────────────────────────────────────────────────
export const logout = async (refreshToken) => {
  //400 - Bad request - can't find token or invalid token => can't do next action
  if (!refreshToken)
    throw { status: 400, message: "Refresh token does not exist" };

  const tokenData = await authRepository.findRefreshToken(refreshToken);
  if (!tokenData) throw { status: 400, message: "Refresh token is invalid" };

  await authRepository.revokeRefreshToken(refreshToken);
};

// ── LOGOUT ALL DEVICES ────────────────────────────────────────────
export const logoutAll = async (userId) => {
  await authRepository.deleteRefreshTokensByUserId(userId);
};

// ── GET PROFILE ───────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (!user.isActive) throw { status: 403, message: "Account is locked" };

  return formatUser(user);
};

// ── UPDATE PROFILE (FULLNAME OR PHONE) ───────────────────────────
export const updateProfile = async (userId, { fullName, phone }) => {
  if (phone) {
    const existing = await authRepository.findUserByPhone(phone, userId);
    if (existing)
      throw { status: 409, message: "Phone number is already in use" };
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
    throw { status: 400, message: "Please enter both current and new passwords" };
  if (currentPassword === newPassword)
    throw { status: 400, message: "New password must be different from the current password" };
  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_@$!%*?&])[A-Za-z\d_@$!%*?&]{8,}$/;
  if (!PASSWORD_REGEX.test(newPassword)) {
    throw {
      status: 400,
      message:
        "Password must have at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special characer such as: _, @, $, !, %, *, ?, & ",
    };
  }

  const user = await authRepository.findUserPasswordById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { status: 400, message: "Current password is incorrect" };

  const hashed = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS || 10);
  await authRepository.updateUserPassword(userId, hashed);

  // Log out all devices after changing the password.
  await authRepository.revokeAllRefreshTokensByUser(userId);

  return { message: "Password changed successfully. Please log in again." };
};

// ── SEND OTP TO CONFIRM CHANGE NEW EMAIL ───────────────────────────────────
export const requestEmailChange = async (userId, newEmail) => {
  if (!newEmail) throw { status: 400, message: "Please enter the new email" };

  // Check that the new email is not already used.
  const existing = await authRepository.existUserEmail(newEmail, userId);
  if (existing) throw { status: 409, message: "Email is already in use" };

  // Generate a 6-digit OTP.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to the database.
  await authRepository.saveEmailOTP(userId, newEmail, otp, expiresAt);

  // Send email.
  await sendOTPEmail(newEmail, otp);

  return { message: "OTP has been sent to your new email" };
};

// ── CONFIRM EMAIL AND CHANGE EMAIL ───────────────────────────────
export const verifyEmailChange = async (userId, otp) => {
  if (!otp) throw { status: 400, message: "Please enter the OTP" };

  const record = await authRepository.findEmailOTP(userId);
  if (!record)
    throw { status: 404, message: "Email change request not found" };

  if (record.expiresAt < new Date())
    throw { status: 400, message: "OTP has expired. Please resend it." };

  if (record.otp !== otp) throw { status: 400, message: "OTP is incorrect" };

  // Update email.
  await authRepository.updateUserProfile(userId, { email: record.newEmail });

  // Delete OTP after use.
  await authRepository.deleteEmailOTP(userId);

  return { message: "Email changed successfully" };
};

// ── FORGOTPASSWORD ──────────────────
export const forgotPassword = async (email) => {
  if (!email) throw { status: 400, message: "Please enter email" };

  const user = await authRepository.findUserByEmail(email);
  if (!user)
    throw { status: 404, message: "Email does not exist in the system" };
  if (!user.isActive) throw { status: 403, message: "Account is locked" };

  // Generate a 6-digit OTP.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Reuse otp_verifications; newEmail stores the current email to mark reset flow.
  await authRepository.saveEmailOTP(
    user.userId,
    `reset:${email}`,
    otp,
    expiresAt,
  );

  // Send reset password OTP email.
  await sendResetPasswordEmail(email, user.fullName, otp);

  return { message: "OTP has been sent to your email" };
};

// ── RESET PASSWORD BY OTP ──────────────────────────────────────
export const resetPassword = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword)
    throw { status: 400, message: "Please enter all required information" };
  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_@$!%*?&])[A-Za-z\d_@$!%*?&]{8,}$/;
  if (!PASSWORD_REGEX.test(newPassword)) {
    throw {
      status: 400,
      message:
        "Password must have at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special characer such as: _, @, $, !, %, *, ?, & ",
    };
  }

  const user = await authRepository.findUserByEmail(email);
  if (!user) throw { status: 404, message: "Email does not exist" };

  const record = await authRepository.findEmailOTP(user.userId);
  if (!record)
    throw { status: 404, message: "Password reset request not found" };

  // Ensure this is reset flow, not email change flow.
  if (record.newEmail !== `reset:${email}`)
    throw { status: 400, message: "Invalid request" };

  if (record.expiresAt < new Date())
    throw { status: 400, message: "OTP has expired. Please resend it." };

  if (record.otp !== otp) throw { status: 400, message: "OTP is incorrect" };

  // Hash and update the new password.
  const hashed = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS || 10);
  await authRepository.updateUserPassword(user.userId, hashed);

  // Delete OTP after use.
  await authRepository.deleteEmailOTP(user.userId);

  // Log out all devices for security.
  await authRepository.revokeAllRefreshTokensByUser(user.userId);

  return { message: "Password reset successfully. Please log in again." };
};

// ── GOOGLE_CALL_BACK ──────────────────
export const loginWithGoogle = async (user, req) => {
  const deviceInfo = getDeviceInfo(req);
  const accessToken = jwt.generateAccessTokens(buildTokenPayload(user));
  const refreshToken = jwt.generateRefreshToken();
  const expireAt = getRefreshTokenExpiry(); // Reuse the existing helper instead of calculating manually.

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

// ── CREATE TEMP TOKEN FOR GOOGLE SIGNUP COMPLETION ────────────
// Reuse generateAccessTokens/verifyAccessToken with a signup-specific payload.
export const createGoogleSignupToken = ({ email, fullName, googleId }) => {
  return jwt.generateAccessTokens({
    email,
    fullName,
    googleId,
    purpose: "google_signup",
  });
};

// ── COMPLETE GOOGLE SIGNUP ─────────────────────────────────────
export const completeGoogleSignup = async (
  { token, userName, fullName, phone, password },
  req,
) => {
  let payload;
  try {
    payload = jwt.verifyAccessToken(token);
  } catch {
    throw {
      status: 401,
      message: "Link has expired, please log in with Google again",
    };
  }
  if (payload.purpose !== "google_signup") {
    throw { status: 401, message: "Invalid token" };
  }

  const { email, googleId } = payload;

  const existingUser = await authRepository.existUser(email, userName, phone);
  if (existingUser) {
    if (existingUser.email === email) {
      throw {
        status: 409,
        message: "This email already has an account, please log in",
      };
    }
    if (existingUser.userName === userName) {
      throw { status: 409, message: "Username is already in use" };
    }
    if (existingUser.phone === phone) {
      throw { status: 409, message: "Phone number is already in use" };
    }
  }

  const role = await authRepository.findRoleByName("ROLE_CUSTOMER");
  if (!role) throw { status: 500, message: "Default role not found" };

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const { prisma } = await import("../config/prisma.config.js");

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        googleId,
        userName,
        fullName: fullName || null,
        email,
        phone,
        password: hashedPassword,
        roleId: role.roleId,
        isActive: true,
      },
      include: { role: true },
    });
    await tx.cart.create({ data: { userId: newUser.userId } });
    return newUser;
  });

  // Log in immediately after creation by reusing loginWithGoogle.
  return loginWithGoogle(user, req);
};
