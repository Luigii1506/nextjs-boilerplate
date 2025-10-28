/**
 * 🏪 POS - Query Types
 * ====================
 *
 * Types for queries, filters, and results.
 *
 * @module pos/types/queries
 * @version 1.0.0
 */

import type {
  POSSession,
  POSTransaction,
  POSCart,
  POSProduct,
  POSDashboardStats,
  POSSessionSummary,
  POSTransactionType,
  POSTransactionStatus,
  POSPaymentMethod,
} from "./models";
import type { ProductForCustomer, CategoryForCustomer } from "../../storefront/types";

// ========================================
// QUERY OPTIONS
// ========================================

/**
 * Product query options for POS
 */
export interface POSProductQueryOptions {
  search?: string;
  categoryId?: string;
  inStockOnly?: boolean;
  sortBy?: "name" | "price" | "stock";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Transaction query options
 */
export interface POSTransactionQueryOptions {
  sessionId?: string;
  type?: POSTransactionType;
  status?: POSTransactionStatus;
  paymentMethod?: POSPaymentMethod;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  search?: string; // Search by transaction number
  sortBy?: "date" | "amount" | "number";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Session query options
 */
export interface POSSessionQueryOptions {
  userId?: string;
  status?: "OPEN" | "CLOSED" | "SUSPENDED";
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

// ========================================
// QUERY RESULTS
// ========================================

/**
 * Main POS data query result
 * Similar to UseStorefrontQueryResult
 */
export interface UsePOSDataResult {
  // Current session
  currentSession: POSSession | null;

  // Products (for search/browse)
  products: POSProduct[];
  categories: CategoryForCustomer[];

  // Active cart
  cart: POSCart | null;

  // Recent transactions (today)
  recentTransactions: POSTransaction[];

  // Stats
  stats: POSDashboardStats | null;
}

/**
 * Product search result
 */
export interface POSProductSearchResult {
  products: POSProduct[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Transaction list result
 */
export interface POSTransactionListResult {
  transactions: POSTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Session list result
 */
export interface POSSessionListResult {
  sessions: POSSession[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Session detail result
 */
export interface POSSessionDetailResult {
  session: POSSession;
  summary: POSSessionSummary;
}

// ========================================
// MUTATION RESULTS
// ========================================

/**
 * Cart mutation result
 */
export interface POSCartMutationResult {
  cart: POSCart;
  message: string;
}

/**
 * Transaction mutation result
 */
export interface POSTransactionMutationResult {
  transaction: POSTransaction;
  receipt: {
    receiptNumber: string;
    printData: string;
  };
  message: string;
}

/**
 * Session mutation result
 */
export interface POSSessionMutationResult {
  session: POSSession;
  message: string;
}
