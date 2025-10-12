/**
 * 📦 ORDERS - DATA MAPPERS
 * =========================
 *
 * Transform database models to API types.
 * Handles Decimal conversion, date formatting, etc.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from "@prisma/client";
import type { Order, OrderItem, OrderSummary, ShippingAddress } from "../types";

/**
 * Map Prisma Order to domain Order
 */
export function mapOrderToApi(
  prismaOrder: PrismaOrder & { items: PrismaOrderItem[] }
): Order {
  return {
    id: prismaOrder.id,
    number: prismaOrder.number,
    userId: prismaOrder.userId,
    email: prismaOrder.email,
    phone: prismaOrder.phone,
    subtotal: Number(prismaOrder.subtotal),
    taxAmount: Number(prismaOrder.taxAmount),
    shippingCost: Number(prismaOrder.shippingCost),
    discountAmount: Number(prismaOrder.discountAmount),
    total: Number(prismaOrder.total),
    status: prismaOrder.status,
    paymentStatus: prismaOrder.paymentStatus,
    fulfillmentStatus: prismaOrder.fulfillmentStatus,
    placedAt: prismaOrder.placedAt,
    estimatedDelivery: prismaOrder.estimatedDelivery,
    shippedAt: prismaOrder.shippedAt,
    deliveredAt: prismaOrder.deliveredAt,
    cancelledAt: prismaOrder.cancelledAt,
    trackingNumber: prismaOrder.trackingNumber,
    shippingMethod: prismaOrder.shippingMethod,
    shippingAddress: prismaOrder.shippingAddress,
    paymentMethod: prismaOrder.paymentMethod,
    paymentIntentId: prismaOrder.paymentIntentId,
    customerNotes: prismaOrder.customerNotes,
    adminNotes: prismaOrder.adminNotes,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
    items: prismaOrder.items.map(mapOrderItemToApi),
  };
}

/**
 * Map Prisma OrderItem to domain OrderItem
 */
export function mapOrderItemToApi(prismaItem: PrismaOrderItem): OrderItem {
  return {
    id: prismaItem.id,
    orderId: prismaItem.orderId,
    productId: prismaItem.productId,
    quantity: prismaItem.quantity,
    unitPrice: Number(prismaItem.unitPrice),
    total: Number(prismaItem.total),
    productSku: prismaItem.productSku,
    productName: prismaItem.productName,
    productImage: prismaItem.productImage,
    createdAt: prismaItem.createdAt,
  };
}

/**
 * Map Order to OrderSummary (for list views)
 */
export function mapOrderToSummary(
  prismaOrder: PrismaOrder & { items: PrismaOrderItem[] }
): OrderSummary {
  return {
    id: prismaOrder.id,
    number: prismaOrder.number,
    total: Number(prismaOrder.total),
    status: prismaOrder.status,
    paymentStatus: prismaOrder.paymentStatus,
    itemCount: prismaOrder.items.length,
    placedAt: prismaOrder.placedAt,
    estimatedDelivery: prismaOrder.estimatedDelivery,
  };
}

/**
 * Parse shipping address from JSON string
 */
export function parseShippingAddress(addressJson: string | null): ShippingAddress | null {
  if (!addressJson) return null;

  try {
    return JSON.parse(addressJson) as ShippingAddress;
  } catch {
    return null;
  }
}

/**
 * Serialize shipping address to JSON string
 */
export function serializeShippingAddress(address: ShippingAddress): string {
  return JSON.stringify(address);
}
