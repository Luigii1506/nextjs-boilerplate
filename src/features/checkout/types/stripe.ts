/**
 * 💳 STRIPE TYPES
 * ===============
 *
 * TypeScript interfaces for Stripe integration to replace 'any' types.
 * Based on @stripe/stripe-js library types.
 *
 * @version 1.0.0 - Stripe payment types
 */

// 🎯 STRIPE CORE TYPES
// ====================

/**
 * Stripe instance (simplified interface)
 */
export interface StripeInstance {
  confirmPayment: (options: ConfirmPaymentOptions) => Promise<ConfirmPaymentResult>;
  confirmCardPayment: (clientSecret: string, options?: ConfirmCardPaymentOptions) => Promise<ConfirmPaymentResult>;
  createPaymentMethod: (options: CreatePaymentMethodOptions) => Promise<CreatePaymentMethodResult>;
  retrievePaymentIntent: (clientSecret: string) => Promise<PaymentIntentResult>;
}

/**
 * Stripe Elements instance
 */
export interface StripeElements {
  create: (type: ElementType, options?: ElementOptions) => StripeElement;
  getElement: (type: ElementType) => StripeElement | null;
  submit: () => Promise<{ error?: StripeError }>;
}

/**
 * Individual Stripe Element
 */
export interface StripeElement {
  mount: (selector: string | Element) => void;
  unmount: () => void;
  destroy: () => void;
  focus: () => void;
  blur: () => void;
  clear: () => void;
  update: (options: ElementOptions) => void;
  on: (event: string, handler: (event: any) => void) => void;
  off: (event: string, handler?: (event: any) => void) => void;
}

// 🎯 STRIPE OPTIONS & RESULTS
// ===========================

/**
 * Payment confirmation options
 */
export interface ConfirmPaymentOptions {
  elements: StripeElements;
  confirmParams?: {
    return_url?: string;
    payment_method?: PaymentMethodOptions;
  };
  redirect?: 'if_required' | 'always';
}

/**
 * Card payment confirmation options
 */
export interface ConfirmCardPaymentOptions {
  payment_method?: {
    card?: StripeElement;
    billing_details?: BillingDetails;
  };
}

/**
 * Payment method creation options
 */
export interface CreatePaymentMethodOptions {
  type: 'card' | 'sepa_debit' | 'ideal' | 'p24';
  card?: StripeElement;
  billing_details?: BillingDetails;
  metadata?: Record<string, string>;
}

/**
 * Billing details for payment methods
 */
export interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

/**
 * Payment method options for elements
 */
export interface PaymentMethodOptions {
  type?: 'card';
  billing_details?: BillingDetails;
}

/**
 * Element creation options
 */
export interface ElementOptions {
  style?: {
    base?: Record<string, string>;
    complete?: Record<string, string>;
    empty?: Record<string, string>;
    invalid?: Record<string, string>;
  };
  classes?: Record<string, string>;
  hidePostalCode?: boolean;
  iconStyle?: 'default' | 'solid';
  placeholder?: string;
  disabled?: boolean;
}

// 🎯 STRIPE RESULTS & ERRORS
// ===========================

/**
 * Payment confirmation result
 */
export interface ConfirmPaymentResult {
  error?: StripeError;
  paymentIntent?: StripePaymentIntent;
}

/**
 * Payment method creation result
 */
export interface CreatePaymentMethodResult {
  error?: StripeError;
  paymentMethod?: StripePaymentMethod;
}

/**
 * Payment intent retrieval result
 */
export interface PaymentIntentResult {
  error?: StripeError;
  paymentIntent?: StripePaymentIntent;
}

/**
 * Stripe error object
 */
export interface StripeError {
  type: string;
  code?: string;
  message: string;
  param?: string;
  payment_intent?: StripePaymentIntent;
  payment_method?: StripePaymentMethod;
}

/**
 * Stripe Payment Intent
 */
export interface StripePaymentIntent {
  id: string;
  object: 'payment_intent';
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata: Record<string, string>;
  payment_method?: string;
}

/**
 * Stripe Payment Method
 */
export interface StripePaymentMethod {
  id: string;
  object: 'payment_method';
  type: string;
  billing_details: BillingDetails;
  card?: {
    brand: string;
    checks?: Record<string, string>;
    country?: string;
    exp_month: number;
    exp_year: number;
    fingerprint?: string;
    funding: string;
    generated_from?: any;
    last4: string;
    networks?: any;
    three_d_secure_usage?: any;
    wallet?: any;
  };
}

// 🎯 ELEMENT TYPES
// ================

export type ElementType = 
  | 'card' 
  | 'cardNumber' 
  | 'cardExpiry' 
  | 'cardCvc' 
  | 'paymentRequestButton'
  | 'idealBank'
  | 'p24Bank'
  | 'iban';
