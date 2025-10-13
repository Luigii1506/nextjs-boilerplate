/**
 * 🗄️ PRISMA ORDER TYPES
 * =====================
 *
 * TypeScript interfaces for Prisma Order models to replace 'any' types.
 * Based on the actual Prisma schema structure.
 *
 * @version 1.0.0 - Prisma types for checkout
 */

import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "./models";

// 🎯 CORE PRISMA ORDER TYPES
// ==========================

/**
 * Prisma Order with all relations
 */
export interface PrismaOrder {
  id: string;
  number: string;
  customerId?: string | null;
  
  // Contact Info
  email: string;
  phone?: string | null;
  
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
  estimatedDelivery?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  
  // JSON fields (Prisma stored as Json)
  shippingAddress?: PrismaJsonAddress | null;
  billingAddress?: PrismaJsonAddress | null;
  shippingMethod?: PrismaJsonShippingMethod | null;
  paymentMethod?: PrismaJsonPaymentMethod | null;
  
  // Optional fields
  trackingNumber?: string | null;
  paymentIntentId?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  
  // Relations
  items: PrismaOrderItem[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prisma OrderItem
 */
export interface PrismaOrderItem {
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
  productImage?: string | null;
  
  // Relations (optional, may not always be included)
  order?: PrismaOrder;
  
  createdAt: Date;
}

// 🎯 JSON FIELD TYPES
// ===================
// These represent the JSON data stored in Prisma JSONB fields

/**
 * Address stored in JSON field
 */
export interface PrismaJsonAddress {
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

/**
 * Shipping method stored in JSON field
 */
export interface PrismaJsonShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  provider?: string;
  trackingEnabled: boolean;
}

/**
 * Payment method stored in JSON field
 */
export interface PrismaJsonPaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  icon?: string;
}

// 🔄 QUERY RESULT TYPES
// =====================

/**
 * Order query with specific includes
 */
export interface PrismaOrderWithItems extends PrismaOrder {
  items: PrismaOrderItem[];
}

/**
 * Paginated orders result
 */
export interface PrismaOrdersResult {
  orders: PrismaOrder[];
  total: number;
  hasMore: boolean;
}

// 🎯 WHERE CLAUSE TYPES
// =====================

/**
 * Order where clause for queries
 */
export interface PrismaOrderWhereClause {
  id?: string;
  customerId?: string | null;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  
  // Date filters
  placedAt?: {
    gte?: Date;
    lte?: Date;
  };
  
  // Logical operators
  AND?: PrismaOrderWhereClause[];
  OR?: PrismaOrderWhereClause[];
  NOT?: PrismaOrderWhereClause;
}

/**
 * Order item where clause
 */
export interface PrismaOrderItemWhereClause {
  id?: string;
  orderId?: string;
  productId?: string;
}
