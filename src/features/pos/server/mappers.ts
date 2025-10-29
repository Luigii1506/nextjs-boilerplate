/**
 * 🗺️ POS - Data Mappers
 * ======================
 *
 * Mappers para transformar datos entre capas (DB -> Domain -> Client).
 * Convierte tipos de Prisma a tipos de dominio.
 *
 * @module pos/server/mappers
 * @version 1.0.0
 */

import type { Product, Category } from "@prisma/client";
import type { ProductForCustomer } from "../../storefront/types";
import type {
  POSSession,
  POSTransaction,
  POSTransactionItem,
  POSPaymentMethod,
  POSTransactionType,
  POSSessionStatus,
} from "../types/models";
import { logger } from "@/shared/utils/logger";

// ========================================
// PRODUCT MAPPERS
// ========================================

/**
 * Mapear producto de Prisma a ProductForCustomer
 */
export function mapProductToCustomer(
  product: Product & { category: Category | null }
): ProductForCustomer {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    sku: product.sku,
    price: Number(product.price),
    stock: product.stock,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description || "",
          isActive: product.category.isActive,
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Mapear múltiples productos
 */
export function mapProductsToCustomer(
  products: (Product & { category: Category | null })[]
): ProductForCustomer[] {
  return products.map(mapProductToCustomer);
}

// ========================================
// SESSION MAPPERS
// ========================================

/**
 * Mapear sesión de Prisma a POSSession
 */
export function mapPrismaSessionToPOSSession(session: any): POSSession {
  return {
    id: session.id,
    userId: session.userId,
    startTime: session.startTime,
    endTime: session.endTime,
    initialCash: Number(session.initialCash),
    finalCash: session.finalCash ? Number(session.finalCash) : null,
    status: session.status as POSSessionStatus,
    notes: session.notes,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    // Include user if present
    user: session.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      : undefined,
  };
}

/**
 * Mapear múltiples sesiones
 */
export function mapPrismaSessionsToPOSSessions(sessions: any[]): POSSession[] {
  return sessions.map(mapPrismaSessionToPOSSession);
}

// ========================================
// TRANSACTION MAPPERS
// ========================================

/**
 * Mapear item de transacción de Prisma
 */
export function mapPrismaTransactionItemToPOSTransactionItem(
  item: any
): POSTransactionItem {
  return {
    id: item.id,
    transactionId: item.transactionId,
    productId: item.productId,
    productSku: item.productSku,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discount: Number(item.discount),
    subtotal: Number(item.subtotal),
    total: Number(item.total),
    // Include product if present
    product: item.product ? mapProductToCustomer(item.product) : undefined,
  };
}

/**
 * Mapear transacción de Prisma a POSTransaction
 */
export function mapPrismaTransactionToPOSTransaction(
  transaction: any
): POSTransaction {
  return {
    id: transaction.id,
    sessionId: transaction.sessionId,
    transactionNumber: transaction.transactionNumber,
    type: transaction.type as POSTransactionType,
    paymentMethod: transaction.paymentMethod as POSPaymentMethod,
    subtotal: Number(transaction.subtotal),
    tax: Number(transaction.tax),
    discount: Number(transaction.discount),
    total: Number(transaction.total),
    amountPaid: Number(transaction.amountPaid),
    changeDue: Number(transaction.changeDue),
    notes: transaction.notes,
    referenceNumber: transaction.referenceNumber,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    // Include items if present
    items: transaction.items
      ? transaction.items.map(mapPrismaTransactionItemToPOSTransactionItem)
      : [],
    // Include session if present
    session: transaction.session
      ? mapPrismaSessionToPOSSession(transaction.session)
      : undefined,
  };
}

/**
 * Mapear múltiples transacciones
 */
export function mapPrismaTransactionsToPOSTransactions(
  transactions: any[]
): POSTransaction[] {
  return transactions.map(mapPrismaTransactionToPOSTransaction);
}

// ========================================
// CART/SALE MAPPERS
// ========================================

/**
 * Mapear cart item a sale item con producto
 */
export function mapCartItemToSaleItem(item: any) {
  const unitPrice = Number(item.unitPrice ?? 0);
  const roundedUnitPrice = Math.round(unitPrice * 100) / 100;
  const quantity = item.quantity ?? 0;
  const total =
    item.total !== undefined && item.total !== null
      ? Number(item.total)
      : unitPrice * quantity;
  const roundedTotal = Math.round(total * 100) / 100;
  const product = item.product ? mapProductToCustomer(item.product) : null;

  return {
    id: item.id,
    productId: item.productId,
    productSku: product?.sku ?? "UNKNOWN",
    productName: product?.name ?? "Producto no disponible",
    quantity,
    unitPrice: roundedUnitPrice,
    discount: 0,
    subtotal: roundedTotal,
    total: roundedTotal,
    addedAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: product ?? undefined,
  };
}

/**
 * Mapear cart completo a sale con items
 */
export function mapCartToSale(cart: any) {
  const items = cart.items ? cart.items.map(mapCartItemToSaleItem) : [];
  const subtotalRaw = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const subtotal = Math.round(subtotalRaw * 100) / 100;
  const taxAmountRaw =
    cart.taxAmount !== undefined && cart.taxAmount !== null
      ? Number(cart.taxAmount)
      : 0;
  const taxAmount = Math.round(taxAmountRaw * 100) / 100;
  const discount = 0;
  const total = Math.round((subtotal + taxAmount - discount) * 100) / 100;

  logger.debug("POS Mapper: map cart to sale", {
    subtotal,
    taxAmount,
    discount,
    total,
    itemsCount: items.length,
  });

  return {
    id: cart.id,
    sessionId: cart.sessionId,
    userId: cart.userId ?? null,
    items,
    subtotal,
    tax: taxAmount,
    discount,
    total,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    expiresAt: cart.expiresAt,
  };
}

export function mapSaleSummary(summary: any) {
  const subtotal = Math.round(Number(summary?.subtotal ?? 0) * 100) / 100;
  const discount = Math.round(Number(summary?.discount ?? 0) * 100) / 100;
  const tax = Math.round(Number(summary?.tax ?? 0) * 100) / 100;
  const total = Math.round(Number(summary?.total ?? 0) * 100) / 100;
  return {
    itemCount: Number(summary?.itemCount ?? 0),
    subtotal,
    discount,
    tax,
    taxRate: Number(summary?.taxRate ?? 0),
    total,
  };
}

// ========================================
// SUMMARY MAPPERS
// ========================================

/**
 * Crear resumen de sesión formateado
 */
export interface FormattedSessionSummary {
  transactionCount: number;
  totalSales: string;
  totalVoids: string;
  totalRefunds: string;
  netSales: string;
  cashSales: string;
  cardSales: string;
  transferSales: string;
  mixedSales: string;
  totalItemsSold: number;
  averageTicket: string;
}

export function formatSessionSummary(summary: any): FormattedSessionSummary {
  return {
    transactionCount: summary.transactionCount,
    totalSales: `$${summary.totalSales.toFixed(2)}`,
    totalVoids: `$${summary.totalVoids.toFixed(2)}`,
    totalRefunds: `$${summary.totalRefunds.toFixed(2)}`,
    netSales: `$${summary.netSales.toFixed(2)}`,
    cashSales: `$${summary.cashSales.toFixed(2)}`,
    cardSales: `$${summary.cardSales.toFixed(2)}`,
    transferSales: `$${summary.transferSales.toFixed(2)}`,
    mixedSales: `$${summary.mixedSales.toFixed(2)}`,
    totalItemsSold: summary.totalItemsSold,
    averageTicket: `$${summary.averageTicket.toFixed(2)}`,
  };
}

/**
 * Formatear precio
 */
export function formatCurrency(amount: number, locale: string = "es-MX"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

/**
 * Formatear fecha para transacciones
 */
export function formatTransactionDate(date: Date, locale: string = "es-MX"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
