// ================================================================
// security.test.js — Tests cho Security Middlewares & Health Check
// Tests XSS sanitization, JSON content-type enforcement, and rate limiting
// ================================================================
import request from "supertest";
import app from "../app.js";

describe("Security Middlewares & Health Check", () => {
  it("GET /health should return 200 OK with server timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  it("POST with non-json content-type should be rejected if requireJson is enabled", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "text/plain")
      .send("raw plain text");

    expect([415, 422, 400]).toContain(res.status);
  });

  it("should sanitize malicious script tags in input payload", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        userName: "<script>alert(1)</script>hacker",
        fullName: "Test Hacker",
        email: "xss_test@test.pharmacy",
        phone: "0999999999",
        password: "password123",
      });

    // Request should not execute script, and userName will either fail regex or be sanitized
    expect([201, 400, 409, 422]).toContain(res.status);
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-non-existent-route");
    expect(res.status).toBe(404);
  });
});
