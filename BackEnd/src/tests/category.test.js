// ================================================================
// category.test.js — Integration tests cho Categories & Manufacturers API
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

describe("Categories & Manufacturers API", () => {
  it("GET /api/categories should return all categories", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/categories/count should return categories with product counts", async () => {
    const res = await request(app).get("/api/categories/count");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/manufacturers should return manufacturers list", async () => {
    const res = await request(app).get("/api/manufacturers");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("POST /api/categories should return 401 when called without admin auth", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: "New Test Category" });

    expect([401, 403]).toContain(res.status);
  });

  it("POST /api/manufacturers should return 401 when called without admin auth", async () => {
    const res = await request(app)
      .post("/api/manufacturers")
      .send({ name: "New Test Manufacturer", country: "Vietnam" });

    expect([401, 403]).toContain(res.status);
  });
});
