/**
 * 💳 PAYMENT METHODS TYPES
 * =========================
 *
 * Type definitions for saved payment methods (cards).
 * PCI-compliant: Never stores raw card data, only Stripe tokens.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

// 💳 Payment Method (from database)
export interface PaymentMethod {
  id: string;
  userId: string;

  // Stripe Integration
  stripePaymentMethodId: string;
  stripeCustomerId: string | null;

  // Card Info (safe to display)
  brand: string; // visa, mastercard, amex, discover, etc.
  last4: string;
  expiryMonth: number;
  expiryYear: number;

  // Metadata
  label: string | null;
  isDefault: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// 💳 Payment Method Creation Input
export interface CreatePaymentMethodInput {
  stripePaymentMethodId: string; // From Stripe Setup Intent
  stripeCustomerId?: string;
  label?: string;
  isDefault?: boolean;
}

// 💳 Payment Method Update Input
export interface UpdatePaymentMethodInput {
  id: string;
  label?: string;
  isDefault?: boolean;
}

// 💳 Payment Methods Query Response
export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
}
