// ================================================================
// product.docs.js — Swagger docs cho products
// ================================================================
export const productDocs = {
  "/api/products": {
    get: {
      summary: "Lấy danh sách thuốc",
      tags: ["products"],
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Tìm kiếm theo tên",
        },
        {
          name: "categoryId",
          in: "query",
          schema: { type: "integer" },
          description: "Lọc theo danh mục",
        },
        {
          name: "sort",
          in: "query",
          schema: {
            type: "string",
            enum: ["price_asc", "price_desc", "newest"],
          },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
        },
      ],
      responses: { 200: { description: "Danh sách thuốc có phân trang" } },
    },
  },
  "/api/products/{slug}": {
    get: {
      summary: "Chi tiết thuốc theo slug",
      tags: ["products"],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Thông tin chi tiết thuốc" },
        404: { description: "Không tìm thấy thuốc" },
      },
    },
  },
};
