
import { prisma } from '../config/prisma.js';

export const findAllManufacturers = () => {
  return prisma.manufacturer.findMany({ orderBy: { name: 'asc' } });
};

export const findManufacturerById = (manufacturerId) => {
  return prisma.manufacturer.findUnique({ where: { manufacturerId } });
};

export const createManufacturer = (data) => {
  return prisma.manufacturer.create({ data });
};

export const updateManufacturer = (manufacturerId, data) => {
  return prisma.manufacturer.update({ where: { manufacturerId }, data });
};

export const deleteManufacturer = (manufacturerId) => {
  return prisma.manufacturer.delete({ where: { manufacturerId } });
};
