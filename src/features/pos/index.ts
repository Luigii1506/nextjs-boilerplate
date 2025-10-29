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
// STATE MANAGEMENT (ZUSTAND STORES)
// ========================================

// Session Store
export {
  useSessionStore,
  useSessionState,
  useSessionStatus,
  useSessionFlags,
  useSessionActions,
  useIsSessionOpen,
  useHasActiveSession,
  useIsSessionClosed,
  useIsSessionSuspended,
  useSessionStoreFacade,
  type SessionState,
} from "./session/state/session.store";

// Sale Store
export {
  useSaleStore,
  usePOSSale,
  useSaleActions,
  useSaleItems,
  useSaleSummary,
  useSaleMetrics,
  useSaleStatus,
  useSaleSessionId,
  useSaleInitializer,
  type SaleState,
} from "./sale/state/sale.store";

// Payment Store
export {
  usePaymentStore,
  usePaymentState,
  usePaymentStatus,
  usePaymentStoreFacade,
  usePaymentActions,
  useCurrentTransaction,
  usePaymentProcessing,
  usePaymentComplete,
  usePaymentError,
  useChangeDue,
  useCanProcessPayment,
  type PaymentStoreState,
} from "./payment/state/payment.store";

// ========================================
// SUB-FEATURES (LEGACY - For backward compatibility)
// ========================================

// Sale (cart for POS)
export {
  // Types
  type POSSaleItem,
  type POSSaleItemWithProduct,
  type POSSaleSummary,
  type POSSaleState,
  type POSSaleContextValue,
  // Context & Hooks (DEPRECATED - Use useSaleStore instead)
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
  // Context & Hooks (DEPRECATED - Use usePaymentStore instead)
  PaymentProvider,
  usePayment,
  // Actions
  processPaymentAction,
  getTransactionAction,
  voidTransactionAction,
} from "./payment";

// Session
export {
  // Hooks (DEPRECATED - Use useSessionStore instead)
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
