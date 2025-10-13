/**
 * 🔌 ORDERS - API TYPES
 * ======================
 *
 * Request/response types for orders API.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";
import type { Order, OrderSummary, ShippingAddress } from "./models";

// 📥 Get Orders Request
export interface GetOrdersRequest {
  userId: string;
  limit?: number;
  offset?: number;
  status?: OrderStatus;
}

// 📤 Get Orders Response
export interface GetOrdersResponse {
  orders: OrderSummary[];
  total: number;
  hasMore: boolean;
}

// 📥 Get Order by ID Request
export interface GetOrderByIdRequest {
  orderId: string;
  userId: string; // For authorization
}

// 📤 Get Order by ID Response
export type GetOrderByIdResponse = Order | null;

// 📥 Create Order Request
export interface CreateOrderRequest {
  userId?: string; // Optional for guest checkout
  email: string;
  phone?: string;

  // Items
  items: CreateOrderItemInput[];

  // Shipping
  shippingAddress: ShippingAddress;
  shippingMethod?: string;

  // Payment
  paymentMethod: string;
  paymentIntentId?: string;

  // Totals (calculated from cart)
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount?: number;
  total: number;

  // Notes
  customerNotes?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;

  // Product snapshot
  productSku: string;
  productName: string;
  productImage?: string;
}

// 📤 Create Order Response
export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

// 📥 Update Order Status Request
export interface UpdateOrderStatusRequest {
  orderId: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  notes?: string;
}

// 📤 Update Order Status Response
export interface UpdateOrderStatusResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

// 📥 Cancel Order Request
export interface CancelOrderRequest {
  orderId: string;
  userId: string;
  reason?: string;
}

// 📤 Cancel Order Response
export interface CancelOrderResponse {
  success: boolean;
  message?: string;
  error?: string;
}
