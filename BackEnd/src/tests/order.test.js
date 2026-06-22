// ================================================================
// order.test.js — Integration tests cho Order API
// Lưu ý / Note: cần có user test + products trong DB
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

let accessToken = "";
let createdOrderId = "";

// Đăng nhập trước để lấy token / Login first to get token
beforeAll(async () => {
  await prisma.$connect();

  // Dùng account test đã tạo ở auth.test.js
  // Hoặc tạo mới nếu chưa có / Or create new if not exists
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "wicky@gmail.com", password: "giaphien_Gmail18" });

  accessToken = res.body.data?.accessToken;
});

afterAll(async () => {
  // Xoá order test / Delete test orders
  if (createdOrderId) {
    await prisma.orderItem.deleteMany({
      where: { orderId: BigInt(createdOrderId) },
    });
    await prisma.order.deleteMany({
      where: { orderCode: { startsWith: "ORD-TEST-" } },
    });
  }
  await prisma.$disconnect();
});

// ── CREATE ORDER ──────────────────────────────────────────────────
describe("POST /api/orders", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [], shippingAddress: "Test address" });

    expect(res.status).toBe(401);
  });

  it("should return 400 if items is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ items: [], shippingAddress: "99 Nguyen Chi Thanh" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if shippingAddress is missing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ items: [{ productId: 1, quantity: 1 }], shippingAddress: "" });

    expect(res.status).toBe(400);
  });

  it("should create order successfully with valid data", async () => {
    // Lấy product đầu tiên trong DB để test / Get first product to test
    const product = await prisma.product.findFirst({
      where: { deletedAt: null, status: "ACTIVE" },
      include: { inventory: true },
    });

    // Bỏ qua nếu không có product / Skip if no product available
    if (!product || (product.inventory?.quantity ?? 0) < 1) {
      console.warn("[Test] No available product to test order creation");
      return;
    }

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        items: [{ productId: product.productId.toString(), quantity: 1 }],
        shippingAddress: "99 Nguyen Chi Thanh, Q1, TP.HCM",
        note: "Test order from Jest",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderCode).toBeDefined();
    expect(res.body.data.totalPrice).toBeGreaterThan(0);

    // Lưu orderId để dùng ở test sau / Save orderId for next tests
    createdOrderId = res.body.data.orderId;
  });
});

// ── GET MY ORDERS ─────────────────────────────────────────────────
describe("GET /api/orders/my", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/orders/my");
    expect(res.status).toBe(401);
  });

  it("should return order list for authenticated user", async () => {
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("should return paginated results", async () => {
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ page: 1, limit: 5 });

    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(5);
  });
});

// ── GET ORDER DETAIL ──────────────────────────────────────────────
describe("GET /api/orders/:orderId", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/orders/1");
    expect(res.status).toBe(401);
  });

  it("should return 404 for non-existent order", async () => {
    const res = await request(app)
      .get("/api/orders/999999999")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("should return order detail for valid orderId", async () => {
    if (!createdOrderId) {
      console.warn("[Test] No order created yet, skipping detail test");
      return;
    }

    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.orderId).toBe(createdOrderId);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
