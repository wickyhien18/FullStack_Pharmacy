// ================================================================
// errorMessages.js — Dịch message lỗi từ backend (tiếng Anh) sang
// tiếng Việt để hiện cho người dùng. Backend giữ nguyên tiếng Anh.
// ================================================================
const VALIDATION_MESSAGES_VI = {
  "Username must be at least 3 characters":
    "Tên đăng nhập phải có ít nhất 3 ký tự",
  "Username must be at most 30 characters": "Tên đăng nhập tối đa 30 ký tự",
  "Username can only contain letters, numbers, and underscores":
    "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới",
  "Full name must be at least 3 characters":
    "Họ và tên phải có ít nhất 3 ký tự",
  "Full name must be at most 100 characters": "Họ và tên tối đa 100 ký tự",
  "Invalid email address": "Địa chỉ email không hợp lệ",
  "Invalid Vietnamese phone number": "Số điện thoại chưa đúng chuẩn Việt Nam",
  "Password must be at most 128 characters": "Mật khẩu tối đa 128 ký tự",
  "Password must have at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special characer such as: _, @, $, !, %, *, ?, & ":
    "Mật khẩu cần tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (_, @, $, !, %, *, ?, &)",
  "Password is required": "Vui lòng nhập mật khẩu",
  "Validation failed": "Dữ liệu nhập vào không hợp lệ",
  "Too many requests": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "Internal server error": "Lỗi máy chủ hệ thống",
  "Route not found": "Không tìm thấy đường dẫn",
  "Unauthorized": "Phiên đăng nhập hết hạn hoặc chưa được xác thực",
  "Forbidden": "Bạn không có quyền thực hiện thao tác này",
  "Network Error": "Kết nối mạng thất bại",
};

// Dùng ở mọi nơi có toast.error(translateApiMessage(error.response?.data?.message))
export const translateApiMessage = (message) => {
  if (!message) return "";
  if (typeof message !== "string") return String(message);
  return VALIDATION_MESSAGES_VI[message.trim()] || message;
};
