import * as manufacturerRepo from "../repositories/manufacturer.repository.js";
import { deletePattern } from "../config/redis.config.js";

const invalidateManufacturerCache = async () => {
  await deletePattern("cache:/api/manufacturers*");
  await deletePattern("products:list:*");
  await deletePattern("cache:/api/products*");
  console.log("[Cache] Invalidated manufacturer cache");
};

const format = (m) => ({
  manufacturerId: m.manufacturerId.toString(),
  name: m.name,
  country: m.country || null,
});

//── GET MANUFACTURERS ────────────────────────────────────────────
export const getManufacturers = async () => {
  const items = await manufacturerRepo.findAllManufacturers();
  return { items: items.map(format), total: items.length };
};

//── CREATE MANUFACTURER ─────────────────────────────────────────
export const createManufacturer = async ({ name, country }) => {
  if (!name) throw { status: 400, message: "Manufacturer name is required" };
  const m = await manufacturerRepo.createManufacturer({ name, country });
  await invalidateManufacturerCache();
  return format(m);
};

//── UPDATE MANUFACTURER ─────────────────────────────────────────
export const updateManufacturer = async (manufacturerId, { name, country }) => {
  const existing = await manufacturerRepo.findManufacturerById(
    BigInt(manufacturerId),
  );
  if (!existing) throw { status: 404, message: "Manufacturer not found" };
  const m = await manufacturerRepo.updateManufacturer(BigInt(manufacturerId), {
    name,
    country,
  });
  await invalidateManufacturerCache();
  return format(m);
};

//── DELETE MANUFACTURER ─────────────────────────────────────────
export const deleteManufacturer = async (manufacturerId) => {
  const existing = await manufacturerRepo.findManufacturerById(
    BigInt(manufacturerId),
  );
  if (!existing) throw { status: 404, message: "Manufacturer not found" };
  await manufacturerRepo.deleteManufacturer(BigInt(manufacturerId));
  await invalidateManufacturerCache();
};
