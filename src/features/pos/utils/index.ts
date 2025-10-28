/**
 * 🛠️ POS UTILS - EXPORTS
 * ======================
 *
 * Barrel export para utilidades del módulo POS.
 *
 * @module pos/utils
 * @version 1.0.0
 */

// ========================================
// CLIENT-SIDE FORMATTERS
// ========================================

export {
  formatCurrency,
  formatTransactionDate,
  formatShortTransactionNumber as formatShortTransactionNumberClient,
} from "./formatters.client";

// ========================================
// RECEIPT FORMATTER
// ========================================

export {
  formatReceipt,
  formatReceiptSimple,
  formatReceiptHTML,
  formatReceiptJSON,
  type ReceiptConfig,
  type ReceiptData,
} from "./receipt.formatter";

// ========================================
// TRANSACTION HELPERS
// ========================================

export {
  // Status
  canVoidTransaction,
  canRefundTransaction,
  canPrintTransaction,
  getTransactionStatus,
  // Filtering
  filterByType,
  filterByPaymentMethod,
  filterByDateRange,
  filterByMinAmount,
  // Calculations
  calculateTotalAmount,
  calculateAverageTicket,
  calculateTotalItemsSold,
  getHighestTransaction,
  getLowestTransaction,
  // Grouping
  groupByDate,
  groupByPaymentMethod,
  groupByType,
  // Sorting
  sortByDateDesc,
  sortByDateAsc,
  sortByAmountDesc,
  sortByAmountAsc,
  // Search
  findByTransactionNumber,
  findByProductId,
  findByExactAmount,
  // Validation
  isTransactionComplete,
  validateTransactionTotals,
  // Formatting
  formatShortTransactionNumber,
  getTransactionTypeColor,
  getPaymentMethodIcon,
} from "./transaction.helpers";

// ========================================
// PAYMENT CALCULATOR
// ========================================

export {
  // Tax calculations
  calculateTax,
  calculateSubtotalFromTotal,
  calculateIncludedTax,
  // Discount calculations
  applyPercentageDiscount,
  calculatePercentageDiscount,
  applyFixedDiscount,
  calculateDiscountPercentage,
  validateDiscount,
  // Change calculations
  calculateChange,
  calculateChangeDenominations,
  roundToNearest,
  // Split payment
  validateMixedPayment,
  calculateMixedPaymentDistribution,
  // Item calculations
  calculateItemTotal,
  calculateItemsSubtotal,
  distributeDiscountAcrossItems,
  // Summary calculations
  calculateSaleSummary,
  recalculateWithDiscount,
  // Rounding helpers
  round2,
  roundToInteger,
  roundUp,
  roundDown,
} from "./payment.calculator";
