/**
 * 🏪 POS - Types Barrel Export
 * =============================
 *
 * Centralized export for all POS TypeScript types.
 *
 * @module pos/types
 * @version 1.0.0
 */

// 🏷️ Core Models
export type {
  POSSession,
  POSSessionWithStats,
  POSTransaction,
  POSTransactionItem,
  POSTransactionWithDetails,
  POSCart,
  POSCartItem,
  POSCartWithComputed,
  POSProduct,
  POSDashboardStats,
  POSSessionSummary,
  POSReceipt,
} from "./models";

// 🏷️ Enums (regular exports, not type-only)
export {
  POSSessionStatus,
  POSTransactionType,
  POSTransactionStatus,
  POSPaymentMethod,
} from "./models";

// 📥 Input Types
export type {
  CreatePOSSessionInput,
  ClosePOSSessionInput,
  UpdatePOSSessionInput,
  AddToPOSCartInput,
  UpdatePOSCartItemInput,
  RemoveFromPOSCartInput,
  ClearPOSCartInput,
  ApplyCartDiscountInput,
  SetCartCustomerInput,
  CreatePOSTransactionInput,
  ProcessRefundInput,
  VoidTransactionInput,
  SearchPOSProductsInput,
  GetProductByCodeInput,
  GetSessionReportInput,
  GetTransactionsInput,
  GetPOSDashboardInput,
  TransactionResult,
  SessionCloseResult,
} from "./inputs";

// 🔍 Query Types
export type {
  POSProductQueryOptions,
  POSTransactionQueryOptions,
  POSSessionQueryOptions,
  UsePOSDataResult,
  POSProductSearchResult,
  POSTransactionListResult,
  POSSessionListResult,
  POSSessionDetailResult,
  POSCartMutationResult,
  POSTransactionMutationResult,
  POSSessionMutationResult,
} from "./queries";

// 🎯 Re-export everything for convenience
export * from "./models";
export * from "./inputs";
export * from "./queries";
