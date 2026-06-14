
// ================================================================
// admin.test.js — Integration tests cho Admin API
// Lưu ý / Note: cần có ROLE_ADMIN account trong DB
//
// Tạo admin account / Create admin account:
// INSERT INTO roles (role_name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;
// Sau đó / Then: đăng ký 1 user, vào DB đổi role_id thành id của ROLE_ADMIN
// ================================================================
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../config/prisma.js';

let adminToken   = '';
let customerToken = '';

beforeAll(async () => {
  await prisma.$connect();

  // Login với customer account / Login with customer account
  const customerRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test_jest@test.pharmacy', password: 'password123' });
  customerToken = customerRes.body.data?.accessToken;

  // Login với admin account / Login with admin account
  // Thay bằng email admin thật của bạn / Replace with your real admin email
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@pharmacy.com', password: 'admin123456' });
  adminToken = adminRes.body.data?.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ── DASHBOARD STATS ───────────────────────────────────────────────
describe('GET /api/admin/stats', () => {

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('should return 403 for non-admin user', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('should return stats for admin user', async () => {
    if (!adminToken) {
      console.warn('[Test] No admin token — skipping admin tests');
      console.warn('[Test] Create admin: set role_id to ROLE_ADMIN in DB');
      return;
    }

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBeDefined();
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalProducts).toBeDefined();
    expect(res.body.data.totalRevenue).toBeDefined();
  });
});

// ── ADMIN ORDERS ──────────────────────────────────────────────────
describe('GET /api/admin/orders', () => {

  it('should return 403 for non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('should return all orders for admin', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});

// ── UPDATE ORDER STATUS ───────────────────────────────────────────
describe('PATCH /api/admin/orders/:orderId/status', () => {

  it('should return 400 for invalid status', async () => {
    if (!adminToken) return;

    // Lấy order đầu tiên để test / Get first order to test
    const order = await prisma.order.findFirst();
    if (!order) return;

    const res = await request(app)
      .patch(`/api/admin/orders/${order.orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
  });

  it('should update order status successfully', async () => {
    if (!adminToken) return;

    const order = await prisma.order.findFirst({
      where: { orderStatus: 'PENDING' },
    });
    if (!order) return;

    const res = await request(app)
      .patch(`/api/admin/orders/${order.orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(res.body.data.orderStatus).toBe('CONFIRMED');

    // Rollback về PENDING sau khi test / Rollback to PENDING after test
    await prisma.order.update({
      where: { orderId: order.orderId },
      data:  { orderStatus: 'PENDING' },
    });
  });
});

// ── ADMIN USERS ───────────────────────────────────────────────────
describe('GET /api/admin/users', () => {

  it('should return user list for admin', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    // Không trả về password / Should not return passwords
    res.body.data.items.forEach((user) => {
      expect(user.password).toBeUndefined();
    });
  });
});

// ── ADMIN MEDICINES ───────────────────────────────────────────────
describe('GET /api/admin/medicines', () => {

  it('should return medicine list for admin', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/admin/medicines')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
