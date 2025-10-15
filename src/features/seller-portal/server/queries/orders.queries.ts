/**
 * 📊 SELLER PORTAL - ORDERS QUERIES
 * ==================================
 *
 * Database queries for orders management
 * - Get all orders with filters
 * - Get order details
 * - Get order statistics
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

import { PrismaClient } from "@prisma/client";
import {
  OrderFilters,
  OrderSummary,
  OrderDetails,
  PaginatedResponse,
} from "../../types";

const prisma = new PrismaClient();

// ========================================
// 📋 GET ORDERS WITH FILTERS
// ========================================

export async function getOrdersQuery(
  filters: OrderFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<OrderSummary>> {
  try {
    // Build where clause from filters
    const where: any = {};

    // Status filters
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.fulfillmentStatus && filters.fulfillmentStatus !== "ALL") {
      where.fulfillmentStatus = filters.fulfillmentStatus;
    }

    // Note: Channel filter removed - Order model doesn't have channel field
    // Could be added in future if needed

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.placedAt = {};
      if (filters.dateFrom) {
        where.placedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.placedAt.lte = filters.dateTo;
      }
    }

    // Search query (order number or email)
    if (filters.searchQuery) {
      where.OR = [
        { number: { contains: filters.searchQuery, mode: "insensitive" } },
        { email: { contains: filters.searchQuery, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get paginated orders
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        number: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        email: true,
        total: true,
        placedAt: true,
        shippedAt: true,
        deliveredAt: true,
        estimatedDelivery: true,
        trackingNumber: true,
        paymentMethod: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        placedAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Map to OrderSummary
    const items: OrderSummary[] = orders.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status as any,
      paymentStatus: order.paymentStatus as any,
      fulfillmentStatus: order.fulfillmentStatus as any,
      customerEmail: order.email,
      total: Number(order.total),
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: order.placedAt,
      shippedAt: order.shippedAt || undefined,
      deliveredAt: order.deliveredAt || undefined,
      estimatedDelivery: order.estimatedDelivery || undefined,
      trackingNumber: order.trackingNumber || undefined,
      paymentMethod: order.paymentMethod || undefined,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

// ========================================
// 📄 GET ORDER DETAILS
// ========================================

export async function getOrderDetailsQuery(
  orderId: string
): Promise<OrderDetails | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                publicImages: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Map to OrderDetails
    const details: OrderDetails = {
      id: order.id,
      number: order.number,
      status: order.status as any,
      paymentStatus: order.paymentStatus as any,
      fulfillmentStatus: order.fulfillmentStatus as any,
      userId: order.userId || undefined,
      customerEmail: order.email,
      phone: order.phone || undefined,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingCost: Number(order.shippingCost),
      discountAmount: Number(order.discountAmount),
      productDiscounts: Number((order as any).productDiscounts || 0),
      promotionDiscounts: Number((order as any).promotionDiscounts || 0),
      couponDiscounts: Number((order as any).couponDiscounts || 0),
      appliedCouponCode: (order as any).appliedCouponCode || undefined,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: order.placedAt,
      shippedAt: order.shippedAt || undefined,
      deliveredAt: order.deliveredAt || undefined,
      estimatedDelivery: order.estimatedDelivery || undefined,
      trackingNumber: order.trackingNumber || undefined,
      shippingAddress: order.shippingAddress || undefined,
      shippingMethod: order.shippingMethod || undefined,
      paymentMethod: order.paymentMethod || undefined,
      customerNotes: order.customerNotes || undefined,
      adminNotes: order.adminNotes || undefined,

      // Items
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        productImage: item.productImage || undefined,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),

      // Status history
      statusHistory: order.statusHistory.map((history) => ({
        id: history.id,
        status: history.status as any,
        notes: history.notes || undefined,
        createdAt: history.createdAt,
      })),
    };

    return details;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}

// ========================================
// 📊 GET ORDERS STATISTICS
// ========================================

export async function getOrdersStatsQuery(filters: OrderFilters = {}): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByPaymentStatus: Record<string, number>;
  ordersByChannel: Record<string, number>;
}> {
  try {
    // Build where clause
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.placedAt = {};
      if (filters.dateFrom) {
        where.placedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.placedAt.lte = filters.dateTo;
      }
    }

    // Get aggregated stats
    const [totalOrders, revenueSum, ordersByStatus, ordersByPaymentStatus] =
      await Promise.all([
        // Total orders count
        prisma.order.count({ where }),

        // Total revenue (only PAID orders)
        prisma.order.aggregate({
          where: {
            ...where,
            paymentStatus: "PAID",
          },
          _sum: {
            total: true,
          },
        }),

        // Orders grouped by status
        prisma.order.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),

        // Orders grouped by payment status
        prisma.order.groupBy({
          by: ["paymentStatus"],
          where,
          _count: true,
        }),
      ]);

    const totalRevenue = Number(revenueSum._sum.total || 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Convert arrays to records
    const ordersByStatusRecord: Record<string, number> = {};
    ordersByStatus.forEach((item) => {
      ordersByStatusRecord[item.status] = item._count;
    });

    const ordersByPaymentStatusRecord: Record<string, number> = {};
    ordersByPaymentStatus.forEach((item) => {
      ordersByPaymentStatusRecord[item.paymentStatus] = item._count;
    });

    // For now, all orders are ONLINE (until POS is implemented)
    const ordersByChannel: Record<string, number> = {
      ONLINE: totalOrders,
      POS: 0,
    };

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: ordersByStatusRecord,
      ordersByPaymentStatus: ordersByPaymentStatusRecord,
      ordersByChannel,
    };
  } catch (error) {
    console.error("Error fetching orders statistics:", error);
    throw error;
  }
}

// ========================================
// 🔍 GET PENDING ORDERS COUNT (for badges)
// ========================================

export async function getPendingOrdersCountQuery(): Promise<number> {
  try {
    return await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        paymentStatus: "PAID",
      },
    });
  } catch (error) {
    console.error("Error fetching pending orders count:", error);
    return 0;
  }
}

// ========================================
// 🚚 GET ORDERS NEEDING TRACKING
// ========================================

export async function getOrdersNeedingTrackingQuery(): Promise<OrderSummary[]> {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PROCESSING"],
        },
        paymentStatus: "PAID",
        trackingNumber: null,
        shippingCost: {
          gt: 0, // Only orders with shipping
        },
      },
      select: {
        id: true,
        number: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        email: true,
        total: true,
        placedAt: true,
        shippedAt: true,
        deliveredAt: true,
        estimatedDelivery: true,
        trackingNumber: true,
        paymentMethod: true,
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        placedAt: "asc",
      },
      take: 50,
    });

    return orders.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status as any,
      paymentStatus: order.paymentStatus as any,
      fulfillmentStatus: order.fulfillmentStatus as any,
      customerEmail: order.email,
      total: Number(order.total),
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      placedAt: order.placedAt,
      shippedAt: order.shippedAt || undefined,
      deliveredAt: order.deliveredAt || undefined,
      estimatedDelivery: order.estimatedDelivery || undefined,
      trackingNumber: order.trackingNumber || undefined,
      paymentMethod: order.paymentMethod || undefined,
    }));
  } catch (error) {
    console.error("Error fetching orders needing tracking:", error);
    return [];
  }
}
