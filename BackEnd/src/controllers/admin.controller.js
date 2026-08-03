import { handleUpload } from "../middlewares/upload.middleware.js";
import * as adminService from "../services/admin.service.js";
import * as orderService from "../services/order.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    return sendSuccess(res, data, "Get dashboard successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/orders?pages=?&limit=?(&status=?)
export const getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { status } = req.query;
    const data = await adminService.getAllOrders({ page, limit, skip, status });
    return sendSuccess(res, data, "Get order list successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/orders/:orderId/cancel-request
export const handleCancelRequest = async (req, res) => {
  try {
    const { action, rejectReason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return sendError(res, "action must be either approve or reject", 400);
    }
    const result = await orderService.handleCancelRequest(
      req.params.orderId,
      action,
      rejectReason,
    );
    return sendSuccess(res, result, result.message);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/orders/:orderId/status
export const updateOrderStatus = async (req, res) => {
  try {
    const data = await adminService.updateOrderStatus(
      req.params.orderId,
      req.body.orderStatus,
    );
    return sendSuccess(res, data, "Update order status successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const data = await adminService.getAllUsers({ page, limit, skip });
    return sendSuccess(res, data, "Lấy danh sách người dùng thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/roles
export const getRoles = async (req, res) => {
  try {
    const data = await adminService.getRoles();
    return sendSuccess(res, data, "Lấy danh sách roles thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/users/:userId/status
export const updateUserStatus = async (req, res) => {
  try {
    if (req.user.userId === parseInt(req.params.userId))
      return sendError(res, "Không thể khoá chính mình", 400);

    const data = await adminService.updateUserStatus(
      req.params.userId,
      req.body.isActive,
    );
    return sendSuccess(res, data, "Cập nhật trạng thái người dùng thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/users/:userId/role
export const updateUserRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    const user = await adminService.updateUserRole(req.params.userId, roleName);

    return sendSuccess(
      res,
      {
        userId: user.userId.toString(),
        role: user.role?.roleName,
      },
      "Đổi role thành công",
    );
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/products
export const getAllproducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const data = await adminService.getAllproducts({ page, limit, skip });
    return sendSuccess(res, data, "Lấy danh sách sản phẩm thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/products/:productId
export const getproductDetail = async (req, res) => {
  try {
    const data = await adminService.getproductDetail(req.params.productId);
    return sendSuccess(res, data, "Lấy chi tiết sản phẩm thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/admin/products
export const createproduct = async (req, res) => {
  try {
    await handleUpload(req, res);
    const data = await adminService.createproduct(req.body, req.files || []);
    return sendSuccess(res, data, "Tạo sản phẩm thành công", 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/products/:productId
export const updateproduct = async (req, res) => {
  try {
    await handleUpload(req, res);
    const keepImageIds = req.body.keepImageIds
      ? JSON.parse(req.body.keepImageIds)
      : [];
    const data = await adminService.updateproduct(
      req.params.productId,
      req.body,
      req.files || [],
      keepImageIds,
    );
    return sendSuccess(res, data, "Cập nhật thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// DELETE /api/admin/products/:productId
export const deleteproduct = async (req, res) => {
  try {
    await adminService.deleteproduct(req.params.productId);
    return sendSuccess(res, null, "Xoá sản phẩm thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
