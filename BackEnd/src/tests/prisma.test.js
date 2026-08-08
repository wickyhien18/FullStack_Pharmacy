// ================================================================
// prisma.test.js — Integration tests cho Prisma ORM Database Connection & Models
// Tests database connectivity, queries, schema sanity, and soft delete integrity
// ================================================================
import { prisma } from "../config/prisma.config.js";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Prisma ORM & Database Layer", () => {
  it("should successfully ping and execute query on PostgreSQL database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(Number(result[0].connected)).toBe(1);
  });

  it("should have standard roles seeded in database", async () => {
    const roles = await prisma.role.findMany();
    expect(Array.isArray(roles)).toBe(true);
    const roleNames = roles.map((r) => r.roleName);
    expect(roleNames).toContain("ROLE_CUSTOMER");
  });

  it("should query products table and respect soft delete filter", async () => {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      take: 5,
    });
    expect(Array.isArray(products)).toBe(true);
    products.forEach((p) => {
      expect(p.deletedAt).toBeNull();
      expect(p.name).toBeDefined();
      expect(p.slug).toBeDefined();
    });
  });

  it("should query categories and count active products", async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should support database transactions", async () => {
    const txResult = await prisma.$transaction(async (tx) => {
      const roleCount = await tx.role.count();
      return { roleCount };
    });
    expect(txResult.roleCount).toBeGreaterThan(0);
  });
});
