/**
 * Script para limpiar carts duplicados o vencidos
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando carts...\n");

  // 1. Eliminar carts vencidos
  const expiredCarts = await prisma.cart.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`✅ Eliminados ${expiredCarts.count} carts vencidos`);

  // 2. Buscar usuarios con múltiples carts
  const allCarts = await prisma.cart.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc", // Los más recientes primero
    },
  });

  const cartsByUser = new Map<string, typeof allCarts>();

  allCarts.forEach((cart) => {
    if (cart.userId) {
      const existing = cartsByUser.get(cart.userId) || [];
      existing.push(cart);
      cartsByUser.set(cart.userId, existing);
    }
  });

  // 3. Para cada usuario con múltiples carts, mantener solo el más reciente
  let duplicatesRemoved = 0;
  for (const [userId, userCarts] of cartsByUser.entries()) {
    if (userCarts.length > 1) {
      console.log(
        `\n⚠️  Usuario ${userId} tiene ${userCarts.length} carts. Manteniendo el más reciente...`
      );

      // Mantener el primero (más reciente), eliminar el resto
      const toDelete = userCarts.slice(1);

      for (const cart of toDelete) {
        console.log(`  🗑️  Eliminando cart ${cart.id} (${cart.items.length} items)`);
        await prisma.cart.delete({
          where: { id: cart.id },
        });
        duplicatesRemoved++;
      }
    }
  }

  console.log(`\n✅ Eliminados ${duplicatesRemoved} carts duplicados`);
  console.log("\n✨ Limpieza completada!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
