import { prisma } from "../config/prisma.js";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  const result = await prisma.$queryRaw`
    SELECT c.cart_id as cartId,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
        'cartItemId',   ci.cart_item_id,
        'productId',    ci.product_id,
        'itemQuantity', ci.quantity,
        'productName',  p.name,
        'productSlug',  p.slug ,
        'productPrice', p.price,
        'productUnit',  p.unit,
        'productImage', p.image ,
        'inventoryQuantity', i.quantity
        ) ORDER BY ci.cart_item_id ASC
      ), '[]'
    ) as items
    FROM carts c
    LEFT JOIN cart_items ci on c.cart_id = ci.cart_id
    LEFT JOIN products p on p.product_id = ci.product_id
    LEFT JOIN inventory i on i.product_id = p.product_id
    WHERE c.user_id = ${BigInt(2)}
    GROUP BY c.cart_id
  `;

  console.log("Result:", JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
