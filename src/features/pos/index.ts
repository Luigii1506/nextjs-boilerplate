/**
 * 🏪 POS MODULE - MAIN EXPORTS
 * ============================
 *
 * Barrel export principal del módulo POS.
 * Punto de entrada único para importar desde otros módulos.
 *
 * @module pos
 * @version 1.0.0
 */

// ========================================
// CORE TYPES
// ========================================

export type {
  POSSession,
  POSSessionStatus,
  POSTransaction,
  POSTransactionItem,
  POSTransactionType,
  POSPaymentMethod,
  POSCart,
  POSCartItem,
} from "./types/models";

export type {
  CreatePOSSessionInput,
  ClosePOSSessionInput,
  CreatePOSTransactionInput,
  POSTransactionItemInput,
  AddToPOSCartInput,
  UpdatePOSCartItemInput,
} from "./types/inputs";

export type {
  POSProductQueryOptions,
  POSTransactionQueryOptions,
  UsePOSDataResult,
} from "./types/queries";

// ========================================
// SCHEMAS
// ========================================

export {
  CreatePOSSessionSchema,
  ClosePOSSessionSchema,
  CreatePOSTransactionSchema,
  AddToPOSCartSchema,
  UpdatePOSCartItemSchema,
  generateTransactionNumber,
  calculateChangeDue,
} from "./schemas";

// ========================================
// SUB-FEATURES
// ========================================

// Sale (cart for POS)
export {
  // Types
  type POSSaleItem,
  type POSSaleItemWithProduct,
  type POSSaleSummary,
  type POSSaleState,
  type POSSaleContextValue,
  // Context & Hooks
  SaleProvider,
  useSale,
  // Actions
  getActiveSaleAction,
  addToSaleAction,
  updateSaleQuantityAction,
  removeFromSaleAction,
  clearSaleAction,
  applyDiscountAction,
  validateSaleForCheckoutAction,
} from "./sale";

// Payment
export {
  // Types
  type POSPaymentState,
  type PaymentMethodInfo,
  type ProcessPaymentInput,
  type MixedPaymentInput,
  type ProcessPaymentResult,
  type POSTransactionResult,
  type POSPaymentContextValue,
  PAYMENT_METHODS,
  validatePaymentInput,
  calculateChange,
  // Context & Hooks
  PaymentProvider,
  usePayment,
  // Actions
  processPaymentAction,
  getTransactionAction,
  voidTransactionAction,
} from "./payment";

// Session
export {
  // Hooks
  usePOSSession,
  type UsePOSSessionOptions,
  type UsePOSSessionReturn,
  // Actions
  getActiveSessionAction,
  getSessionAction,
  getSessionWithSummaryAction,
  openSessionAction,
  closeSessionAction,
  suspendSessionAction,
  resumeSessionAction,
  getSessionHistoryAction,
  getSessionTransactionsAction,
} from "./session";

// ========================================
// SERVER LAYER (consolidated)
// ========================================

export {
  // Actions
  searchProductsAction,
  scanProductAction,
  getCategoriesAction,
  getDashboardDataAction,
  getDailyStatsAction,
  getRecentTransactionsAction,
  getTransactionDetailsAction,
  findTransactionByNumberAction,
  generateSalesReportAction,
  getTopSellingProductsAction,
  validateCanOpenSessionAction,
  validateCanCloseSessionAction,
  getSessionCloseSummaryAction,
} from "./server/actions";

// ========================================
// NOTE: Server queries, service, and mappers are internal
// Use server actions for client-side operations
// Direct imports only for server-side usage:
// - import { ... } from "@/features/pos/server/queries"
// - import { ... } from "@/features/pos/server/service"
// - import { ... } from "@/features/pos/server/mappers"
// ========================================
