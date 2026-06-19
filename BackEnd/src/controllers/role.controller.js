
import * as roleService from '../services/role.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getRoles = async (req, res) => {
  try {
    const data = await roleService.getRoles();
    return sendSuccess(res, data, 'Lấy danh sách roles thành công');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};
