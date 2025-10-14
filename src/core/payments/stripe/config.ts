/**
 * 💳 STRIPE CONFIGURATION
 * =======================
 *
 * Centralized Stripe configuration for all payment features.
 * Uses core/config/environment.ts for environment variables.
 *
 * @version 2.0.0 - Core Infrastructure
 */

import { ENV } from "@/core/config/environment";

// 🌍 ENVIRONMENT VARIABLES
// ========================

/**
 * Get Stripe configuration from environment
 */
export const getStripeConfig = () => {
  const config = {
    publishableKey: ENV.stripe.publishableKey,
    secretKey: ENV.stripe.secretKey,
    webhookSecret: ENV.stripe.webhookSecret,
  };

  // Debug log to trace config values
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [getStripeConfig] Called:", {
      hasSecretKey: !!config.secretKey,
      hasPublishableKey: !!config.publishableKey,
      secretKeyPrefix: config.secretKey?.substring(0, 15) || "EMPTY",
      publishableKeyPrefix: config.publishableKey?.substring(0, 15) || "EMPTY",
    });
  }

  return config;
};

/**
 * Check if Stripe is fully configured
 */
export const isStripeConfigured = (): boolean => {
  const config = getStripeConfig();
  const isConfigured = !!(config.publishableKey && config.secretKey);

  // Debug log
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [isStripeConfigured] Result:", {
      isConfigured,
      hasSecretKey: !!config.secretKey,
      hasPublishableKey: !!config.publishableKey,
    });
  }

  return isConfigured;
};

/**
 * Check if Stripe is configured for client-side use
 */
export const isStripeClientConfigured = (): boolean => {
  const config = getStripeConfig();
  return !!config.publishableKey;
};

// 🎯 STRIPE ELEMENTS APPEARANCE
// ==============================

/**
 * Light theme appearance for Stripe Elements
 */
export const stripeElementsAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#2563eb", // blue-600
    colorBackground: "#ffffff",
    colorText: "#1f2937", // gray-800
    colorDanger: "#dc2626", // red-600
    fontFamily: "system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      border: "1px solid #d1d5db", // gray-300
      boxShadow: "none",
      padding: "12px",
    },
    ".Input:focus": {
      border: "2px solid #2563eb", // blue-600
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
    },
    ".Input--invalid": {
      border: "1px solid #dc2626", // red-600
    },
    ".Label": {
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151", // gray-700
      marginBottom: "8px",
    },
  },
};

/**
 * Dark theme appearance for Stripe Elements
 */
export const stripeElementsDarkAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#3b82f6", // blue-500
    colorBackground: "#1f2937", // gray-800
    colorText: "#f9fafb", // gray-50
    colorDanger: "#ef4444", // red-500
    fontFamily: "system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      border: "1px solid #4b5563", // gray-600
      boxShadow: "none",
      padding: "12px",
      backgroundColor: "#111827", // gray-900
    },
    ".Input:focus": {
      border: "2px solid #3b82f6", // blue-500
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
    },
    ".Input--invalid": {
      border: "1px solid #ef4444", // red-500
    },
    ".Label": {
      fontSize: "14px",
      fontWeight: "500",
      color: "#d1d5db", // gray-300
      marginBottom: "8px",
    },
  },
};

// 🎯 PAYMENT INTENT CONFIGURATION
// ================================

/**
 * Default Payment Intent configuration
 */
export const PAYMENT_INTENT_CONFIG = {
  // Capture method: automatic or manual
  capture_method: "automatic" as const,

  // Payment method types to enable
  payment_method_types: ["card"],

  // Payment method options
  payment_method_options: {
    card: {
      request_three_d_secure: "automatic" as const,
    },
  },
};

// 🎯 CURRENCY & AMOUNT UTILITIES
// ===============================

/**
 * Convert dollars to cents for Stripe
 * Stripe requires amounts in cents (smallest currency unit)
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Convert cents to dollars
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

/**
 * Format amount for display
 */
export const formatStripeAmount = (cents: number, currency = "usd"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(centsToDollars(cents));
};

// 🎯 ERROR HANDLING
// =================

/**
 * User-friendly error messages for Stripe errors (Spanish)
 */
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  card_declined: "Tu tarjeta fue rechazada. Por favor, intenta con otra tarjeta.",
  insufficient_funds: "Fondos insuficientes. Por favor, intenta con otra tarjeta.",
  expired_card: "Tu tarjeta ha expirado. Por favor, usa una tarjeta vigente.",
  incorrect_cvc: "El código de seguridad es incorrecto.",
  processing_error: "Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente.",
  incorrect_number: "El número de tarjeta es incorrecto.",

  // Generic errors
  generic_decline: "Tu tarjeta fue rechazada. Por favor, contacta a tu banco.",
  invalid_number: "El número de tarjeta no es válido.",
  invalid_expiry_month: "El mes de vencimiento no es válido.",
  invalid_expiry_year: "El año de vencimiento no es válido.",
  invalid_cvc: "El código de seguridad no es válido.",

  // Rate limiting
  rate_limit: "Demasiados intentos. Por favor, espera un momento e intenta nuevamente.",

  // Authentication
  authentication_required: "Tu banco requiere autenticación adicional para completar el pago.",

  // Default
  default: "Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente.",
};

/**
 * Get user-friendly error message for Stripe error code
 */
export const getStripeErrorMessage = (errorCode?: string): string => {
  if (!errorCode) {
    return STRIPE_ERROR_MESSAGES.default;
  }

  return STRIPE_ERROR_MESSAGES[errorCode] || STRIPE_ERROR_MESSAGES.default;
};

// 🎯 STRIPE API VERSION
// =====================

/**
 * Stripe API version to use
 * Update this when upgrading Stripe API version
 */
export const STRIPE_API_VERSION = "2025-01-27.acacia" as const;

// 🎯 WEBHOOK EVENTS
// =================

/**
 * Stripe webhook events we handle
 */
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
  PAYMENT_INTENT_CANCELED: "payment_intent.canceled",
  CHARGE_SUCCEEDED: "charge.succeeded",
  CHARGE_FAILED: "charge.failed",
  CHARGE_REFUNDED: "charge.refunded",
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  CUSTOMER_DELETED: "customer.deleted",
} as const;

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS];
