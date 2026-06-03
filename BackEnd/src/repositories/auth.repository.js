import { prisma } from "../config/prisma.js";

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
};
