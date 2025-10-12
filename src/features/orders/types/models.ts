/**
 * 📦 ORDERS - TYPE DEFINITIONS
 * ============================
 *
 * Domain types for the orders feature.
 * Maps Prisma models to TypeScript interfaces.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";

// 📦 Order Model
export interface Order {
  id: string;
  number: string;
  userId: string | null;

  // Contact
  email: string;
  phone: string | null;

  // Totals
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
  estimatedDelivery: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  // Shipping
  trackingNumber: string | null;
  shippingMethod: string | null;
  shippingAddress: string | null; // JSON string

  // Payment
  paymentMethod: string | null;
  paymentIntentId: string | null;

  // Notes
  customerNotes: string | null;
  adminNotes: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  items: OrderItem[];
}

// 📦 Order Item Model
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;

  // Price snapshot
  unitPrice: number;
  total: number;

  // Product snapshot
  productSku: string;
  productName: string;
  productImage: string | null;

  // Timestamps
  createdAt: Date;
}

// 📊 Parsed Shipping Address
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// 🎯 Order Summary (for list views)
export interface OrderSummary {
  id: string;
  number: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  placedAt: Date;
  estimatedDelivery: Date | null;
}

// 📈 Order Statistics
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
