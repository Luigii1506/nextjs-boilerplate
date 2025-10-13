/**
 * 💳 PAYMENT PROCESSING DATA TYPES
 * ================================
 *
 * Specific types for payment data to replace 'any' types.
 * Following project TypeScript patterns.
 *
 * @version 1.0.0 - Payment data types
 */

// 🎯 CORE PAYMENT DATA
// ====================

/**
 * Base payment processing data interface
 */
export interface PaymentProcessingData {
  // Common fields for all payment methods
  amount: number;
  currency: string;
  orderId: string;
  
  // Optional metadata
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Credit/Debit card payment data
 */
export interface CreditCardPaymentData extends PaymentProcessingData {
  type: "credit_card" | "debit_card";
  
  // Card details (tokenized)
  cardToken?: string;
  paymentMethodId?: string;
  
  // Stripe specific
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  
  // 3D Secure
  requiresAction?: boolean;
  confirmationRequired?: boolean;
}

/**
 * PayPal payment data
 */
export interface PayPalPaymentData extends PaymentProcessingData {
  type: "paypal";
  
  // PayPal specific
  paypalOrderId?: string;
  paypalPaymentId?: string;
  paypalPayerId?: string;
  
  // PayPal redirect URLs
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Bank transfer payment data
 */
export interface BankTransferPaymentData extends PaymentProcessingData {
  type: "bank_transfer";
  
  // Bank details
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  
  // Reference
  transferReference?: string;
  instructions?: string;
}

/**
 * Cash on delivery payment data
 */
export interface CashOnDeliveryPaymentData extends PaymentProcessingData {
  type: "cash_on_delivery";
  
  // COD specific
  deliveryFee?: number;
  changeRequired?: number;
  specialInstructions?: string;
}

/**
 * Union type for all payment data types
 */
export type PaymentData = 
  | CreditCardPaymentData
  | PayPalPaymentData
  | BankTransferPaymentData
  | CashOnDeliveryPaymentData;

// 🔄 PAYMENT RESULT TYPES
// =======================

/**
 * Standard payment processing result
 */
export interface PaymentResult {
  success: boolean;
  error?: string;
  requiresAction?: boolean;
  
  // Additional data
  transactionId?: string;
  providerResponse?: Record<string, unknown>;
  
  // Next steps
  redirectUrl?: string;
  confirmationRequired?: boolean;
}

/**
 * Stripe specific payment result
 */
export interface StripePaymentResult extends PaymentResult {
  paymentIntent?: {
    id: string;
    status: string;
    clientSecret?: string;
  };
}

/**
 * PayPal specific payment result
 */
export interface PayPalPaymentResult extends PaymentResult {
  paypalOrderId?: string;
  approvalUrl?: string;
}

// 🧾 VALIDATION TYPES
// ===================

/**
 * Payment validation result
 */
export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}
