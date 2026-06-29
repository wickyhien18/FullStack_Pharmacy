import { prisma } from "../config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT
      p.product_id as productId,
      p.name,
      p.slug,
      p.image,
      p.price,
      p.unit,
      p.description,
      p.status,
      p.deleted_at as deletedAt,
      m.name AS manufacturerName,
      i.quantity,
      p.expire_date as expireDate,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'imageUrl', pi.image_url,
            'displayOrder', pi.display_order
          ) ORDER BY pi.display_order ASC
        ) FILTER (WHERE pi.image_id IS NOT NULL),
        '[]'
      ) AS images
    FROM products p
    LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id
    WHERE p.slug = ${"smecta-3g-1782089050368"}
      AND p.deleted_at IS NULL
    GROUP BY p.product_id, m.name, i.quantity
    LIMIT 1
  `;

  const result = rows[0];

  console.log("Result:", JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
