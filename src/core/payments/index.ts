/**
 * 💳 PAYMENTS - BARREL EXPORTS
 * ============================
 *
 * Centralized exports for payment infrastructure.
 * Provides a clean API for features to consume payment services.
 *
 * @version 2.0.0 - Core Infrastructure
 */

// 🎯 STRIPE CLIENT (Browser)
export { getStripeClient, resetStripeClient, isStripeReady } from "./stripe/client";

// 🎯 STRIPE SERVER (Node.js)
export {
  createPaymentIntent,
  retrievePaymentIntent,
  updatePaymentIntent,
  cancelPaymentIntent,
  confirmPaymentIntent,
  createStripeCustomer,
  retrieveStripeCustomer,
  attachPaymentMethod,
  detachPaymentMethod,
  listCustomerPaymentMethods,
  verifyWebhookSignature,
  createRefund,
  type CreatePaymentIntentParams,
  type PaymentIntentResult,
  type CreateCustomerParams,
} from "./stripe/server";

// 🎯 STRIPE CONFIGURATION
export {
  getStripeConfig,
  isStripeConfigured,
  isStripeClientConfigured,
  stripeElementsAppearance,
  stripeElementsDarkAppearance,
  PAYMENT_INTENT_CONFIG,
  dollarsToCents,
  centsToDollars,
  formatStripeAmount,
  getStripeErrorMessage,
  STRIPE_ERROR_MESSAGES,
  STRIPE_API_VERSION,
  STRIPE_WEBHOOK_EVENTS,
  type StripeWebhookEvent,
} from "./stripe/config";

// 🎯 STRIPE TYPES
export * from "./types/stripe";

// 🎯 PAYMENT COMPONENTS
export { StripePaymentForm } from "./components/StripePaymentForm";
export { StripeElementsWrapper } from "./components/StripeElementsWrapper";
export { StripeSetupForm } from "./stripe/components/StripeSetupForm";
export type { StripePaymentFormProps } from "./components/StripePaymentForm";
export type { StripeElementsWrapperProps } from "./components/StripeElementsWrapper";

// 🎯 PAYMENT HOOKS
export {
  useStripePayment,
  type UseStripePaymentOptions,
  type PaymentState,
  type UseStripePaymentReturn,
} from "./hooks/useStripePayment";
