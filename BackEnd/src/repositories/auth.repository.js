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
    userData,
    include: { role: true },
  });
};

export const findRoleByName = (name) => {
  return prisma.role.findUnique({
    where: { name },
  });
};

export const saveRefreshToken = (userId, refreshToken, expiresAt) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
};

export const findRefreshToken = (refreshToken) => {
  return prisma.refreshToken.findUnique({
    where: { refreshToken },
    include: {
      user: {
        include: { role: true },
      },
    },
  });
};

export const deleteRefreshToken = (refreshToken) => {
  return prisma.refreshToken.delete({
    where: { refreshToken },
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
