/**
 * 🌐 CHECKOUT API TYPES
 * ====================
 *
 * Request/response types for checkout server actions
 */

import {
  CustomerInfo,
  Address,
  Order,
  OrderCalculation,
  PaymentIntent,
  ShippingMethod,
} from "./models";

// 🎯 SERVER ACTION INPUTS
// =======================

export interface CreateOrderInput {
  cartId: string;
  userId?: string;

  // Customer Information
  customerInfo: CustomerInfo;

  // Addresses
  shippingAddress: Address;
  billingAddress?: Address; // Optional, defaults to shipping

  // Method selections
  shippingMethodId: string;
  paymentMethodId: string;

  // Additional info
  customerNotes?: string;
}

export interface CalculateOrderInput {
  cartId: string;
  shippingAddress?: Address;
  shippingMethodId?: string;
  discountCodes?: string[];
}

export interface ProcessPaymentInput {
  orderId: string;
  paymentMethodId: string;
  paymentData?: {
    // Stripe
    paymentMethodId?: string;
    clientSecret?: string;

    // PayPal
    paypalOrderId?: string;

    // Bank transfer
    bankAccount?: string;

    // Generic data
    [key: string]: any;
  };
}

export interface CreatePaymentIntentInput {
  orderId: string;
  paymentMethodId: string;
  returnUrl?: string;
}

export interface CalculateShippingInput {
  cartId: string;
  shippingAddress: Address;
}

// 🔄 SERVER ACTION RESPONSES
// =========================

export interface CreateOrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
  validationErrors?: Record<string, string>;
}

export interface CalculateOrderResponse {
  success: boolean;
  data?: OrderCalculation;
  error?: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  data?: {
    order: Order;
    paymentIntent?: PaymentIntent;
    redirectUrl?: string; // For 3D Secure, PayPal, etc.
    requiresAction?: boolean;
  };
  error?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data?: {
    paymentIntent: PaymentIntent;
    clientSecret: string;
  };
  error?: string;
}

export interface CalculateShippingResponse {
  success: boolean;
  data?: ShippingMethod[];
  error?: string;
}

export interface ConfirmOrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
}

// 🎯 WEBHOOK TYPES
// ===============

export interface PaymentWebhookData {
  type: string;
  orderId: string;
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;

  // Provider specific
  stripeEventId?: string;
  paypalTransactionId?: string;

  createdAt: Date;
}

// 📊 ANALYTICS TYPES
// =================

export interface CheckoutAnalyticsData {
  sessionId: string;
  userId?: string;
  cartId: string;

  // Timing
  startTime: Date;
  endTime?: Date;
  stepsCompleted: string[];
  abandonedAt?: string;

  // Conversion
  orderCreated: boolean;
  orderId?: string;
  orderTotal?: number;

  // Errors
  errors: Array<{
    step: string;
    error: string;
    timestamp: Date;
  }>;
}

// 🔍 QUERY TYPES
// ==============

export interface GetOrderInput {
  orderId: string;
  userId?: string;
}

export interface GetUserOrdersInput {
  userId: string;
  limit?: number;
  offset?: number;
  status?: string[];
}

export interface GetOrdersResponse {
  success: boolean;
  data?: {
    orders: Order[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// 🎛️ ADMIN TYPES
// ==============

export interface UpdateOrderStatusInput {
  orderId: string;
  status: string;
  notes?: string;
}

export interface UpdateShippingInfoInput {
  orderId: string;
  trackingNumber?: string;
  shippedAt?: Date;
  estimatedDelivery?: Date;
}

export interface RefundOrderInput {
  orderId: string;
  amount?: number; // Partial refund
  reason?: string;
}
