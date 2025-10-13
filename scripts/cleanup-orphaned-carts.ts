#!/usr/bin/env tsx
/**
 * 🧹 CLEANUP ORPHANED CARTS SCRIPT
 * ==================================
 *
 * This script cleans up orphaned and problematic carts from the database.
 * Run this script to fix cart issues after refactoring cart logic.
 *
 * Usage:
 *   npx tsx scripts/cleanup-orphaned-carts.ts
 *
 * What it does:
 * 1. Removes empty carts (no items)
 * 2. Removes expired carts
 * 3. Optionally removes all carts for a specific user
 * 4. Shows statistics before/after cleanup
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧹 CART CLEANUP SCRIPT');
  console.log('======================\n');

  try {
    // 1. Get current statistics
    console.log('📊 Current Database State:');
    const totalCarts = await prisma.cart.count();
    const cartsWithItems = await prisma.cart.count({
      where: {
        items: {
          some: {},
        },
      },
    });
    const emptyCarts = totalCarts - cartsWithItems;
    const expiredCarts = await prisma.cart.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`  Total carts: ${totalCarts}`);
    console.log(`  Carts with items: ${cartsWithItems}`);
    console.log(`  Empty carts: ${emptyCarts}`);
    console.log(`  Expired carts: ${expiredCarts}\n`);

    // 2. Clean up empty carts
    console.log('🗑️  Removing empty carts...');
    const deletedEmptyCarts = await prisma.cart.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });
    console.log(`  ✅ Deleted ${deletedEmptyCarts.count} empty carts\n`);

    // 3. Clean up expired carts
    console.log('⏰ Removing expired carts...');
    const deletedExpiredCarts = await prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`  ✅ Deleted ${deletedExpiredCarts.count} expired carts\n`);

    // 4. Show final statistics
    const finalTotalCarts = await prisma.cart.count();
    console.log('📊 Final Database State:');
    console.log(`  Total carts remaining: ${finalTotalCarts}`);
    console.log(`  Total carts removed: ${totalCarts - finalTotalCarts}\n`);

    // 5. Show remaining carts (for debugging)
    if (finalTotalCarts > 0 && finalTotalCarts <= 10) {
      console.log('📋 Remaining Carts:');
      const remainingCarts = await prisma.cart.findMany({
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      for (const cart of remainingCarts) {
        console.log(`\n  Cart ID: ${cart.id}`);
        console.log(`    User ID: ${cart.userId || 'N/A'}`);
        console.log(`    Session ID: ${cart.sessionId || 'N/A'}`);
        console.log(`    Items: ${cart.items.length}`);
        console.log(`    Total: $${(Number(cart.total) / 100).toFixed(2)}`);
        console.log(`    Expires: ${cart.expiresAt.toISOString()}`);

        if (cart.items.length > 0) {
          console.log(`    Products:`);
          for (const item of cart.items) {
            console.log(`      - ${item.product.name} (qty: ${item.quantity})`);
          }
        }
      }
      console.log('');
    }

    console.log('✅ Cleanup completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
