import { prisma } from "../config/prisma.config.js";

//── MANUFACTURERS ───────────────────────────────────────────────
//== FIND ALL MANUFACTURERS =======================================
export const findAllManufacturers = () => {
  return prisma.manufacturer.findMany({ orderBy: { name: "asc" } });
};

//== FIND MANUFACTURER BY ID ======================================
export const findManufacturerById = (manufacturerId) => {
  return prisma.manufacturer.findUnique({ where: { manufacturerId } });
};

//== CREATE MANUFACTURER ==========================================
export const createManufacturer = (data) => {
  return prisma.manufacturer.create({ data });
};

//== UPDATE MANUFACTURER ==========================================
export const updateManufacturer = (manufacturerId, data) => {
  return prisma.manufacturer.update({ where: { manufacturerId }, data });
};

//== DELETE MANUFACTURER ==========================================
export const deleteManufacturer = (manufacturerId) => {
  return prisma.manufacturer.delete({ where: { manufacturerId } });
};
