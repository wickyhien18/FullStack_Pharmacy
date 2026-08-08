// ================================================================
// order.test.js — Integration tests cho Order API
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

const orderUid = Date.now();
const orderUser = {
  userName: `ord_${orderUid}`,
  fullName: "Order Tester Jest",
  email: `ord_${orderUid}@test.pharmacy`,
  phone: `09${String(orderUid).slice(-8)}`,
  password: "Password123!",
};

let accessToken = "";
let currentUserId = null;
let testProduct = null;
let createdOrderId = null;

beforeAll(async () => {
  await prisma.$connect();

  testProduct = await prisma.product.findFirst({
    where: { deletedAt: null, status: "ACTIVE" },
  });

  // Register & login fresh user
  await request(app).post("/api/auth/register").send(orderUser);
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: orderUser.email, password: orderUser.password });

  accessToken = loginRes.body.data?.accessToken;
  currentUserId = loginRes.body.data?.user?.userId;
}, 30000);

afterAll(async () => {
  if (currentUserId) {
    const orders = await prisma.order.findMany({
      where: { userId: BigInt(currentUserId) },
    });
    for (const o of orders) {
      await prisma.orderItem.deleteMany({ where: { orderId: o.orderId } });
      await prisma.order.delete({ where: { orderId: o.orderId } });
    }
  }
  await prisma.user.deleteMany({
    where: { email: orderUser.emai },
  });
  await prisma.$disconnect();
});

// ── CREATE ORDER VALIDATION ───────────────────────────────────────
describe("POST /api/orders", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ shippingAddress: "Test address" });

    expect(res.status).toBe(401);
  });

  it("should return 400 if shippingAddress is missing", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ shippingAddress: "" });

    expect(res.status).toBe(400);
  });

  it("should create order successfully after adding item to cart", async () => {
    if (!accessToken || !testProduct) return;

    // 1. Add item to user cart
    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: Number(testProduct.productId),
        quantity: 1,
      });

    // 2. Create order from cart
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: "99 Nguyen Chi Thanh, Q1, TP.HCM",
        note: "Test order created in test block",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderCode).toBeDefined();
    expect(res.body.data.totalPrice).toBeGreaterThan(0);

    createdOrderId = res.body.data.orderId;
  }, 30000);
});

// ── GET MY ORDERS ─────────────────────────────────────────────────
describe("GET /api/orders/my", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/orders/my");
    expect(res.status).toBe(401);
  });

  it("should return order list for authenticated user", async () => {
    if (!accessToken) return;

    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("should return paginated results", async () => {
    if (!accessToken) return;

    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(5);
  });
});

// ── ORDER DETAIL ──────────────────────────────────────────────────
describe("GET /api/orders/:orderId", () => {
  it("should return 404 for non-existent order", async () => {
    if (!accessToken) return;

    const res = await request(app)
      .get("/api/orders/999999999")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("should return order detail for valid orderId", async () => {
    if (!accessToken || !createdOrderId) return;

    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(String(res.body.data.orderId)).toBe(String(createdOrderId));
  });
});
