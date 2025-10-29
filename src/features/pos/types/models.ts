/**
 * 🏪 POS (Point of Sale) - Core Models
 * =====================================
 *
 * Core entities for the POS system.
 * Similar to storefront but optimized for cashier operations.
 *
 * @module pos/types/models
 * @version 1.0.0
 */

import type { ProductForCustomer } from "../../storefront/types";

// ========================================
// POS SESSION
// ========================================

/**
 * POS Session - Represents a cashier's work session
 */
export interface POSSession {
  id: string;
  userId: string; // Cashier ID
  startTime: Date;
  endTime: Date | null;
  initialCash: number;
  finalCash: number | null;
  expectedCash: number | null;
  cashDifference: number | null; // difference between expected and actual
  status: POSSessionStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum POSSessionStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  SUSPENDED = "SUSPENDED",
}

/**
 * POS Session with relations
 */
export interface POSSessionWithStats extends POSSession {
  totalTransactions: number;
  totalSales: number;
  totalRefunds: number;
  cashTransactions: number;
  cardTransactions: number;
  otherTransactions: number;
}

// ========================================
// POS TRANSACTION
// ========================================

/**
 * POS Transaction - Represents a completed sale
 */
export interface POSTransaction {
  id: string;
  sessionId: string;
  transactionNumber: string; // e.g., "POS-20250128-001"
  type: POSTransactionType;
  status: POSTransactionStatus;

  // Customer info (optional)
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;

  // Items
  items: POSTransactionItem[];

  // Amounts
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Payment
  paymentMethod: POSPaymentMethod;
  amountPaid: number;
  changeDue: number;
  paymentReference: string | null; // Card reference, transfer ID, etc.

  // Metadata
  notes: string | null;
  cashierId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum POSTransactionType {
  SALE = "SALE",
  REFUND = "REFUND",
  VOID = "VOID",
}

export enum POSTransactionStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum POSPaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSFER = "TRANSFER",
  MIXED = "MIXED", // Multiple payment methods
}

/**
 * POS Transaction Item
 */
export interface POSTransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  total: number;
}

/**
 * POS Transaction with relations
 */
export interface POSTransactionWithDetails extends POSTransaction {
  session: POSSession;
  cashier: {
    id: string;
    name: string | null;
    email: string;
  };
  customer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// ========================================
// POS CART
// ========================================

/**
 * POS Cart - Active cart for current transaction
 * Persisted in dedicated POS tables (isolated from the storefront cart).
 */
export interface POSCart {
  id: string;
  sessionId: string | null;
  status: POSCartStatus;
  items: POSCartItem[];
  subtotal: number;
  discount: number;
  fees: number;
  tax: number;
  total: number;

  // Customer (optional)
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;

  // Metadata
  adjustments: POSCartAdjustment[];
  expiresAt: Date;
  deviceId: string | null;
  locationId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum POSCartStatus {
  ACTIVE = "ACTIVE",
  CHECKED_OUT = "CHECKED_OUT",
  ABANDONED = "ABANDONED",
  TRANSFERRED = "TRANSFERRED",
}

/**
 * POS Cart Item
 */
export interface POSCartItem {
  id: string;
  cartId: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  metadata?: Record<string, unknown>;

  // Product info (for display)
  product?: ProductForCustomer;
}

/**
 * POS Cart with computed values
 */
export interface POSCartWithComputed extends POSCart {
  itemCount: number;
  hasItems: boolean;
  canCheckout: boolean;
}

export interface POSCartAdjustment {
  id: string;
  cartId: string;
  type: POSCartAdjustmentType;
  label: string | null;
  amount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export enum POSCartAdjustmentType {
  DISCOUNT_PERCENTAGE = "DISCOUNT_PERCENTAGE",
  DISCOUNT_FIXED = "DISCOUNT_FIXED",
  SURCHARGE = "SURCHARGE",
  SERVICE_FEE = "SERVICE_FEE",
  TAX_OVERRIDE = "TAX_OVERRIDE",
}

// ========================================
// POS PRODUCT
// ========================================

/**
 * Product optimized for POS display
 * Extends ProductForCustomer with POS-specific fields
 */
export interface POSProduct extends ProductForCustomer {
  // POS-specific computed fields
  isAvailable: boolean;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  canSell: boolean;
}

// ========================================
// POS DASHBOARD/STATS
// ========================================

/**
 * POS Dashboard statistics
 */
export interface POSDashboardStats {
  // Current session
  currentSession: POSSessionWithStats | null;

  // Today's stats
  todaySales: number;
  todayTransactions: number;
  todayRefunds: number;

  // Payment method breakdown
  cashSales: number;
  cardSales: number;
  otherSales: number;

  // Top products
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    total: number;
  }[];

  // Hourly breakdown
  hourlySales: {
    hour: number;
    sales: number;
    transactions: number;
  }[];
}

/**
 * POS Session Summary (for end of shift)
 */
export interface POSSessionSummary {
  session: POSSessionWithStats;
  transactions: POSTransaction[];
  paymentBreakdown: {
    method: POSPaymentMethod;
    count: number;
    total: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    total: number;
  }[];
}

// ========================================
// RECEIPT
// ========================================

/**
 * Receipt data for printing
 */
export interface POSReceipt {
  transaction: POSTransaction;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  cashierName: string;
  printDate: Date;
  receiptNumber: string;
}
