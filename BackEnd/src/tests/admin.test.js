// ================================================================
// admin.test.js — Integration tests cho Admin API (RBAC & Management)
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

let adminToken = "";
let customerToken = "";

beforeAll(async () => {
  await prisma.$connect();

  // 1. Ensure customer user exists & authenticate
  let custRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "cust_tester@test.pharmacy", password: "Password123!" });

  if (custRes.status !== 200) {
    await request(app)
      .post("/api/auth/register")
      .send({
        userName: "cust_tester",
        fullName: "Customer Tester",
        email: "cust_tester@test.pharmacy",
        phone: "0966666666",
        password: "Password123!",
      });

    custRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "cust_tester@test.pharmacy", password: "Password123!" });
  }
  customerToken = custRes.body.data?.accessToken;

  // 2. Ensure admin user exists with ROLE_ADMIN
  const adminRole = await prisma.role.findFirst({
    where: { roleName: "ROLE_ADMIN" },
  });

  if (adminRole) {
    let adminUser = await prisma.user.findFirst({
      where: { email: "admin_tester@test.pharmacy" },
    });

    if (!adminUser) {
      await request(app)
        .post("/api/auth/register")
        .send({
          userName: "admin_tester",
          fullName: "Admin Tester",
          email: "admin_tester@test.pharmacy",
          phone: "0955555555",
          password: "Password123!",
        });

      await prisma.user.updateMany({
        where: { email: "admin_tester@test.pharmacy" },
        data: { roleId: adminRole.roleId },
      });
    } else if (adminUser.roleId !== adminRole.roleId) {
      await prisma.user.update({
        where: { userId: adminUser.userId },
        data: { roleId: adminRole.roleId },
      });
    }

    const admRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin_tester@test.pharmacy", password: "Password123!" });

    adminToken = admRes.body.data?.accessToken;
  }
}, 30000);

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["cust_tester@test.pharmacy", "admin_tester@test.pharmacy"],
      },
    },
  });
  await prisma.$disconnect();
});

// ── DASHBOARD STATS ───────────────────────────────────────────────
describe("GET /api/admin/stats", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("should return 403 for customer user", async () => {
    if (!customerToken) return;

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it("should return stats for admin user", async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBeDefined();
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalProducts).toBeDefined();
    expect(res.body.data.totalRevenue).toBeDefined();
  });
});

// ── ADMIN ORDERS ──────────────────────────────────────────────────
describe("GET /api/admin/orders", () => {
  it("should return 403 for customer user", async () => {
    if (!customerToken) return;

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it("should return all orders for admin", async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});

// ── ADMIN USERS ───────────────────────────────────────────────────
describe("GET /api/admin/users", () => {
  it("should return user list for admin", async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    res.body.data.items.forEach((user) => {
      expect(user.password).toBeUndefined();
    });
  });
});

// ── ADMIN PRODUCTS ────────────────────────────────────────────────
describe("GET /api/admin/products", () => {
  it("should return product list for admin", async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
