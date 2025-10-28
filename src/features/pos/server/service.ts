"use server";
/**
 * 🏢 POS - Business Logic Service
 * ================================
 *
 * Servicios de lógica de negocio para el módulo POS.
 * Capa intermedia entre queries y actions.
 *
 * @module pos/server/service
 * @version 1.0.0
 */

import * as queries from "./queries";
import * as saleService from "../sale/server/service";
import * as sessionQueries from "../session/server/queries";
import type { POSTransactionType } from "../types/models";

// ========================================
// PRODUCT SERVICES
// ========================================

/**
 * Buscar productos con paginación y filtros
 */
export async function searchProducts(options: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, categoryId, page = 1, pageSize = 20 } = options;

  const offset = (page - 1) * pageSize;

  const products = await queries.getActiveProductsForPOS({
    search,
    categoryId,
    limit: pageSize,
    offset,
  });

  return {
    products,
    page,
    pageSize,
    hasMore: products.length === pageSize,
  };
}

/**
 * Buscar producto por código (barcode scanner)
 */
export async function scanProduct(barcode: string) {
  if (!barcode || barcode.trim() === "") {
    throw new Error("Barcode is required");
  }

  const product = await queries.findProductByBarcode(barcode.trim());

  if (!product) {
    throw new Error(`Product not found: ${barcode}`);
  }

  if (!product.isActive) {
    throw new Error(`Product is inactive: ${product.name}`);
  }

  if (product.stock <= 0) {
    throw new Error(`Product out of stock: ${product.name}`);
  }

  return product;
}

// ========================================
// SESSION SERVICES
// ========================================

/**
 * Validar que el usuario puede abrir una sesión
 */
export async function validateCanOpenSession(userId: string) {
  const activeSession = await sessionQueries.getActiveSessionByUser(userId);

  if (activeSession) {
    return {
      canOpen: false,
      reason: "User already has an active session",
      existingSession: activeSession,
    };
  }

  return {
    canOpen: true,
    reason: null,
    existingSession: null,
  };
}

/**
 * Validar que se puede cerrar la sesión
 */
export async function validateCanCloseSession(sessionId: string) {
  const session = await sessionQueries.getSessionById(sessionId);

  if (!session) {
    return {
      canClose: false,
      reason: "Session not found",
    };
  }

  if (session.status !== "OPEN") {
    return {
      canClose: false,
      reason: `Session is not open: ${session.status}`,
    };
  }

  // Verificar si hay venta activa
  const activeSale = await saleService.getSaleWithSummary(sessionId);

  if (activeSale.sale && activeSale.summary.itemCount > 0) {
    return {
      canClose: false,
      reason: "Cannot close session with active sale. Complete or clear the sale first.",
      activeSale: activeSale,
    };
  }

  return {
    canClose: true,
    reason: null,
  };
}

/**
 * Obtener resumen completo de sesión para cierre
 */
export async function getSessionCloseSummary(sessionId: string) {
  const session = await sessionQueries.getSessionById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const summary = await sessionQueries.calculateSessionSummary(sessionId);
  const transactions = await sessionQueries.getSessionTransactions(sessionId);

  // Calcular efectivo esperado
  const expectedCash =
    Number(session.initialCash) +
    summary.cashSales -
    summary.totalVoids -
    summary.totalRefunds;

  return {
    session,
    summary,
    transactions,
    expectedCash,
    initialCash: Number(session.initialCash),
  };
}

// ========================================
// TRANSACTION SERVICES
// ========================================

/**
 * Obtener detalles de transacción con formato completo
 */
export async function getTransactionDetails(transactionId: string) {
  const transaction = await queries.getTransactionByNumber(transactionId);

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Calcular totales
  const itemCount = transaction.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    transaction,
    itemCount,
    canVoid: transaction.type === "SALE",
    canRefund: transaction.type === "SALE",
  };
}

/**
 * Validar si una transacción puede ser anulada
 */
