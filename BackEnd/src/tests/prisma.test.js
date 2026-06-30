import { prisma } from "../config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  const bigProductId = BigInt(21);
  const result = await prisma.$queryRaw`
    SELECT
    p.deleted_at as "deletedAt",
    i.quantity
    FROM products p 
    JOIN inventory i on p.product_id = i.product_id
    WHERE p.product_id = ${bigProductId}
  `;

  console.log("Result:", JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
