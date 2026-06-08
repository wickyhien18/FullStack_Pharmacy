
// ================================================================
// order.docs.js — Swagger docs cho orders
// ================================================================
export const orderDocs = {
  '/api/orders': {
    post: {
      summary: 'Tạo đơn hàng',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['items', 'shippingAddress'],
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      medicineId: { type: 'integer', example: 1 },
                      quantity:   { type: 'integer', example: 2 },
                    },
                  },
                },
                shippingAddress: { type: 'string', example: '123 Lê Lợi, Q1, TP.HCM' },
                paymentMethod:   { type: 'string', enum: ['COD','VNPAY','MOMO'], default: 'COD' },
                note:            { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Đặt hàng thành công' },
        400: { description: 'Không đủ hàng hoặc sản phẩm không tồn tại' },
      },
    },
  },
  '/api/orders/my': {
    get: {
      summary: 'Lịch sử đơn hàng của tôi',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Danh sách đơn hàng' } },
    },
  },
  '/api/orders/{orderId}': {
    get: {
      summary: 'Chi tiết đơn hàng',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Chi tiết đơn hàng' },
        404: { description: 'Không tìm thấy đơn hàng' },
      },
    },
  },
};
