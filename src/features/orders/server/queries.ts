/**
 * 📦 ORDERS - DATABASE QUERIES
 * ============================
 *
 * Raw Prisma queries for orders.
 * Pure data access layer - no business logic.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

import { prisma } from "@/core/database/prisma";
import type { OrderStatus } from "@prisma/client";

/**
 * Get all orders for a user
 */
export async function getUserOrders(params: {
  userId: string;
  limit?: number;
  offset?: number;
  status?: OrderStatus;
}) {
  const { userId, limit = 50, offset = 0, status } = params;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                publicImages: true,
              },
            },
          },
        },
      },
      orderBy: { placedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total };
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId, // Ensure user owns this order
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              publicImages: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  return order;
}

/**
 * Get order by number (public-facing)
 */
export async function getOrderByNumber(orderNumber: string, email: string) {
  const order = await prisma.order.findFirst({
    where: {
      number: orderNumber,
      email, // Verify ownership via email
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              publicImages: true,
            },
          },
        },
      },
    },
  });

  return order;
}

/**
 * Create a new order
 */
export async function createOrder(data: {
  userId?: string;
  email: string;
  phone?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  shippingAddress: string; // JSON string
  shippingMethod?: string;
  paymentMethod: string;
  paymentIntentId?: string;
  customerNotes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    productSku: string;
    productName: string;
    productImage?: string;
  }>;
}) {
  // Generate order number
  const orderCount = await prisma.order.count();
  const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

  // Create order with items
  const order = await prisma.order.create({
    data: {
      number: orderNumber,
      userId: data.userId || null,
      email: data.email,
      phone: data.phone || null,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      shippingCost: data.shippingCost,
      discountAmount: data.discountAmount,
      total: data.total,
      shippingAddress: data.shippingAddress,
      shippingMethod: data.shippingMethod || null,
      paymentMethod: data.paymentMethod,
      paymentIntentId: data.paymentIntentId || null,
      customerNotes: data.customerNotes || null,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          productSku: item.productSku,
          productName: item.productName,
          productImage: item.productImage || null,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  updates: {
    status?: OrderStatus;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
    fulfillmentStatus?:
      | "UNFULFILLED"
      | "PARTIALLY_FULFILLED"
      | "FULFILLED"
      | "SHIPPED"
      | "DELIVERED";
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  }
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: updates,
    include: {
      items: true,
    },
  });

  return order;
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, reason?: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      adminNotes: reason || null,
    },
    include: {
      items: true,
    },
  });

  return order;
}

/**
 * Get order statistics for a user
 */
export async function getUserOrderStats(userId: string) {
  const [totalOrders, ordersByStatus] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  const stats = {
    totalOrders,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  };

  ordersByStatus.forEach((group) => {
    const revenue = Number(group._sum.total || 0);
    stats.totalRevenue += revenue;

    switch (group.status) {
      case "PENDING":
      case "CONFIRMED":
      case "PROCESSING":
        stats.pendingOrders += group._count;
        break;
      case "DELIVERED":
        stats.completedOrders += group._count;
        break;
      case "CANCELLED":
      case "REFUNDED":
        stats.cancelledOrders += group._count;
        break;
    }
  });

  if (totalOrders > 0) {
    stats.averageOrderValue = stats.totalRevenue / totalOrders;
  }

  return stats;
}
