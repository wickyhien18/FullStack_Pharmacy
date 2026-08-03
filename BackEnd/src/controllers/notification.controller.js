import * as notificationService from "../services/notification.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

// GET /api/notifications
export const getMyNotifications = async (req, res) => {
  try {
    const data = await notificationService.getMyNotifications(req.user.userId);
    return sendSuccess(res, data, "Notifications retrieved successfully");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.userId);
    return sendSuccess(res, null, "Notifications marked as read");
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
