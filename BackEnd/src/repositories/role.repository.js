
import { prisma } from '../config/prisma.js';

export const findAllRoles = () => {
  return prisma.role.findMany({ orderBy: { roleName: 'asc' } });
};

export const findRoleById = (roleId) => {
  return prisma.role.findUnique({ where: { roleId } });
};

export const findRoleByName = (roleName) => {
  return prisma.role.findUnique({ where: { roleName } });
};
