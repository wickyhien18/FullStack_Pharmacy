import { prisma } from "../config/prisma.js";

//PRISMA FIND
export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
};

export const findUserByUserName = (userName) => {
  return prisma.user.findUnique({
    where: { userName },
    include: { role: true },
  });
};

export const findUserByPhone = (phone) => {
  return prisma.user.findUnique({
    where: { phone },
  });
};

export const findUserById = (userId) => {
  return prisma.user.findUnique({
    where: { userId },
    include: { role: true },
  });
};

export const findRoleByName = (name) => {
  return prisma.role.findUnique({
    where: { roleName: name },
  });
};

export const findTokenByDevice = (userId, deviceInfo) => {
  return prisma.refreshToken.findFirst({
    where: { userId, deviceInfo: deviceInfo },
  });
};

export const findRefreshToken = async (token) => {
  const rows = await prisma.$queryRaw`
    SELECT rt.id,
    rt.token,
    rt.expire_at as "expireAt",
    rt.is_revoked as "isRevoked",
    rt.device_info as "deviceInfo",
    u.user_id as "userId",
    u.user_name as "userName",
    u.full_name as "fullName",
    u.email as "userEmail",
    u.phone as "userPhone", 
    u.is_active as "isActive",
    r.role_name as "roleName"
    FROM refresh_tokens rt
    join users u on rt.user_id = u.user_id
    join roles r on u.role_id = r.role_id
    where rt.token = ${token}
  `;
  return rows[0] ?? null;
};

export const findUserPasswordById = (userId) => {
  return prisma.user.findUnique({
    where: { userId: userId },
    select: { userId: true, password: true },
  });
};

export const findAllTokensByUser = (userId) => {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: { id: true, deviceInfo: true, createdAt: true, expireAt: true },
    orderBy: { createdAt: "desc" },
  });
};

export const findEmailOTP = (userId) => {
  return prisma.otpVerification.findUnique({
    where: { userId },
  });
};

//PRISMA CREATE
export const createUser = (userData) => {
  return prisma.user.create({
    data: userData,
    include: { role: true },
  });
};

export const saveRefreshToken = (userId, token, expireAt, deviceInfo) => {
  return prisma.refreshToken.create({
    data: { userId, token, expireAt, deviceInfo },
  });
};

//PRISMA EXIST
export const existUser = (email, userName, phone) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }, { phone }],
    },
  });
};

export const existUserPhone = (phone, excludeUserId) => {
  return prisma.user.findFirst({
    where: { phone, userId: { not: excludeUserId } },
  });
};

export const existUserEmail = (email, excludeUserId) => {
  return prisma.user.findFirst({
    where: {
      email,
      userId: { not: excludeUserId },
    },
  });
};

//PRISMA UPDATE
export const updateRefreshTokenById = (id, newToken, newExpireAt) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { token: newToken, expireAt: newExpireAt },
  });
};

export const updateUserProfile = (userId, data) => {
  return prisma.user.update({
    where: { userId },
    data: { ...data, updatedAt: new Date() },
    include: { role: true },
  });
};

export const updateLastActivity = (userId) => {
  return prisma.user.update({
    where: { userId },
    data: { lastActivity: new Date() },
  });
};

export const updateUserPassword = (userId, hashedPasword) => {
  return prisma.user.update({
    where: { userId },
    data: { password: hashedPasword, updatedAt: new Date() },
  });
};

//PRISMA DELETE
export const revokeRefreshToken = (refreshToken) => {
  return prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { isRevoked: true, token: "" },
  });
};

export const revokeAllRefreshTokensByUser = (userId) => {
  return prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true, token: "" },
  });
};

export const deleteEmailOTP = (userId) => {
  return prisma.otpVerification.delete({
    where: { userId },
  });
};

//PISMA UPSERT
export const saveEmailOTP = (userId, newEmail, otp, expiresAt) => {
  return prisma.otpVerification.upsert({
    where: { userId },
    update: { newEmail, otp, expiresAt, createdAt: new Date() },
    create: { userId, newEmail, otp, expiresAt },
  });
};
