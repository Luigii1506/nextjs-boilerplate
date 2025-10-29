"use server";
/**
 * ⚡ POS - Consolidated Server Actions
 * ====================================
 *
 * Server Actions consolidadas para el módulo POS.
 * Punto de entrada principal para operaciones del cliente.
 *
 * @module pos/server/actions
 * @version 1.0.0
 */

import { revalidatePath } from "next/cache";
import * as queries from "./queries";
import * as service from "./service";
import type { ActionResult } from "@/shared/types";
import { logger } from "@/shared/utils/logger";

type SearchProductsResult = Awaited<ReturnType<typeof service.searchProducts>>;
type ScanProductResult = Awaited<ReturnType<typeof service.scanProduct>>;
type CategoriesResult = Awaited<
  ReturnType<typeof queries.getActiveCategoriesForPOS>
>;
type DashboardDataResult = Awaited<
  ReturnType<typeof service.getDashboardMetrics>
>;
type DailyStatsResult = Awaited<
  ReturnType<typeof queries.getDailySalesStats>
>;
type RecentTransactionsResult = Awaited<
  ReturnType<typeof queries.getRecentTransactions>
>;
type TransactionDetailsResult = Awaited<
  ReturnType<typeof service.getTransactionDetails>
>;
type TransactionByNumberResult = Awaited<
  ReturnType<typeof service.findTransactionByNumber>
>;
type SalesReportResult = Awaited<
  ReturnType<typeof service.generateSalesReport>
>;
type TopProductsResult = Awaited<
  ReturnType<typeof queries.getTopSellingProducts>
>;
type SessionOpenValidation = Awaited<
  ReturnType<typeof service.validateCanOpenSession>
>;
type SessionCloseValidation = Awaited<
  ReturnType<typeof service.validateCanCloseSession>
>;
type SessionCloseSummary = Awaited<
  ReturnType<typeof service.getSessionCloseSummary>
>;

// ========================================
// PRODUCTS
// ========================================

/**
 * Buscar productos para POS
 */
export async function searchProductsAction(options: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<SearchProductsResult>> {
  try {
    const result = await service.searchProducts(options);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error("POS Actions: search products failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to search products",
    };
  }
}

/**
 * Escanear producto por código de barras
 */
export async function scanProductAction(
  barcode: string
): Promise<ActionResult<ScanProductResult>> {
  try {
    const product = await service.scanProduct(barcode);

    return {
      success: true,
      data: product,
      message: `Product found: ${product.name}`,
    };
  } catch (error) {
    logger.error("POS Actions: scan product failed", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Product not found",
    };
  }
}

/**
 * Obtener categorías activas
 */
export async function getCategoriesAction(): Promise<ActionResult<CategoriesResult>> {
  try {
    const categories = await queries.getActiveCategoriesForPOS();

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    logger.error("POS Actions: get categories failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get categories",
    };
  }
}

// ========================================
// DASHBOARD
// ========================================

/**
 * Obtener datos del dashboard POS
 */
export async function getDashboardDataAction(
  userId: string
): Promise<ActionResult<DashboardDataResult>> {
  try {
    const data = await service.getDashboardMetrics(userId);

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error("POS Actions: get dashboard data failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get dashboard data",
    };
  }
}

/**
 * Obtener estadísticas diarias
 */
export async function getDailyStatsAction(
  date?: Date
): Promise<ActionResult<DailyStatsResult>> {
  try {
    const stats = await queries.getDailySalesStats(date);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    logger.error("POS Actions: get daily stats failed", { error });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get daily stats",
    };
  }
}

// ========================================
// TRANSACTIONS
// ========================================

/**
 * Obtener transacciones recientes
 */
export async function getRecentTransactionsAction(options?: {
  sessionId?: string;
  userId?: string;
  limit?: number;
}): Promise<ActionResult<RecentTransactionsResult>> {
  try {
    const transactions = await queries.getRecentTransactions(options);

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    logger.error("POS Actions: get recent transactions failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recent transactions",
    };
  }
}

/**
 * Obtener detalles de transacción
 */
export async function getTransactionDetailsAction(
  transactionId: string
): Promise<ActionResult<TransactionDetailsResult>> {
  try {
    const details = await service.getTransactionDetails(transactionId);

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    logger.error("POS Actions: get transaction details failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get transaction details",
    };
  }
}

/**
 * Buscar transacción por número
 */
export async function findTransactionByNumberAction(
  transactionNumber: string
): Promise<ActionResult<TransactionByNumberResult>> {
  try {
    const transaction = await queries.getTransactionByNumber(transactionNumber);

    if (!transaction) {
      return {
        success: false,
        error: "Transaction not found",
      };
    }

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    logger.error("POS Actions: find transaction by number failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to find transaction",
    };
  }
}

// ========================================
// REPORTS
// ========================================

/**
 * Generar reporte de ventas
 */
export async function generateSalesReportAction(options: {
  startDate: Date;
  endDate: Date;
  groupBy?: "day" | "week" | "month";
}): Promise<ActionResult<SalesReportResult>> {
  try {
    const report = await service.generateSalesReport(options);

    return {
      success: true,
      data: report,
      message: "Sales report generated successfully",
    };
  } catch (error) {
    logger.error("POS Actions: generate sales report failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate sales report",
    };
  }
}

/**
 * Obtener top productos vendidos
 */
export async function getTopSellingProductsAction(options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<ActionResult<TopProductsResult>> {
  try {
    const topProducts = await queries.getTopSellingProducts(options);

    return {
      success: true,
      data: topProducts,
    };
  } catch (error) {
    logger.error("POS Actions: get top selling products failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get top selling products",
    };
  }
}

// ========================================
// SESSION HELPERS
// ========================================

/**
 * Validar que se puede abrir sesión
 */
export async function validateCanOpenSessionAction(
  userId: string
): Promise<ActionResult<SessionOpenValidation>> {
  try {
    const validation = await service.validateCanOpenSession(userId);

    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    logger.error("POS Actions: validate can open session failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to validate session",
    };
  }
}

/**
 * Validar que se puede cerrar sesión
 */
export async function validateCanCloseSessionAction(
  sessionId: string
): Promise<ActionResult<SessionCloseValidation>> {
  try {
    const validation = await service.validateCanCloseSession(sessionId);

    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    logger.error("POS Actions: validate can close session failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to validate session close",
    };
  }
}

/**
 * Obtener resumen de cierre de sesión
 */
export async function getSessionCloseSummaryAction(
  sessionId: string
): Promise<ActionResult<SessionCloseSummary>> {
  try {
    const summary = await service.getSessionCloseSummary(sessionId);

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    logger.error("POS Actions: get session close summary failed", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get session close summary",
    };
  }
}

// ========================================
// NOTE: Sub-feature actions are exported directly from their modules
// Import them from:
// - ../sale/server/actions
// - ../payment/server/actions
// - ../session/server/actions
// ========================================
