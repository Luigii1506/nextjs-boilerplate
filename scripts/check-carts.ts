/**
 * Script para verificar y limpiar carts en la base de datos
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando carts en la base de datos...\n");

  // Buscar todos los carts
  const carts = await prisma.cart.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`📊 Total de carts encontrados: ${carts.length}\n`);

  for (const cart of carts) {
    console.log("🛒 Cart:", {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      itemsCount: cart.items.length,
      total: cart.total.toString(),
      expiresAt: cart.expiresAt,
      isExpired: cart.expiresAt < new Date(),
      createdAt: cart.createdAt,
    });

    if (cart.items.length > 0) {
      console.log("  Items:");
      cart.items.forEach((item) => {
        console.log(`    - ${item.product.name} x ${item.quantity}`);
      });
    }
    console.log("");
  }

  // Contar carts por usuario
  const cartsByUser = carts.reduce((acc, cart) => {
    if (cart.userId) {
      acc[cart.userId] = (acc[cart.userId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("\n👥 Carts por usuario:");
  Object.entries(cartsByUser).forEach(([userId, count]) => {
    console.log(`  ${userId}: ${count} cart(s)`);
    if (count > 1) {
      console.log(`    ⚠️  PROBLEMA: Usuario tiene múltiples carts!`);
    }
  });

  // Verificar carts vencidos
  const expiredCarts = carts.filter((cart) => cart.expiresAt < new Date());
  if (expiredCarts.length > 0) {
    console.log(`\n⏰ Carts vencidos: ${expiredCarts.length}`);
    console.log("¿Deseas eliminarlos? (ejecuta: npm run clean-carts)");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
