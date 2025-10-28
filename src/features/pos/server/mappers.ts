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
  return {
    id: item.id,
    productId: item.productId,
    productSku: item.product.sku,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discount: Number(item.discount || 0),
    subtotal: Number(item.subtotal),
    total: Number(item.total),
    addedAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: mapProductToCustomer(item.product),
  };
}

/**
 * Mapear cart completo a sale con items
 */
export function mapCartToSale(cart: any) {
  return {
    id: cart.id,
    sessionId: cart.sessionId,
    items: cart.items ? cart.items.map(mapCartItemToSaleItem) : [],
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
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
