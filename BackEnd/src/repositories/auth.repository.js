import { prisma } from "../config/prisma.js";

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

export const createUser = (userData) => {
  return prisma.user.create({
    data: userData,
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

export const saveRefreshToken = (userId, token, expireAt, deviceInfo) => {
  return prisma.refreshToken.create({
    data: { userId, token, expireAt, deviceInfo },
  });
};

export const updateRefreshTokenById = (id, newToken, newExpireAt) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { token: newToken, expireAt: newExpireAt },
  });
};

export const existUser = (email, userName, phone) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }, { phone }],
    },
  });
};

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

export const updateLastActivity = (userId) => {
  return prisma.user.update({
    where: { userId },
    data: { lastActivity: new Date() },
  });
};

export const findAllTokensByUser = (userId) => {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: { id: true, deviceInfo: true, createdAt: true, expireAt: true },
    orderBy: { createdAt: "desc" },
  });
};
