import * as adminRepo from "../repositories/admin.repository.js";
import * as productRepo from "../repositories/product.repository.js";
import { buildPaginatedResponse } from "../utils/pagination.js";
import { sendError } from "../utils/response.js";
import { uploadImage, deleteImage } from "./upload.service.js";
import { invalidateProductCache } from "./product.service.js";
import { prisma } from "../config/prisma.config.js";
import { notifyOrderStatusChange } from "./notification.service.js";
import slugify from "slugify";

const MAX_IMAGES = 3;

//── GENERATE SLUG ────────────────────────────────────────────────
const generateSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: "vi" }) + "-" + Date.now();

//── DASHBOARD STATS ────────────────────────────────────────────────
export const getDashboardStats = () => adminRepo.getDashboardStats();

//── GET ALL ORDERS ────────────────────────────────────────────────
export const getAllOrders = async ({ page, limit, skip, status }) => {
  const [orders, total] = await Promise.all([
    adminRepo.findAllOrders({ skip, limit, status }),
    adminRepo.countAllOrders(status),
  ]);

  const items = orders.map((o) => ({
    orderId: o.orderId.toString(),
    orderCode: o.orderCode,
    totalPrice: Number(o.totalPrice),
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    createdAt: o.createdAt,
    user: o.user
      ? {
          userId: o.user.userId.toString(),
          fullName: o.user.fullName,
          email: o.user.email,
        }
      : null,
    items: o.items?.map((i) => ({
      productName: i.product?.name || "N/A",
      quantity: i.quantity,
    })),
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

//── UPDATE ORDER STATUS ────────────────────────────────────────────────
export const updateOrderStatus = async (orderId, orderStatus) => {
  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(orderStatus)) {
    throw { status: 400, message: "Invalid order status" };
  }
  const order = await adminRepo.updateOrderStatus(BigInt(orderId), orderStatus);

  // Get user infomation to have email/fullName for notification
  const fullOrder = await adminRepo.findOrderByOrderId(order.orderId);

  await notifyOrderStatusChange(fullOrder);

  return { orderId: order.orderId.toString(), orderStatus: order.orderStatus };
};

//── GET ROLES ────────────────────────────────────────────────
export const getRoles = async () => {
  const roles = await adminRepo.findAllRoles();
  return { roleId: roles.roleId.toString(), roleName: roles.roleName };
};

//── GET ALL USERS ────────────────────────────────────────────────
export const getAllUsers = async ({ page, limit, skip }) => {
  const [users, total] = await Promise.all([
    adminRepo.findAllUsers({ skip, limit }),
    adminRepo.countAllUsers(),
  ]);

  const items = users.map((u) => ({
    userId: u.userId.toString(),
    userName: u.userName,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    isActive: u.isActive,
    role: { roleName: u.role?.roleName },
    createdAt: u.createdAt,
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

//── UPDATE USER STATUS ────────────────────────────────────────────────
export const updateUserStatus = async (userId, isActive) => {
  const user = await adminRepo.updateUserStatus(BigInt(userId), isActive);
  return { userId: user.userId.toString(), isActive: user.isActive };
};

//── UPDATE USER ROLE ────────────────────────────────────────────────
export const updateUserRole = async (userId, roleName) => {
  if (!roleName) throw { status: 400, message: "RoleName is required" };

  const role = await adminRepo.existRole(roleName);
  if (!role) throw { status: 404, message: "Role isn't existed" };

  const user = await adminRepo.updateUserRole(BigInt(userId), role.roleId);
  return { userId: user.userId.toString(), role: role.roleName };
};

//── GET ALL PRODUCTS ────────────────────────────────────────────────
export const getAllProducts = async ({ page, limit, skip }) => {
  const [products, total] = await Promise.all([
    adminRepo.findAllProducts({ skip, limit }),
    adminRepo.countAllProducts(),
  ]);

  const items = products.map((m) => ({
    productId: m.productId.toString(),
    name: m.name,
    slug: m.slug,
    price: Number(m.price),
    status: m.status,
    primaryImage: m.image,
    categoryName: m.category?.name || null,
    stock: m.inventory?.quantity ?? 0,
  }));

  return buildPaginatedResponse(items, total, page, limit);
};

//── GET PRODUCT DETAIL ────────────────────────────────────────────────
export const getProductDetail = async (productId) => {
  const product = await productRepo.findProductWithImages(BigInt(productId));
  if (!product) throw { status: 404, message: "Not found product" };

  return {
    productId: product.productId.toString(),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    unit: product.unit,
    status: product.status,
    categoryId: product.categoryId?.toString() || "",
    manufacturerId: product.manufacturerId?.toString() || "",
    stock: product.inventory?.quantity ?? 0,
    images: product.images.map((img) => ({
      imageId: img.imageId.toString(),
      imageUrl: img.imageUrl,
    })),
  };
};

//── CREATE PRODUCT ────────────────────────────────────────────────
export const createProduct = async (data, files = []) => {
  if (files.length > MAX_IMAGES) {
    throw { status: 400, message: `Maximum ${MAX_IMAGES} images / product` };
  }

  const imageUrls = await Promise.all(
    files.map((file) => uploadImage(file.buffer, data.name, file.mimetype)),
  );

  const product = await productRepo.createProduct({
    name: data.name,
    slug: generateSlug(data.name),
    description: data.description || null,
    price: parseFloat(data.price),
    unit: data.unit || "Hộp",
    categoryId: data.categoryId ? BigInt(data.categoryId) : null,
    manufacturerId: data.manufacturerId ? BigInt(data.manufacturerId) : null,
    status: data.status || "ACTIVE",
    image: imageUrls[0] || null,
  });

  await adminRepo.createInventory({
    productId: product.productId,
    quantity: parseInt(data.stock) || 0,
  });

  if (imageUrls.length > 0) {
    await productRepo.createProductImages(product.productId, imageUrls);
  }

  await invalidateProductCache();

  return { productId: product.productId.toString(), slug: product.slug };
};

//── UPDATE PRODUCT ────────────────────────────────────────────────
export const updateProduct = async (
  productId,
  data,
  files = [],
  keepImageIds = [],
) => {
  const existing = await adminRepo.existProduct(productId);
  if (!existing) throw { status: 404, message: "Not found product" };

  const currentImages = await productRepo.findImagesByProductId(
    BigInt(productId),
  );

  if (keepImageIds.length + files.length > MAX_IMAGES) {
    throw { status: 400, message: `Maximum ${MAX_IMAGES} images / product` };
  }

  const keptImages = currentImages.filter((img) =>
    keepImageIds.includes(img.imageId.toString()),
  );
  const imagesToDelete = currentImages.filter(
    (img) => !keepImageIds.includes(img.imageId.toString()),
  );

  // Upload ảnh mới trước. Nếu DB update fail, ảnh mới sẽ được dọn ở catch bên dưới.
  const newImageUrls = await Promise.all(
    files.map((file) =>
      uploadImage(file.buffer, data.name || existing.name, file.mimetype),
    ),
  );

  const updateData = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = generateSlug(data.name);
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price) updateData.price = parseFloat(data.price);
  if (data.unit) updateData.unit = data.unit;
  if (data.categoryId) updateData.categoryId = BigInt(data.categoryId);
  if (data.manufacturerId)
    updateData.manufacturerId = BigInt(data.manufacturerId);
  if (data.status) updateData.status = data.status;

  // Đồng bộ lại ảnh đại diện = ảnh đầu tiên còn lại sau khi sửa
  updateData.image = keptImages[0]?.imageUrl || newImageUrls[0] || null;

  try {
    await productRepo.syncProductImagesAndUpdateProduct({
      productId: BigInt(productId),
      keptImageIds: keptImages.map((img) => img.imageId),
      newImageUrls,
      updateData,
    });
  } catch (err) {
    await Promise.all(newImageUrls.map((url) => deleteImage(url)));
    throw err;
  }

  await Promise.all(imagesToDelete.map((img) => deleteImage(img.imageUrl)));

  // Cập nhật tồn kho nếu có
  if (data.stock !== undefined) {
    await adminRepo.createOrUpdateInventory(productId, data.stock);
  }

  await invalidateProductCache(existing.slug);
  if (updateData.slug) {
    await invalidateProductCache(updateData.slug);
  }

  return { productId, message: "Update product information successfully" };
};

//── DELETE PRODUCT  ────────────────────────────────────────────────
export const deleteProduct = async (productId) => {
  const existing = await adminRepo.existProduct(productId);
  if (!existing) throw { status: 404, message: "Not found product" };

  const images = await productRepo.findImagesByProductId(BigInt(productId));
  for (const img of images) {
    await deleteImage(img.imageUrl);
  }
  await productRepo.softDeleteProduct(BigInt(productId));
  await invalidateProductCache(existing.slug);
};
