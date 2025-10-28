"use server";
/**
 * 🔍 POS - Consolidated Queries
 * ==============================
 *
 * Queries consolidadas para el módulo POS.
 * Centraliza acceso a datos desde sub-features.
 *
 * @module pos/server/queries
 * @version 1.0.0
 */

import { prisma } from "@/core/database/prisma";
import * as mappers from "./mappers";
import type { POSSessionStatus, POSTransactionType } from "../types/models";

// ========================================
// PRODUCTS (for POS catalog)
// ========================================

/**
 * Obtener productos activos para POS
 */
export async function getActiveProductsForPOS(options?: {
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { categoryId, search, limit = 50, offset = 0 } = options || {};

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
    take: limit,
    skip: offset,
  });

  return mappers.mapProductsToCustomer(products);
}

/**
 * Buscar producto por código de barras o SKU
 */
export async function findProductByBarcode(barcode: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ sku: barcode }, { barcode: barcode }],
      isActive: true,
    },
    include: {
      category: true,
    },
  });

  return product ? mappers.mapProductToCustomer(product) : null;
}

/**
 * Obtener categorías activas para POS
 */
export async function getActiveCategoriesForPOS() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
              stock: { gt: 0 },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || "",
    isActive: cat.isActive,
    productCount: cat._count.products,
  }));
}

// ========================================
// SESSION QUERIES
// ========================================

// NOTE: Import session queries directly from:
// import { getActiveSessionByUser, getSessionById } from "@/features/pos/session/server/queries";

// ========================================
// TRANSACTION QUERIES
// ========================================

/**
 * Obtener transacciones recientes del POS
 */
export async function getRecentTransactions(options?: {
  sessionId?: string;
  userId?: string;
  type?: POSTransactionType;
  limit?: number;
  offset?: number;
}) {
  const { sessionId, userId, type, limit = 20, offset = 0 } = options || {};

  const transactions = await prisma.pOSTransaction.findMany({
    where: {
      ...(sessionId ? { sessionId } : {}),
      ...(userId ? { session: { userId } } : {}),
      ...(type ? { type } : {}),
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      session: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });

  return mappers.mapPrismaTransactionsToPOSTransactions(transactions);
}

/**
 * Obtener transacción por número
 */
export async function getTransactionByNumber(transactionNumber: string) {
  const transaction = await prisma.pOSTransaction.findFirst({
    where: { transactionNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      session: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return transaction
    ? mappers.mapPrismaTransactionToPOSTransaction(transaction)
    : null;
}

/**
 * Obtener estadísticas de ventas diarias
 */
export async function getDailySalesStats(date?: Date) {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Total de transacciones del día
  const transactions = await prisma.pOSTransaction.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      items: true,
    },
  });

  const sales = transactions.filter((t) => t.type === "SALE");
  const voids = transactions.filter((t) => t.type === "VOID");
  const refunds = transactions.filter((t) => t.type === "REFUND");

  const totalSales = sales.reduce((sum, t) => sum + Number(t.total), 0);
  const totalVoids = voids.reduce((sum, t) => sum + Math.abs(Number(t.total)), 0);
  const totalRefunds = refunds.reduce(
    (sum, t) => sum + Math.abs(Number(t.total)),
    0
  );
  const netSales = totalSales - totalVoids - totalRefunds;

  const totalTransactions = sales.length;
  const totalItemsSold = sales.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const averageTicket = totalTransactions > 0 ? netSales / totalTransactions : 0;

  // Ventas por método de pago
  const cashSales = sales
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const cardSales = sales
    .filter((t) => t.paymentMethod === "CARD")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const transferSales = sales
    .filter((t) => t.paymentMethod === "TRANSFER")
    .reduce((sum, t) => sum + Number(t.total), 0);

  const mixedSales = sales
    .filter((t) => t.paymentMethod === "MIXED")
    .reduce((sum, t) => sum + Number(t.total), 0);

  return {
    date: targetDate,
    totalSales,
    totalVoids,
    totalRefunds,
    netSales,
    totalTransactions,
    totalItemsSold,
    averageTicket,
    cashSales,
    cardSales,
    transferSales,
    mixedSales,
  };
}

/**
 * Obtener top productos vendidos
 */
export async function getTopSellingProducts(options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const { startDate, endDate, limit = 10 } = options || {};

  // Query para obtener items vendidos en el rango de fechas
  const items = await prisma.pOSTransactionItem.findMany({
    where: {
      transaction: {
        type: "SALE",
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  // Agrupar por producto
  const productMap = new Map<
    string,
    {
      product: any;
      totalQuantity: number;
      totalRevenue: number;
      transactionCount: number;
    }
  >();

  for (const item of items) {
    const existing = productMap.get(item.productId);

    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += Number(item.total);
      existing.transactionCount += 1;
    } else {
      productMap.set(item.productId, {
        product: item.product,
        totalQuantity: item.quantity,
        totalRevenue: Number(item.total),
        transactionCount: 1,
      });
    }
  }

  // Convertir a array y ordenar por cantidad vendida
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit)
    .map((item) => ({
      product: mappers.mapProductToCustomer(item.product),
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
      transactionCount: item.transactionCount,
      averagePrice: item.totalRevenue / item.totalQuantity,
    }));

  return topProducts;
}

// ========================================
// DASHBOARD QUERIES
// ========================================

/**
 * Obtener datos completos del dashboard POS
 */
export async function getPOSDashboardData(userId: string) {
  // Sesión activa
  const activeSession = await getActiveSessionByUser(userId);

  // Stats del día
  const dailyStats = await getDailySalesStats();

  // Top productos
  const topProducts = await getTopSellingProducts({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    limit: 5,
  });

  // Transacciones recientes
  const recentTransactions = await getRecentTransactions({
    userId,
    limit: 10,
  });

  return {
    activeSession: activeSession
      ? mappers.mapPrismaSessionToPOSSession(activeSession)
      : null,
    dailyStats,
    topProducts,
    recentTransactions,
  };
}
