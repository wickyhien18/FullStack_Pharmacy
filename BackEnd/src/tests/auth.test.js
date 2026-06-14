// ================================================================
// auth.test.js — Integration tests cho Auth API
// Integration tests for Auth API
//
// Chạy / Run: npm test
//
// Lưu ý / Note:
//   - Test chạy trên DB thật — cần có ROLE_CUSTOMER trong DB
//   - Tests run on real DB — need ROLE_CUSTOMER in DB
//   - SQL: INSERT INTO roles (role_name) VALUES ('ROLE_CUSTOMER') ON CONFLICT DO NOTHING;
//   - afterAll xoá data test để không ảnh hưởng dữ liệu thật
//   - afterAll cleans up test data to not pollute real data
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

// Chạy trước tất cả test / Run before all tests
beforeAll(async () => {
  await prisma.$connect();
});

// Chạy sau tất cả test — dọn dẹp / Run after all tests — cleanup
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: "@test.pharmacy" } },
  });
  await prisma.$disconnect();
});

// ── REGISTER ──────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  const validUser = {
    userName: "testuser_jest",
    fullName: "Test User Jest",
    email: "test_jest@test.pharmacy",
    phone: "0911111111",
    password: "password123",
  };

  it("should register successfully with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Không trả về password / Should not return password
    expect(res.body.data?.user?.password).toBeUndefined();
  });

  it("should return 409 if email already exists", async () => {
    // Gửi lại cùng email / Send same email again
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
        userName: "other_user",
      });

    expect(res.status).toBe(422);
  });

  it("should return 422 if password too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        password: "123",
        phone: "0933333333",
        userName: "another_user",
      });

    expect(res.status).toBe(422);
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test_jest@test.pharmacy", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Phải có accessToken / Must have accessToken
    expect(res.body.data.accessToken).toBeDefined();
    // Phải set cookie refreshToken / Must set refreshToken cookie
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test_jest@test.pharmacy", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.pharmacy", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("should NOT reveal which field is wrong (security)", async () => {
    const wrongEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.pharmacy", password: "password123" });

    const wrongPass = await request(app)
      .post("/api/auth/login")
      .send({ email: "test_jest@test.pharmacy", password: "wrongpassword" });

    // Cả 2 phải cùng message — không tiết lộ cái nào sai
    // Both must have same message — don't reveal which is wrong
    expect(wrongEmail.body.message).toBe(wrongPass.body.message);
  });
});

// ── PROFILE ───────────────────────────────────────────────────────
describe("GET /api/auth/profile", () => {
  let accessToken = "";

  // Login trước mỗi test để lấy token / Login before each test to get token
  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test_jest@test.pharmacy", password: "password123" });
    accessToken = res.body.data?.accessToken;
  });

  it("should return profile with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("test_jest@test.pharmacy");
    expect(res.body.data.password).toBeUndefined();
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer this.is.invalid");
    expect(res.status).toBe(401);
  });
});
