import * as notificationService from "../services/notification.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getMyNotifications = async (req, res) => {
  try {
    const data = await notificationService.getMyNotifications(req.user.userId);
    return sendSuccess(res, data, "Lấy thông báo thành công");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.userId);
    return sendSuccess(res, null, "Đã đánh dấu đã đọc");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