export async function validateCanVoidTransaction(transactionId: string) {
  const transaction = await queries.getTransactionByNumber(transactionId);

  if (!transaction) {
    return {
      canVoid: false,
      reason: "Transaction not found",
    };
  }

  if (transaction.type !== "SALE") {
    return {
      canVoid: false,
      reason: `Cannot void transaction of type: ${transaction.type}`,
    };
  }

  // Verificar que la transacción no sea muy antigua (ejemplo: máximo 24 horas)
  const hoursSinceTransaction =
    (Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceTransaction > 24) {
    return {
      canVoid: false,
      reason: "Transaction is too old to void (>24 hours)",
    };
  }

  return {
    canVoid: true,
    reason: null,
  };
}

// ========================================
// REPORTING SERVICES
// ========================================

/**
 * Generar reporte de ventas por período
 */
export async function generateSalesReport(options: {
  startDate: Date;
  endDate: Date;
  groupBy?: "day" | "week" | "month";
}) {
  const { startDate, endDate } = options;

  // Obtener todas las transacciones del período
  const transactions = await queries.getRecentTransactions({
    limit: 1000, // Ajustar según necesidad
  });

  // Filtrar por rango de fechas
  const filteredTransactions = transactions.filter(
    (t) => t.createdAt >= startDate && t.createdAt <= endDate
  );

  const sales = filteredTransactions.filter((t) => t.type === "SALE");
  const voids = filteredTransactions.filter((t) => t.type === "VOID");
  const refunds = filteredTransactions.filter((t) => t.type === "REFUND");

  const totalSales = sales.reduce((sum, t) => sum + t.total, 0);
  const totalVoids = voids.reduce((sum, t) => sum + Math.abs(t.total), 0);
  const totalRefunds = refunds.reduce((sum, t) => sum + Math.abs(t.total), 0);
  const netSales = totalSales - totalVoids - totalRefunds;

  const totalTransactions = sales.length;
  const averageTicket = totalTransactions > 0 ? netSales / totalTransactions : 0;

  // Por método de pago
  const cashSales = sales
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + t.total, 0);

  const cardSales = sales
    .filter((t) => t.paymentMethod === "CARD")
    .reduce((sum, t) => sum + t.total, 0);

  const transferSales = sales
    .filter((t) => t.paymentMethod === "TRANSFER")
    .reduce((sum, t) => sum + t.total, 0);

  const mixedSales = sales
    .filter((t) => t.paymentMethod === "MIXED")
    .reduce((sum, t) => sum + t.total, 0);

  return {
    period: {
      startDate,
      endDate,
    },
    totals: {
      totalSales,
      totalVoids,
      totalRefunds,
      netSales,
      totalTransactions,
      averageTicket,
    },
    byPaymentMethod: {
      cash: cashSales,
      card: cardSales,
      transfer: transferSales,
      mixed: mixedSales,
    },
    transactions: filteredTransactions,
  };
}

/**
 * Obtener métricas del dashboard
 */
export async function getDashboardMetrics(userId: string) {
  const dashboardData = await queries.getPOSDashboardData(userId);

  // Calcular métricas adicionales
  const hasActiveSession = dashboardData.activeSession !== null;

  const todayRevenue = dashboardData.dailyStats.netSales;
  const todayTransactions = dashboardData.dailyStats.totalTransactions;

  return {
    ...dashboardData,
    metrics: {
      hasActiveSession,
      todayRevenue,
      todayTransactions,
      averageTicket: dashboardData.dailyStats.averageTicket,
      topProductsCount: dashboardData.topProducts.length,
    },
  };
}

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Validar estado general del POS para operación
 */
export async function validatePOSOperational(sessionId: string) {
  const session = await sessionQueries.getSessionById(sessionId);

  if (!session) {
    return {
      operational: false,
      reason: "Session not found",
    };
  }

  if (session.status !== "OPEN") {
    return {
      operational: false,
      reason: `Session is ${session.status}`,
    };
  }

  return {
    operational: true,
    reason: null,
  };
}
