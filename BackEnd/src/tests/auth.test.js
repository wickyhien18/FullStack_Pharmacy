// ================================================================
// auth.test.js — Integration tests cho Auth API
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

const uniqueId = Date.now();
const validUser = {
  userName: `user_${uniqueId}`,
  fullName: "Test User Jest",
  email: `auth_${uniqueId}@test.pharmacy`,
  phone: `09${String(uniqueId).slice(-8)}`,
  password: "Password123!",
};

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: validUser.email },
  });
  await prisma.$disconnect();
});

// ── REGISTER ──────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("should register successfully with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.user?.password).toBeUndefined();
  });

  it("should return 409 if email already exists", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should return 422 if email format is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        email: "not-an-email",
        phone: "0922222222",
        userName: `user_invalid_${uniqueId}`,
      });

    expect(res.status).toBe(422);
  });

  it("should return 422 if password too short or weak", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        password: "123",
        phone: "0933333333",
        userName: `user_weak_${uniqueId}`,
      });

    expect(res.status).toBe(422);
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "WrongPassword123!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody_here@test.pharmacy", password: "Password123!" });

    expect(res.status).toBe(401);
  });

  it("should NOT reveal which field is wrong (security)", async () => {
    const wrongEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody_here@test.pharmacy", password: "Password123!" });

    const wrongPass = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "WrongPassword123!" });

    expect(wrongEmail.body.message).toBe(wrongPass.body.message);
  });
});

// ── PROFILE ───────────────────────────────────────────────────────
describe("GET /api/auth/profile", () => {
  let accessToken = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    accessToken = res.body.data?.accessToken;
  }, 30000);

  it("should return profile with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid.jwt.token");
    expect(res.status).toBe(401);
  });
});
