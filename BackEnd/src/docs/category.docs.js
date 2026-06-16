
// ================================================================
// category.docs.js — Swagger docs cho categories
// ================================================================
export const categoryDocs = {
  '/api/categories': {
    get: {
      summary: 'Lấy danh sách danh mục',
      tags: ['Categories'],
      responses: {
        200: {
          description: 'Danh sách danh mục',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lấy danh mục thành công' },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            categoryId: { type: 'string', example: '1' },
                            name: { type: 'string', example: 'Dược mỹ phẩm' },
                            slug: { type: 'string', example: 'duoc-my-pham' },
                          },
                        },
                      },
                      total: { type: 'integer', example: 6 },
                    },
                  },
                },
              },
            },
          },
        },
        500: { description: 'Lỗi server' },
      },
    },
  },
  '/api/categories/count': {
    get: {
      summary: 'Lấy danh sách danh mục kèm số lượng thuốc',
      tags: ['Categories'],
      responses: {
        200: {
          description: 'Danh sách danh mục kèm số lượng thuốc tương ứng',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Lấy danh mục cùng số lượng thuốc tương ứng thành công',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            categoryId: { type: 'string', example: '1' },
                            name: { type: 'string', example: 'Dược mỹ phẩm' },
                            slug: { type: 'string', example: 'duoc-my-pham' },
                            count: { type: 'integer', example: 12 },
                          },
                        },
                      },
                      total: { type: 'integer', example: 6 },
                    },
                  },
                },
              },
            },
          },
        },
        500: { description: 'Lỗi server' },
      },
    },
  },
};
