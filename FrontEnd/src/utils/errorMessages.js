// ================================================================
// errorMessages.js — Dịch message lỗi từ backend (tiếng Anh) sang
// tiếng Việt để hiển thị cho người dùng trên Frontend.
// ================================================================

const API_MESSAGES_VI = {
  // Validation / Zod Schema Messages
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

  // Authentication & User Messages
  "Email is already in use": "Email này đã được sử dụng",
  "Username is already in use": "Tên đăng nhập này đã được sử dụng",
  "Phone number is already in use": "Số điện thoại này đã được sử dụng",
  "Default role not found": "Không tìm thấy quyền mặc định",
  "Email or password is incorrect": "Email hoặc mật khẩu không chính xác",
  "Account is locked": "Tài khoản của bạn hiện đang bị khóa",
  "Refresh token does not exist": "Mã xác thực không tồn tại hoặc đã hết hạn",
  "Refresh token is invalid": "Mã xác thực không hợp lệ",
  "Refresh token has been revoked": "Mã xác thực đã bị thu hồi",
  "Refresh token has expired, please log in again":
    "Phiên làm việc đã hết hạn, vui lòng đăng nhập lại",
  "User not found": "Không tìm thấy người dùng",
  "Please enter both current and new passwords":
    "Vui lòng nhập cả mật khẩu hiện tại và mật khẩu mới",
  "New password must be different from the current password":
    "Mật khẩu mới phải khác mật khẩu hiện tại",
  "Current password is incorrect": "Mật khẩu hiện tại không chính xác",
  "Password changed successfully. Please log in again.":
    "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
  "Please enter the new email": "Vui lòng nhập email mới",
  "OTP has been sent to your new email":
    "Mã OTP đã được gửi đến email mới của bạn",
  "Please enter the OTP": "Vui lòng nhập mã OTP",
  "Email change request not found": "Không tìm thấy yêu cầu thay đổi email",
  "OTP has expired. Please resend it.":
    "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.",
  "OTP is incorrect": "Mã OTP không chính xác",
  "Email changed successfully": "Thay đổi email thành công",
  "Please enter email": "Vui lòng nhập địa chỉ email",
  "Email does not exist in the system": "Email không tồn tại trong hệ thống",
  "OTP has been sent to your email":
    "Mã OTP đã được gửi tới email của bạn",
  "Please enter all required information":
    "Vui lòng nhập đầy đủ thông tin yêu cầu",
  "Email does not exist": "Email không tồn tại",
  "Password reset request not found": "Không tìm thấy yêu cầu đặt lại mật khẩu",
  "Invalid request": "Yêu cầu không hợp lệ",
  "Password reset successfully. Please log in with your new password.":
    "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
  "Please enter the information to be updated":
    "Vui lòng nhập thông tin cần cập nhật",
  "Missing required information": "Thiếu thông tin bắt buộc",
  "Failed to retrieve email from Google":
    "Không thể lấy thông tin email từ Google",

  // Cart, Order, Admin & Product Messages
  "productId is required": "Vui lòng chọn sản phẩm",
  "quantity is required": "Vui lòng nhập số lượng sản phẩm",
  "Product does not exist": "Sản phẩm không tồn tại",
  "Out of stock": "Sản phẩm hiện tại đã hết hàng",
  "Not enough stock available": "Số lượng sản phẩm trong kho không đủ",
  "Cart item not found": "Không tìm thấy sản phẩm trong giỏ hàng",
  "Order not found": "Không tìm thấy đơn hàng",
  "Invalid order status": "Trạng thái đơn hàng không hợp lệ",
  "RoleName is required": "Vui lòng chọn vai trò",
  "Role isn't existed": "Vai trò không tồn tại",
  "Not found product": "Không tìm thấy sản phẩm",
  "Maximum 3 images / product": "Mỗi sản phẩm chỉ được tối đa 3 hình ảnh",
  "Update product information successfully":
    "Cập nhật thông tin sản phẩm thành công",
  "Cannot inactive yourself": "Không thể tự khóa tài khoản của chính bạn",
  "action must be either approve or reject":
    "Thao tác phải là đồng ý hoặc từ chối",

  // Middleware & Network Messages
  "Too many requests, please try again after 15 minutes":
    "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
  "Too many token refresh requests": "Quá nhiều yêu cầu làm mới phiên làm việc",
  "Content-Type must be application/json":
    "Định dạng dữ liệu không hợp lệ (cần application/json)",
  "Only JPG, PNG, WEBP files are allowed":
    "Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP",
  "Socket.io is not initialized": "Hệ thống kết nối thời gian thực chưa sẵn sàng",
  "Validation failed": "Dữ liệu nhập vào chưa hợp lệ",
  "Too many requests": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "Internal server error": "Lỗi máy chủ hệ thống",
  "Route not found": "Không tìm thấy đường dẫn",
  "Unauthorized": "Phiên đăng nhập đã hết hạn hoặc chưa xác thực",
  "Forbidden": "Bạn không có quyền thực hiện thao tác này",
  "Network Error": "Lỗi kết nối mạng, vui lòng kiểm tra lại",
};

// Dùng ở mọi nơi khi nhận message từ Backend response
export const translateApiMessage = (message) => {
  if (!message) return "";
  if (Array.isArray(message)) {
    return message.map(translateApiMessage).join(", ");
  }
  if (typeof message !== "string") return String(message);

  const trimmed = message.trim();
  if (API_MESSAGES_VI[trimmed]) {
    return API_MESSAGES_VI[trimmed];
  }

  // Khớp theo mẫu chuỗi (Pattern matching) cho message động
  for (const [key, value] of Object.entries(API_MESSAGES_VI)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return trimmed;
};
