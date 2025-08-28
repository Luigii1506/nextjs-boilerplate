/**
 * 🪝 CHECKOUT HOOKS TYPES
 * =======================
 *
 * TypeScript interfaces for all checkout-related hooks
 */

import {
  CheckoutSession,
  CheckoutStep,
  CustomerInfo,
  Address,
  ShippingMethod,
  PaymentMethod,
  Order,
  OrderCalculation,
  CheckoutMetrics,
} from "./models";
import { CartWithItems } from "@/features/cart/types";

// 🎯 CHECKOUT STATE HOOKS
// =======================

export interface UseCheckoutStateReturn {
  session: CheckoutSession | null;
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  canProceedToNext: boolean;
  canGoBack: boolean;
  isLoading: boolean;
  errors: Record<string, string>;

  // Actions
  setCustomerInfo: (info: CustomerInfo) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setShippingMethod: (methodId: string) => void;
  setPaymentMethod: (methodId: string) => void;
  setCustomerNotes: (notes: string) => void;
  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetCheckout: () => void;
}

// 🚚 SHIPPING HOOKS
// =================

export interface UseShippingReturn {
  shippingMethods: ShippingMethod[];
  selectedMethod: ShippingMethod | null;
  isLoadingMethods: boolean;
  isCalculating: boolean;

  // Actions
  calculateShipping: (address: Address) => Promise<ShippingMethod[]>;
  selectShippingMethod: (methodId: string) => void;
  refreshShippingMethods: () => void;
}

// 💳 PAYMENT HOOKS
// ================

export interface UsePaymentReturn {
  paymentMethods: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  isLoadingMethods: boolean;

  // Actions
  selectPaymentMethod: (methodId: string) => void;
  refreshPaymentMethods: () => void;
}

export interface UseStripePaymentReturn {
  stripe: any; // Stripe instance
  elements: any; // Stripe elements
  isLoading: boolean;
  error: string | null;

  // Actions
  confirmPayment: (
    clientSecret: string
  ) => Promise<{ success: boolean; error?: string }>;
  createPaymentIntent: (orderId: string) => Promise<{ clientSecret: string }>;
}

// 📊 ORDER CALCULATION HOOKS
// ==========================

export interface UseOrderCalculationReturn {
  calculation: OrderCalculation | null;
  isCalculating: boolean;
  error: string | null;

  // Actions
  calculateOrder: (
    cart: CartWithItems,
    shippingAddress?: Address,
    shippingMethodId?: string,
    discountCodes?: string[]
  ) => Promise<OrderCalculation>;
  refreshCalculation: () => void;
}

// 🎯 CHECKOUT ACTIONS HOOKS
// =========================

export interface UseCheckoutActionsReturn {
  // Order creation
  createOrder: (
    session: CheckoutSession,
    cart: CartWithItems
  ) => Promise<Order>;
  processPayment: (
    order: Order,
    paymentData: any
  ) => Promise<{ success: boolean; error?: string }>;
  confirmOrder: (orderId: string) => Promise<Order>;

  // States
  isCreatingOrder: boolean;
  isProcessingPayment: boolean;
  isConfirmingOrder: boolean;

  // Error handling
  lastError: string | null;
  clearError: () => void;
}

// 📈 CHECKOUT ANALYTICS HOOKS
// ===========================

export interface UseCheckoutAnalyticsReturn {
  metrics: CheckoutMetrics | null;

  // Tracking
  trackStepEntered: (step: CheckoutStep) => void;
  trackStepCompleted: (step: CheckoutStep) => void;
  trackError: (step: CheckoutStep, error: string) => void;
  trackAbandonment: (step: CheckoutStep) => void;
  trackConversion: (orderId: string) => void;

  // Analytics
  getConversionFunnel: () => Record<CheckoutStep, number>;
  getAverageCheckoutTime: () => number;
  getMostCommonErrors: () => Array<{ error: string; count: number }>;
}

// 🧮 VALIDATION HOOKS
// ===================

export interface UseCheckoutValidationReturn {
  // Validation functions
  validateCustomerInfo: (info: CustomerInfo) => Record<string, string>;
  validateShippingAddress: (address: Address) => Record<string, string>;
  validateBillingAddress: (address: Address) => Record<string, string>;
  validateStep: (
    step: CheckoutStep,
    session: CheckoutSession
  ) => Record<string, string>;

  // Validation state
  isValid: boolean;
  errors: Record<string, string>;

  // Actions
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
}

// 🎯 CHECKOUT CONTEXT TYPE
// ========================

export interface CheckoutContextType {
  // State
  session: CheckoutSession | null;
  cart: CartWithItems | null;
  calculation: OrderCalculation | null;
  metrics: CheckoutMetrics | null;

  // Current step info
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  canProceedToNext: boolean;
  canGoBack: boolean;

  // Loading states
  isLoading: boolean;
  isCalculating: boolean;
  isCreatingOrder: boolean;
  isProcessingPayment: boolean;

  // Error states
  errors: Record<string, string>;
  lastError: string | null;

  // Shipping
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;

  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;

  // Actions - Step Navigation
  goToStep: (step: CheckoutStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Actions - Data Management
  setCustomerInfo: (info: CustomerInfo) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setShippingMethod: (methodId: string) => void;
  setPaymentMethod: (methodId: string) => void;
  setCustomerNotes: (notes: string) => void;

  // Actions - Process
  calculateOrder: () => Promise<void>;
  createOrder: () => Promise<Order | null>;
  processPayment: (
    paymentData: any
  ) => Promise<{ success: boolean; error?: string }>;
  resetCheckout: () => void;

  // Actions - Error handling
  clearError: () => void;
  clearErrors: () => void;
}
