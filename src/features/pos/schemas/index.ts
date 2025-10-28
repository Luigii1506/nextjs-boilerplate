/**
 * 🏪 POS - Zod Validation Schemas
 * ================================
 *
 * All validation schemas for POS operations.
 *
 * @module pos/schemas
 * @version 1.0.0
 */

import { z } from "zod";

// ========================================
// ID VALIDATION HELPERS
// ========================================

// Better-auth uses CUID format, not UUID
// CUID pattern: starts with 'c', followed by alphanumeric characters
const cuidPattern = /^c[a-z0-9]{24,}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Helper to validate IDs (supports both CUID and UUID formats)
 */
const idValidator = (fieldName: string = "ID") =>
  z.string().min(1, `${fieldName} is required`).refine(
    (val) => cuidPattern.test(val) || uuidPattern.test(val),
    `Invalid ${fieldName} format`
  );

// ========================================
// ENUM SCHEMAS
// ========================================

export const POSSessionStatusSchema = z.enum(["OPEN", "CLOSED", "SUSPENDED"]);

export const POSTransactionTypeSchema = z.enum(["SALE", "REFUND", "VOID"]);

export const POSTransactionStatusSchema = z.enum([
  "COMPLETED",
  "PENDING",
  "CANCELLED",
  "REFUNDED",
]);

export const POSPaymentMethodSchema = z.enum([
  "CASH",
  "CARD",
  "TRANSFER",
  "MIXED",
]);

// ========================================
// SESSION SCHEMAS
// ========================================

export const CreatePOSSessionSchema = z.object({
  userId: idValidator("User ID"),
  initialCash: z
    .number()
    .min(0, "Initial cash must be non-negative")
    .max(1000000, "Initial cash amount too large"),
  notes: z.string().optional(),
});

export const ClosePOSSessionSchema = z.object({
  sessionId: idValidator("Session ID"),
  finalCash: z
    .number()
    .min(0, "Final cash must be non-negative")
    .max(1000000, "Final cash amount too large"),
  notes: z.string().optional(),
});

export const UpdatePOSSessionSchema = z.object({
  sessionId: idValidator("Session ID"),
  notes: z.string().optional(),
  status: z.enum(["OPEN", "SUSPENDED"]).optional(),
});

// ========================================
// CART SCHEMAS
// ========================================

export const AddToPOSCartSchema = z.object({
  sessionId: idValidator("Session ID"),
  productId: idValidator("Product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity too large"),
  customPrice: z.number().positive("Price must be positive").optional(),
  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
});

export const UpdatePOSCartItemSchema = z.object({
  cartItemId: idValidator("Cart item ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity too large")
    .optional(),
  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
});

export const RemoveFromPOSCartSchema = z.object({
  cartItemId: idValidator("Cart item ID"),
});

export const ClearPOSCartSchema = z.object({
  sessionId: idValidator("Session ID"),
});

export const ApplyCartDiscountSchema = z.object({
  cartId: idValidator("Cart ID"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Discount must be non-negative"),
  reason: z.string().optional(),
});

export const SetCartCustomerSchema = z.object({
  cartId: idValidator("Cart ID"),
  customerId: idValidator("Customer ID").optional(),
  customerName: z
    .string()
    .min(1, "Customer name required")
    .max(100, "Customer name too long")
    .optional(),
});

// ========================================
// TRANSACTION SCHEMAS
// ========================================

export const CreatePOSTransactionSchema = z.object({
  sessionId: idValidator("Session ID"),
  cartId: idValidator("Cart ID"),

  // Customer (optional)
  customerId: idValidator("Customer ID").optional(),
  customerName: z
    .string()
    .min(1, "Customer name required")
    .max(100, "Customer name too long")
    .optional(),
  customerEmail: z
    .string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .optional(),

  // Payment
  paymentMethod: POSPaymentMethodSchema,
  amountPaid: z
    .number()
    .positive("Amount paid must be positive")
    .max(1000000, "Amount too large"),
  paymentReference: z
    .string()
    .max(100, "Payment reference too long")
    .optional(),

  // Additional
  notes: z.string().max(500, "Notes too long").optional(),
});

export const ProcessRefundSchema = z.object({
  transactionId: idValidator("Transaction ID"),
  reason: z
    .string()
    .min(1, "Refund reason required")
    .max(500, "Reason too long"),
  items: z
    .array(
      z.object({
        itemId: idValidator("Item ID"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1"),
      })
    )
    .optional(),
  refundAmount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(),
});

export const VoidTransactionSchema = z.object({
  transactionId: idValidator("Transaction ID"),
  reason: z
    .string()
    .min(1, "Void reason required")
    .max(500, "Reason too long"),
});

// ========================================
// SEARCH SCHEMAS
// ========================================

export const SearchPOSProductsSchema = z.object({
  query: z
    .string()
    .min(1, "Search query required")
    .max(100, "Search query too long"),
  categoryId: idValidator("Category ID").optional(),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20)
    .optional(),
  includeOutOfStock: z.boolean().default(false).optional(),
});

export const GetProductByCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Product code required")
    .max(50, "Product code too long"),
});

