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

export const findRefreshToken = (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { include: { role: true } } },
  });
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
    data: { password: hashedPasword, updateAt: new Date() },
  });
};

//PRISMA DELETE
export const deleteRefreshToken = (refreshToken) => {
  return prisma.refreshToken.delete({
    where: { token: refreshToken },
  });
};

export const deleteRefreshTokensByUserId = (userId) => {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
