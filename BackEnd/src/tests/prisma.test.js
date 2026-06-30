import { prisma } from "../config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  const result = await prisma.$queryRaw`
    SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'refresh_tokens';
  `;

  console.log("Result:", JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
