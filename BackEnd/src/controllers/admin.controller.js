// ================================================================
// admin.controller.js
// ================================================================
import { handleUpload } from "../middlewares/upload.middleware.js";
import * as adminService from "../services/admin.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    return sendSuccess(res, data, "Lấy thống kê thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const data = await adminService.getAllOrders({ page, limit, skip });
    return sendSuccess(res, data, "Lấy danh sách đơn hàng thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/orders/:orderId/cancel-request — Admin xử lý
export const handleCancelRequestController = async (req, res) => {
  try {
    const { action, rejectReason } = req.body;
    // action = 'approve' hoặc 'reject'
    if (!["approve", "reject"].includes(action)) {
      return sendError(res, "action phải là approve hoặc reject", 400);
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
    return sendSuccess(res, data, "Cập nhật trạng thái thành công");
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

    const user = adminService.updateUserRole(req.params.userId, roleName);

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

// GET /api/admin/medicines
export const getAllMedicines = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const data = await adminService.getAllMedicines({ page, limit, skip });
    return sendSuccess(res, data, "Lấy danh sách sản phẩm thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/admin/medicines
export const createMedicine = async (req, res) => {
  try {
    await handleUpload(req, res);
    const data = await adminService.createMedicine(req.body, req.file);
    return sendSuccess(res, data, "Tạo sản phẩm thành công", 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/medicines/:medicineId
export const updateMedicine = async (req, res) => {
  try {
    await handleUpload(req, res);
    const data = await adminService.updateMedicine(
      req.params.medicineId,
      req.body,
      req.file,
    );
    return sendSuccess(res, data, "Cập nhật thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// DELETE /api/admin/medicines/:medicineId
export const deleteMedicine = async (req, res) => {
  try {
    await adminService.deleteMedicine(req.params.medicineId);
    return sendSuccess(res, null, "Xoá sản phẩm thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
