
import * as manufacturerRepo from '../repositories/manufacturer.repository.js';
import { deletePattern } from '../config/redis.js';

const invalidateManufacturerCache = async () => {
  await deletePattern("cache:/api/manufacturers*");
  console.log("[Cache] Invalidated manufacturer cache");
};

const format = (m) => ({
  manufacturerId: m.manufacturerId.toString(),
  name:           m.name,
  country:        m.country || null,
});

export const getManufacturers = async () => {
  const items = await manufacturerRepo.findAllManufacturers();
  return { items: items.map(format), total: items.length };
};

export const createManufacturer = async ({ name, country }) => {
  if (!name) throw { status: 400, message: 'Tên nhà sản xuất là bắt buộc' };
  const m = await manufacturerRepo.createManufacturer({ name, country });
  await invalidateManufacturerCache();
  return format(m);
};

export const updateManufacturer = async (manufacturerId, { name, country }) => {
  const existing = await manufacturerRepo.findManufacturerById(BigInt(manufacturerId));
  if (!existing) throw { status: 404, message: 'Không tìm thấy nhà sản xuất' };
  const m = await manufacturerRepo.updateManufacturer(BigInt(manufacturerId), { name, country });
  await invalidateManufacturerCache();
  return format(m);
};

export const deleteManufacturer = async (manufacturerId) => {
  const existing = await manufacturerRepo.findManufacturerById(BigInt(manufacturerId));
  if (!existing) throw { status: 404, message: 'Không tìm thấy nhà sản xuất' };
  await manufacturerRepo.deleteManufacturer(BigInt(manufacturerId));
  await invalidateManufacturerCache();
};