// ========================================
// REPORT SCHEMAS
// ========================================

export const GetSessionReportSchema = z.object({
  sessionId: idValidator("Session ID"),
});

export const GetTransactionsSchema = z.object({
  sessionId: idValidator("Session ID").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: POSTransactionTypeSchema.optional(),
  status: POSTransactionStatusSchema.optional(),
  paymentMethod: POSPaymentMethodSchema.optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
});

export const GetPOSDashboardSchema = z.object({
  userId: idValidator("User ID"),
  date: z.coerce.date().optional(),
});

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Validate if amount paid is sufficient for total
 */
export function validatePaymentAmount(amountPaid: number, total: number): boolean {
  return amountPaid >= total;
}

/**
 * Calculate change due
 */
export function calculateChangeDue(amountPaid: number, total: number): number {
  const change = amountPaid - total;
  return Math.max(0, Math.round(change * 100) / 100);
}

/**
 * Validate session is open
 */
export function validateSessionOpen(status: string): boolean {
  return status === "OPEN";
}

/**
 * Generate transaction number
 * Format: POS-YYYYMMDD-XXX
 */
export function generateTransactionNumber(sequenceNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const sequence = String(sequenceNumber).padStart(3, "0");

  return `POS-${year}${month}${day}-${sequence}`;
}

/**
 * Generate receipt number
 * Format: REC-YYYYMMDD-XXX
 */
export function generateReceiptNumber(sequenceNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const sequence = String(sequenceNumber).padStart(3, "0");

  return `REC-${year}${month}${day}-${sequence}`;
}

// ========================================
// TYPE EXPORTS
// ========================================

export type CreatePOSSessionInput = z.infer<typeof CreatePOSSessionSchema>;
export type ClosePOSSessionInput = z.infer<typeof ClosePOSSessionSchema>;
export type UpdatePOSSessionInput = z.infer<typeof UpdatePOSSessionSchema>;
export type AddToPOSCartInput = z.infer<typeof AddToPOSCartSchema>;
export type UpdatePOSCartItemInput = z.infer<typeof UpdatePOSCartItemSchema>;
export type RemoveFromPOSCartInput = z.infer<typeof RemoveFromPOSCartSchema>;
export type ClearPOSCartInput = z.infer<typeof ClearPOSCartSchema>;
export type ApplyCartDiscountInput = z.infer<typeof ApplyCartDiscountSchema>;
export type SetCartCustomerInput = z.infer<typeof SetCartCustomerSchema>;
export type CreatePOSTransactionInput = z.infer<typeof CreatePOSTransactionSchema>;
export type ProcessRefundInput = z.infer<typeof ProcessRefundSchema>;
export type VoidTransactionInput = z.infer<typeof VoidTransactionSchema>;
export type SearchPOSProductsInput = z.infer<typeof SearchPOSProductsSchema>;
export type GetProductByCodeInput = z.infer<typeof GetProductByCodeSchema>;
export type GetSessionReportInput = z.infer<typeof GetSessionReportSchema>;
export type GetTransactionsInput = z.infer<typeof GetTransactionsSchema>;
export type GetPOSDashboardInput = z.infer<typeof GetPOSDashboardSchema>;
