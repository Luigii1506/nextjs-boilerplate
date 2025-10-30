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
  POSCartAdjustment,
  POSCartAdjustmentType,
  POSCartStatus,
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
  useSaleAdjustments,
  useSaleSummary,
  useSaleMetrics,
  useSaleStatus,
  useSaleSessionId,
  useSaleInitializer,
  type SaleState,
} from "./sale/state/sale.store";

// ========================================
// SALE DOMAIN (Actions & Types)
// ========================================

export {
  type POSSaleItem,
  type POSSaleItemWithProduct,
  type POSSaleSummary,
  type POSSaleAdjustment,
  type POSSaleState,
  getActiveSaleAction,
  addToSaleAction,
  updateSaleQuantityAction,
  removeFromSaleAction,
  clearSaleAction,
  applyDiscountAction,
  validateSaleForCheckoutAction,
} from "./sale";

// ========================================
// PAYMENT DOMAIN (Store + Actions)
// ========================================

export {
  type POSPaymentState,
  type PaymentMethodInfo,
  type ProcessPaymentInput,
  type MixedPaymentInput,
  type ProcessPaymentResult,
  type POSTransactionResult,
  PAYMENT_METHODS,
  validatePaymentInput,
  calculateChange,
  usePaymentStore,
  usePaymentState,
  usePaymentStatus,
  usePaymentProcessing,
  usePaymentComplete,
  usePaymentError,
  usePaymentStoreActions,
  usePaymentActions,
  usePaymentFacade,
  useCurrentTransaction,
  useChangeDue,
  useCanProcessPayment,
  processPaymentAction,
  getTransactionAction,
  voidTransactionAction,
} from "./payment";

// ========================================
// SESSION DOMAIN (Server Actions)
// ========================================

export {
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
