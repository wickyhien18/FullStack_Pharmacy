// ================================================================
// cart.test.js — Integration tests cho Cart API
// ================================================================
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.config.js";

let userToken = "";
let testUserId = null;
let testProduct = null;
let createdCartItemId = null;

beforeAll(async () => {
  await prisma.$connect();

  // Find or create test product
  testProduct = await prisma.product.findFirst({
    where: { deletedAt: null, status: "ACTIVE" },
  });

  // Login test user
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "wicky@gmail.com", password: "giaphien_Gmail18" });

  userToken = loginRes.body.data?.accessToken;
  testUserId = loginRes.body.data?.user?.userId;
});

afterAll(async () => {
  // Cleanup test cart items if needed
  if (testUserId) {
    const cart = await prisma.cart.findFirst({
      where: { userId: BigInt(testUserId) },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.cartId },
      });
    }
  }
  await prisma.$disconnect();
});

describe("Cart API", () => {
  it("should return 401 when fetching cart without authentication", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });

  it("should get cart for authenticated user", async () => {
    if (!userToken) return;

    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(typeof res.body.data.totalItems).toBe("number");
    expect(typeof res.body.data.totalPrice).toBe("number");
  });

  it("should return 400 when adding to cart without productId", async () => {
    if (!userToken) return;

    const res = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should add item to cart successfully", async () => {
    if (!userToken || !testProduct) return;

    const res = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: Number(testProduct.productId),
        quantity: 1,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);

    const addedItem = res.body.data.items.find(
      (i) => String(i.productId) === String(testProduct.productId),
    );
    if (addedItem) {
      createdCartItemId = addedItem.cartItemId;
    }
  });

  it("should update cart item quantity", async () => {
    if (!userToken || !createdCartItemId) return;

    const res = await request(app)
      .patch(`/api/cart/items/${createdCartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should remove item from cart", async () => {
    if (!userToken || !createdCartItemId) return;

    const res = await request(app)
      .delete(`/api/cart/items/${createdCartItemId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
