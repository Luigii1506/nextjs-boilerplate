/**
 * 🏪 POS - Input/Output Types
 * ===========================
 *
 * Types for API inputs and outputs.
 *
 * @module pos/types/inputs
 * @version 1.0.0
 */

import type {
  POSPaymentMethod,
  POSTransactionType,
  POSTransactionStatus,
} from "./models";

// ========================================
// SESSION INPUTS
// ========================================

/**
 * Create POS Session
 */
export interface CreatePOSSessionInput {
  userId: string;
  initialCash: number;
  notes?: string;
}

/**
 * Close POS Session
 */
export interface ClosePOSSessionInput {
  sessionId: string;
  finalCash: number;
  notes?: string;
}

/**
 * Update POS Session
 */
export interface UpdatePOSSessionInput {
  sessionId: string;
  notes?: string;
  status?: "OPEN" | "SUSPENDED";
}

// ========================================
// CART INPUTS
// ========================================

/**
 * Add item to POS cart
 */
export interface AddToPOSCartInput {
  sessionId: string;
  productId: string;
  quantity: number;
  customPrice?: number; // Override price (with permission)
  discount?: number;
}

/**
 * Update cart item
 */
export interface UpdatePOSCartItemInput {
  cartItemId: string;
  quantity?: number;
  discount?: number;
}

/**
 * Remove from cart
 */
export interface RemoveFromPOSCartInput {
  cartItemId: string;
}

/**
 * Clear cart
 */
export interface ClearPOSCartInput {
  sessionId: string;
}

/**
 * Apply cart discount
 */
export interface ApplyCartDiscountInput {
  cartId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  reason?: string;
}

/**
 * Set cart customer
 */
export interface SetCartCustomerInput {
  cartId: string;
  customerId?: string;
  customerName?: string;
}

// ========================================
// TRANSACTION INPUTS
// ========================================

/**
 * Create transaction (checkout)
 */
export interface CreatePOSTransactionInput {
  sessionId: string;
  cartId: string;

  // Customer (optional)
  customerId?: string;
  customerName?: string;
  customerEmail?: string;

  // Payment
  paymentMethod: POSPaymentMethod;
  amountPaid: number;
  paymentReference?: string;

  // Additional
  notes?: string;
}

/**
 * Process refund
 */
export interface ProcessRefundInput {
  transactionId: string;
  reason: string;
  items?: {
    itemId: string;
    quantity: number;
  }[];
  refundAmount?: number; // If partial refund
}

/**
 * Void transaction
 */
export interface VoidTransactionInput {
  transactionId: string;
  reason: string;
}

// ========================================
// SEARCH INPUTS
// ========================================

/**
 * Search products for POS
 */
export interface SearchPOSProductsInput {
  query: string;
  categoryId?: string;
  limit?: number;
  includeOutOfStock?: boolean;
}

/**
 * Get product by barcode/SKU
 */
export interface GetProductByCodeInput {
  code: string; // SKU or barcode
}

// ========================================
// REPORT INPUTS
// ========================================

/**
 * Get session report
 */
export interface GetSessionReportInput {
  sessionId: string;
}

/**
 * Get transactions
 */
export interface GetTransactionsInput {
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: POSTransactionType;
  status?: POSTransactionStatus;
  paymentMethod?: POSPaymentMethod;
  page?: number;
  limit?: number;
}

/**
 * Get dashboard stats
 */
export interface GetPOSDashboardInput {
  userId: string;
  date?: Date;
}

// ========================================
// OUTPUT TYPES
// ========================================

/**
 * Transaction result
 */
export interface TransactionResult {
  transaction: {
    id: string;
    transactionNumber: string;
    total: number;
    changeDue: number;
    paymentMethod: POSPaymentMethod;
  };
  receipt: {
    receiptNumber: string;
    printData: string; // HTML or formatted text for printing
  };
}

/**
 * Session close result
 */
export interface SessionCloseResult {
  session: {
    id: string;
    expectedCash: number;
    finalCash: number;
    difference: number;
  };
  summary: {
    totalTransactions: number;
    totalSales: number;
    totalRefunds: number;
    paymentBreakdown: {
      method: string;
      count: number;
      total: number;
    }[];
  };
}
