/**
 * 🔧 Transaction Helpers
 * ======================
 *
 * Utilidades para trabajar con transacciones POS.
 *
 * @module pos/utils/transaction.helpers
 * @version 1.0.0
 */

import type {
  POSTransaction,
  POSTransactionType,
  POSPaymentMethod,
} from "../types/models";

// ========================================
// TRANSACTION STATUS
// ========================================

/**
 * Verificar si una transacción puede ser anulada
 */
export function canVoidTransaction(transaction: POSTransaction): boolean {
  // Solo ventas pueden ser anuladas
  if (transaction.type !== "SALE") {
    return false;
  }

  // Verificar que no sea muy antigua (24 horas)
  const hoursSince =
    (Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60);

  return hoursSince <= 24;
}

/**
 * Verificar si una transacción puede ser reembolsada
 */
export function canRefundTransaction(transaction: POSTransaction): boolean {
  // Solo ventas pueden ser reembolsadas
  if (transaction.type !== "SALE") {
    return false;
  }

  // Verificar que no sea muy antigua (30 días)
  const daysSince =
    (Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSince <= 30;
}

/**
 * Verificar si una transacción puede ser impresa
 */
export function canPrintTransaction(transaction: POSTransaction): boolean {
  return true; // Todas las transacciones pueden ser impresas
}

/**
 * Obtener estado de transacción
 */
export function getTransactionStatus(
  transaction: POSTransaction
): "completed" | "voided" | "refunded" {
  switch (transaction.type) {
    case "SALE":
      return "completed";
    case "VOID":
      return "voided";
    case "REFUND":
      return "refunded";
    default:
      return "completed";
  }
}

// ========================================
// TRANSACTION FILTERING
// ========================================

/**
 * Filtrar transacciones por tipo
 */
export function filterByType(
  transactions: POSTransaction[],
  type: POSTransactionType
): POSTransaction[] {
  return transactions.filter((t) => t.type === type);
}

/**
 * Filtrar transacciones por método de pago
 */
export function filterByPaymentMethod(
  transactions: POSTransaction[],
  method: POSPaymentMethod
): POSTransaction[] {
  return transactions.filter((t) => t.paymentMethod === method);
}

/**
 * Filtrar transacciones por rango de fechas
 */
export function filterByDateRange(
  transactions: POSTransaction[],
  startDate: Date,
  endDate: Date
): POSTransaction[] {
  return transactions.filter(
    (t) => t.createdAt >= startDate && t.createdAt <= endDate
  );
}

/**
 * Filtrar transacciones por monto mínimo
 */
export function filterByMinAmount(
  transactions: POSTransaction[],
  minAmount: number
): POSTransaction[] {
  return transactions.filter((t) => t.total >= minAmount);
}

// ========================================
// TRANSACTION CALCULATIONS
// ========================================

/**
 * Calcular total de transacciones
 */
export function calculateTotalAmount(
  transactions: POSTransaction[]
): number {
  return transactions.reduce((sum, t) => sum + t.total, 0);
}

/**
 * Calcular promedio de ticket
 */
export function calculateAverageTicket(
  transactions: POSTransaction[]
): number {
  if (transactions.length === 0) return 0;
  return calculateTotalAmount(transactions) / transactions.length;
}

/**
 * Calcular total de items vendidos
 */
export function calculateTotalItemsSold(
  transactions: POSTransaction[]
): number {
  return transactions.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
}

/**
 * Obtener transacción con mayor monto
 */
export function getHighestTransaction(
  transactions: POSTransaction[]
): POSTransaction | null {
  if (transactions.length === 0) return null;

  return transactions.reduce((max, t) => (t.total > max.total ? t : max));
}

/**
 * Obtener transacción con menor monto
 */
export function getLowestTransaction(
  transactions: POSTransaction[]
): POSTransaction | null {
  if (transactions.length === 0) return null;

  return transactions.reduce((min, t) => (t.total < min.total ? t : min));
}

// ========================================
// TRANSACTION GROUPING
// ========================================

/**
 * Agrupar transacciones por fecha
 */
export function groupByDate(
  transactions: POSTransaction[]
): Record<string, POSTransaction[]> {
  return transactions.reduce(
    (groups, transaction) => {
      const date = transaction.createdAt.toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, POSTransaction[]>
  );
}

/**
 * Agrupar transacciones por método de pago
 */
export function groupByPaymentMethod(
  transactions: POSTransaction[]
): Record<POSPaymentMethod, POSTransaction[]> {
  return transactions.reduce(
    (groups, transaction) => {
      const method = transaction.paymentMethod;
      if (!groups[method]) {
        groups[method] = [];
      }
      groups[method].push(transaction);
      return groups;
    },
    {} as Record<POSPaymentMethod, POSTransaction[]>
  );
}

/**
 * Agrupar transacciones por tipo
 */
export function groupByType(
  transactions: POSTransaction[]
): Record<POSTransactionType, POSTransaction[]> {
  return transactions.reduce(
    (groups, transaction) => {
      const type = transaction.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(transaction);
      return groups;
    },
    {} as Record<POSTransactionType, POSTransaction[]>
  );
}

// ========================================
// TRANSACTION SORTING
// ========================================

/**
 * Ordenar transacciones por fecha (más reciente primero)
 */
export function sortByDateDesc(
  transactions: POSTransaction[]
): POSTransaction[] {
  return [...transactions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Ordenar transacciones por fecha (más antigua primero)
 */
export function sortByDateAsc(
  transactions: POSTransaction[]
): POSTransaction[] {
  return [...transactions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
}

/**
 * Ordenar transacciones por monto (mayor primero)
 */
export function sortByAmountDesc(
  transactions: POSTransaction[]
): POSTransaction[] {
  return [...transactions].sort((a, b) => b.total - a.total);
}

/**
 * Ordenar transacciones por monto (menor primero)
 */
export function sortByAmountAsc(
  transactions: POSTransaction[]
): POSTransaction[] {
  return [...transactions].sort((a, b) => a.total - b.total);
}

// ========================================
// TRANSACTION SEARCH
// ========================================

/**
 * Buscar transacción por número
 */
export function findByTransactionNumber(
  transactions: POSTransaction[],
  transactionNumber: string
): POSTransaction | undefined {
  return transactions.find((t) => t.transactionNumber === transactionNumber);
}

/**
 * Buscar transacciones que contienen un producto
 */
export function findByProductId(
  transactions: POSTransaction[],
  productId: string
): POSTransaction[] {
  return transactions.filter((t) =>
    t.items.some((item) => item.productId === productId)
  );
}

/**
 * Buscar transacciones con monto exacto
 */
export function findByExactAmount(
  transactions: POSTransaction[],
  amount: number
): POSTransaction[] {
  return transactions.filter((t) => Math.abs(t.total - amount) < 0.01);
}

// ========================================
// TRANSACTION VALIDATION
// ========================================

/**
 * Validar que una transacción está completa
 */
export function isTransactionComplete(transaction: POSTransaction): boolean {
  // Verificar que tenga items
  if (!transaction.items || transaction.items.length === 0) {
    return false;
  }

  // Verificar que tenga totales válidos
  if (transaction.total <= 0) {
    return false;
  }

  // Verificar que el pago cubra el total
  if (transaction.amountPaid < transaction.total) {
    return false;
  }

  return true;
}

/**
 * Validar que los totales de una transacción son correctos
 */
export function validateTransactionTotals(
  transaction: POSTransaction
): boolean {
  // Calcular subtotal de items
  const itemsSubtotal = transaction.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  // Verificar que el subtotal coincida (con margen de error por decimales)
  if (Math.abs(itemsSubtotal - transaction.subtotal) > 0.01) {
    return false;
  }

  // Verificar que el total = subtotal + tax - discount
  const expectedTotal =
    transaction.subtotal + transaction.tax - transaction.discount;

  if (Math.abs(expectedTotal - transaction.total) > 0.01) {
    return false;
  }

  return true;
}

// ========================================
// TRANSACTION FORMATTING
// ========================================

/**
 * Formatear número de transacción corto (últimos 4 dígitos)
 */
export function formatShortTransactionNumber(
  transactionNumber: string
): string {
  return transactionNumber.slice(-4);
}

/**
 * Obtener color según tipo de transacción
 */
export function getTransactionTypeColor(type: POSTransactionType): string {
  const colors: Record<POSTransactionType, string> = {
    SALE: "green",
    VOID: "red",
    REFUND: "orange",
  };

  return colors[type] || "gray";
}

/**
 * Obtener icono según método de pago
 */
export function getPaymentMethodIcon(method: POSPaymentMethod): string {
  const icons: Record<POSPaymentMethod, string> = {
    CASH: "💵",
    CARD: "💳",
    TRANSFER: "🏦",
    MIXED: "💰",
  };

  return icons[method] || "💵";
}
