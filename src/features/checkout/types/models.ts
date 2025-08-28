/**
 * 🛒 CHECKOUT MODELS
 * ==================
 *
 * Core types for checkout process, order creation, and payment handling.
 * Integrates with cart, storefront, and inventory modules.
 *
 * @version 1.0.0 - Initial checkout implementation
 */

import { CartWithItems } from "@/features/cart/types";

// 🎯 CHECKOUT PROCESS TYPES
// =========================

export interface CheckoutSession {
  id: string;
  cartId: string;
  userId?: string;
  sessionId?: string;

  // Customer Info
  customerInfo: CustomerInfo;

  // Addresses
  shippingAddress?: Address;
  billingAddress?: Address;

  // Selection
  shippingMethodId?: string;
  paymentMethodId?: string;

  // Notes
  customerNotes?: string;

  // Progress
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];

  // Timestamps
  startedAt: Date;
  expiresAt: Date;
}

export interface CustomerInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type CheckoutStep =
  | "customer-info"
  | "shipping-address"
  | "shipping-method"
  | "payment-method"
  | "review-order"
  | "processing"
  | "completed";

// 📦 ORDER TYPES
// ==============

export interface Order {
  id: string;
  number: string; // Human-readable order number
  customerId?: string;

  // Contact Info
  email: string;
  phone?: string;

  // Financial
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;

  // Dates
  placedAt: Date;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;

  // Shipping Info
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  trackingNumber?: string;

  // Payment Info
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string;

  // Notes
  customerNotes?: string;
  adminNotes?: string;

  // Items
  items: OrderItem[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;

  // Price snapshot (frozen at order time)
  unitPrice: number;
  total: number;

  // Product snapshot (in case product changes)
  productSku: string;
  productName: string;
  productImage?: string;

  createdAt: Date;
}

export type OrderStatus =
  | "PENDING" // Order created, payment pending
  | "CONFIRMED" // Payment confirmed, processing
  | "PROCESSING" // Order being prepared
  | "SHIPPED" // Order shipped
  | "DELIVERED" // Order delivered
  | "CANCELLED" // Order cancelled
  | "REFUNDED"; // Order refunded

export type PaymentStatus =
  | "PENDING" // Payment not processed
  | "PAID" // Payment successful
  | "FAILED" // Payment failed
  | "REFUNDED" // Payment refunded
  | "PARTIALLY_REFUNDED"; // Partial refund

export type FulfillmentStatus =
  | "UNFULFILLED" // Not yet fulfilled
  | "PARTIALLY_FULFILLED" // Some items fulfilled
  | "FULFILLED" // All items fulfilled
  | "SHIPPED" // Items shipped
  | "DELIVERED"; // Items delivered

// 🚚 SHIPPING TYPES
// ================

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  isActive: boolean;
  provider?: string;
  trackingEnabled: boolean;
}

export interface ShippingRate {
  methodId: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  provider?: string;
}

// 💳 PAYMENT TYPES
// ================

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  type: PaymentMethodType;
  enabled: boolean;
  icon?: string;
  processingFee?: number;
  minAmount?: number;
  maxAmount?: number;
}

export type PaymentMethodType =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "bank_transfer"
  | "cash_on_delivery";

export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  paymentMethodId: string;
  clientSecret?: string; // For Stripe

  // Provider specific
  providerIntentId?: string;
  providerData?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export type PaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "canceled";

// 🧮 CALCULATION TYPES
// ====================

export interface OrderCalculation {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;

  // Breakdown
  taxBreakdown?: TaxBreakdown[];
  discountBreakdown?: DiscountBreakdown[];
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

export interface DiscountBreakdown {
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  amount: number;
}

// 📊 CHECKOUT ANALYTICS
// =====================

export interface CheckoutMetrics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  abandonedAt?: CheckoutStep;
  conversionRate?: number;
  errors: CheckoutError[];
}

export interface CheckoutError {
  step: CheckoutStep;
  type: string;
  message: string;
  timestamp: Date;
  recovered: boolean;
}
