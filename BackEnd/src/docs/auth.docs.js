// ================================================================
// auth.docs.js
// Swagger UI docs cho Auth module.
// Mỗi key là 1 endpoint path, value là object mô tả theo OpenAPI 3.0.
// Import vào src/config/swagger.js và spread vào paths.
// ================================================================
export const authDocs = {
  "/api/auth/register": {
    post: {
      summary: "Đăng ký tài khoản",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userName", "fullName", "email", "phone", "password"],
              properties: {
                userName: { type: "string", example: "wicky123" },
                fullName: { type: "string", example: "Nguyen Van A" },
                email: { type: "string", example: "user@gmail.com" },
                phone: { type: "string", example: "0912345678" },
                password: { type: "string", example: "password123" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Đăng ký thành công" },
        409: { description: "Email / userName / phone đã tồn tại" },
        422: { description: "Dữ liệu không hợp lệ" },
      },
    },
  },

  "/api/auth/login": {
    post: {
      summary: "Đăng nhập",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", example: "user@gmail.com" },
                password: { type: "string", example: "password123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description:
            "Đăng nhập thành công, trả về accessToken trong body, refreshToken trong cookie",
        },
        401: { description: "Sai email hoặc mật khẩu" },
        403: { description: "Tài khoản bị khoá" },
      },
    },
  },

  "/api/auth/refresh-token": {
    post: {
      summary: "Làm mới access token",
      tags: ["Auth"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                // optional vì web dùng cookie, mobile mới gửi trong body
                refreshToken: { type: "string", example: "abc123..." },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Trả về accessToken mới" },
        401: { description: "Refresh token không hợp lệ hoặc hết hạn" },
      },
    },
  },

  "/api/auth/logout": {
    post: {
      summary: "Đăng xuất thiết bị hiện tại",
      tags: ["Auth"],
      responses: {
        200: { description: "Đăng xuất thành công, cookie bị xoá" },
      },
    },
  },

  "/api/auth/logout-all": {
    post: {
      summary: "Đăng xuất tất cả thiết bị",
      tags: ["Auth"],
      security: [{ bearerAuth: [] }], // hiện ô nhập token trong Swagger UI
      responses: {
        200: { description: "Tất cả refresh token bị xoá" },
        401: { description: "Chưa đăng nhập" },
      },
    },
  },

  "/api/auth/profile": {
    get: {
      summary: "Lấy thông tin tài khoản đang đăng nhập",
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Thông tin user (không có password)" },
        401: { description: "Chưa đăng nhập hoặc token hết hạn" },
      },
    },
  },
};
