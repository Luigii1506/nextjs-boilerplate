/**
 * 💳 POS PAYMENT SUB-FEATURE - EXPORTS
 * =====================================
 *
 * Barrel export para el sub-feature de pago POS.
 * Similar al patrón de checkout/ en storefront.
 *
 * @module pos/payment
 * @version 1.0.0
 */

// ========================================
// TYPES
// ========================================

export type {
  POSPaymentState,
  PaymentMethodInfo,
  ProcessPaymentInput,
  MixedPaymentInput,
  ProcessPaymentResult,
  POSTransactionResult,
  PaymentValidationResult,
} from "./types";

export { PAYMENT_METHODS, validatePaymentInput, calculateChange } from "./types";

// ========================================
// CONTEXT & HOOKS
// ========================================

export {
  usePaymentStore,
  usePaymentState,
  usePaymentStatus,
  usePaymentProcessing,
  usePaymentComplete,
  usePaymentError,
  usePaymentStoreActions,
  useCurrentTransaction,
  useChangeDue,
  useCanProcessPayment,
  type PaymentStoreState,
} from "./state/payment.store";

export { usePaymentActions, usePaymentFacade } from "./hooks/usePaymentActions";


// ========================================
// SERVER ACTIONS
// ========================================

export {
  processPaymentAction,
  getTransactionAction,
  getRecentTransactionsAction,
  voidTransactionAction,
} from "./server/actions";
