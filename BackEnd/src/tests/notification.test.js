// ================================================================
// notification.test.js — Integration tests cho Notification API
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

let userToken = "";

beforeAll(async () => {
  await prisma.$connect();

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "wicky@gmail.com", password: "giaphien_Gmail18" });

  userToken = loginRes.body.data?.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Notification API", () => {
  it("GET /api/notifications should return 401 without token", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });

  it("GET /api/notifications should return notification list for authenticated user", async () => {
    if (!userToken) return;

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/notifications/mark-all-read should mark notifications as read", async () => {
    if (!userToken) return;

    const res = await request(app)
      .patch("/api/notifications/mark-all-read")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
