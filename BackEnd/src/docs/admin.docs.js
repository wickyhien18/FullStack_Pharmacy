// ================================================================
// admin.docs.js — Swagger docs cho admin
// ================================================================
export const adminDocs = {
  "/api/admin/stats": {
    get: {
      summary: "Thống kê dashboard",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Số liệu tổng quan" } },
    },
  },
  "/api/admin/orders": {
    get: {
      summary: "Lấy tất cả đơn hàng",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Danh sách đơn hàng" } },
    },
  },
  "/api/admin/orders/{orderId}/status": {
    patch: {
      summary: "Cập nhật trạng thái đơn hàng",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                orderStatus: {
                  type: "string",
                  enum: [
                    "PENDING",
                    "CONFIRMED",
                    "SHIPPING",
                    "DELIVERED",
                    "CANCELLED",
                  ],
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật thành công" } },
    },
  },
  "/api/admin/users": {
    get: {
      summary: "Lấy tất cả người dùng",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Danh sách users" } },
    },
  },
  "/api/admin/users/{userId}/status": {
    patch: {
      summary: "Khoá / mở khoá tài khoản",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { isActive: { type: "boolean" } },
            },
          },
        },
      },
      responses: { 200: { description: "Cập nhật thành công" } },
    },
  },
  "/api/admin/products": {
    get: {
      summary: "Lấy tất cả sản phẩm (admin)",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: "Danh sách sản phẩm" } },
    },
  },
  "/api/admin/products/{productId}": {
    delete: {
      summary: "Xoá mềm sản phẩm",
      tags: ["Admin"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: { 200: { description: "Xoá thành công" } },
    },
  },
};
