import { prisma } from "../config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  const result = await prisma.$queryRaw`
    SELECT rt.id,
    rt.token,
    rt.expire_at as "expireAt",
    rt.device_info as "deviceInfo",
    u.is_active as "isActive",
    r.role_name
    FROM refresh_tokens rt
    join users u on rt.user_id = u.user_id
    join roles r on u.role_id = r.role_id
    where rt.token = ${"243cac74057e2a2e51e29962e1a92047a050abc7b0e5ccbec605c6e07715a862e6a4191da2c8b338b1ae1ba17e60e7e8d6a0c71e42603ac31ddf0c44ddea90c7"}
      and rt.device_info = ${"Chrome on Linux [7d0c6a299634dcef]"}
  `;

  console.log("Result:", JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
