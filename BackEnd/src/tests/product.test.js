// ================================================================
// product.test.js — Integration tests cho product API
// Integration tests for product API
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

beforeAll(async () => {
  await prisma.$connect();
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/products", () => {
  it("should return paginated list", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Phải có items array / Must have items array
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.total).toBeDefined();
    expect(res.body.data.page).toBeDefined();
    expect(res.body.data.totalPages).toBeDefined();
  });

  it("should respect limit param", async () => {
    const res = await request(app).get("/api/products").query({ limit: 5 });

    expect(res.status).toBe(200);
    // Số items trả về không vượt quá limit / Items returned must not exceed limit
    expect(res.body.data.items.length).toBeLessThanOrEqual(5);
    expect(res.body.data.limit).toBe(5);
  });

  it("should filter by search keyword", async () => {
    const res = await request(app).get("/api/products").query({ search: "a" }); // search chữ 'a' chắc chắn có kết quả / 'a' will have results

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("should return correct pagination metadata", async () => {
    const res = await request(app)
      .get("/api/products")
      .query({ page: 1, limit: 3 });

    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(3);
    // totalPages = ceil(total / limit) / totalPages = ceil(total / limit)
    const expectedPages = Math.ceil(res.body.data.total / 3);
    expect(res.body.data.totalPages).toBe(expectedPages);
  });
});

describe("GET /api/products/:slug", () => {
  it("should return 404 for non-existent slug", async () => {
    const res = await request(app).get(
      "/api/products/slug-nay-khong-ton-tai-abcxyz",
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/categories", () => {
  it("should return categories list", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
