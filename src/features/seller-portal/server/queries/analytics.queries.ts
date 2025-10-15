/**
 * 📊 ANALYTICS QUERIES - Seller Portal
 * =====================================
 *
 * Database queries for analytics and reporting
 * Revenue, orders, products, discounts
 *
 * Created: 2025-01-17
 * Updated: 2025-01-17 - Fixed to match actual Prisma schema
 */

import { prisma } from "@/core/database/prisma";
import { OrderStatus } from "@prisma/client";

/**
 * Date range helper
 */
function getDateRange(range: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case "24h":
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "12m":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  return { startDate, endDate };
}

/**
 * Main metrics
 */
export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export async function getAnalyticsMetricsQuery(
  dateRange: string = "7d"
): Promise<AnalyticsMetrics> {
  const { startDate, endDate } = getDateRange(dateRange);

  const [
    revenueData,
    ordersCount,
    deliveredCount,
    pendingCount,
    cancelledCount,
    customersCount,
  ] = await Promise.all([
    // Total revenue from delivered orders
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        total: true,
      },
    }),
    // Total orders
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Delivered orders
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.DELIVERED,
      },
    }),
    // Pending orders (PENDING, CONFIRMED, PROCESSING, SHIPPED)
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
      },
    }),
    // Cancelled orders
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.CANCELLED,
      },
    }),
    // Unique customers
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    }),
  ]);

  const totalRevenue = Number(revenueData._sum?.total || 0);
  const averageOrderValue = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  return {
    totalRevenue,
    totalOrders: ordersCount,
    averageOrderValue,
    totalCustomers: customersCount.length,
    completedOrders: deliveredCount,
    pendingOrders: pendingCount,
    cancelledOrders: cancelledCount,
  };
}

/**
 * Revenue by payment method (instead of channel)
 */
export interface ChannelRevenue {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export async function getRevenueByChannelQuery(
  dateRange: string = "7d"
): Promise<ChannelRevenue[]> {
  const { startDate, endDate } = getDateRange(dateRange);

  // Since Order doesn't have channel field, we'll group by paymentMethod
  const ordersByMethod = await prisma.order.groupBy({
    by: ["paymentMethod"],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.DELIVERED,
      paymentMethod: { not: null },
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  const totalRevenue = ordersByMethod.reduce(
    (sum, item) => sum + Number(item._sum?.total || 0),
    0
  );

  return ordersByMethod.map((item) => {
    const revenue = Number(item._sum?.total || 0);
    return {
      channel: item.paymentMethod || "Unknown",
      revenue,
      orders: item._count?.id || 0,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    };
  });
}

/**
 * Top selling products
 */
export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export async function getTopProductsQuery(
  dateRange: string = "7d",
  limit: number = 10
): Promise<TopProduct[]> {
  const { startDate, endDate } = getDateRange(dateRange);

  // Get top products by quantity sold
  const topProductsData = await prisma.orderItem.groupBy({
    by: ["productId", "productName", "productSku"],
    where: {
      order: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.DELIVERED,
      },
    },
    _sum: {
      quantity: true,
      total: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  return topProductsData.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    sku: item.productSku,
    quantitySold: item._sum?.quantity || 0,
    revenue: Number(item._sum?.total || 0),
  }));
}

/**
 * Discount analytics
 */
export interface DiscountAnalytics {
  totalDiscounts: number;
  discountedOrders: number;
  averageDiscount: number;
  topPromotion?: {
    name: string;
    usageCount: number;
    totalDiscount: number;
  };
  topCoupon?: {
    code: string;
    usageCount: number;
    totalDiscount: number;
  };
}

export async function getDiscountAnalyticsQuery(
  dateRange: string = "7d"
): Promise<DiscountAnalytics> {
  const { startDate, endDate } = getDateRange(dateRange);

  // Get total discounts from orders
  const ordersWithDiscounts = await prisma.order.aggregate({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.DELIVERED,
      discountAmount: { gt: 0 },
    },
    _sum: {
      discountAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const totalDiscounts = Number(ordersWithDiscounts._sum?.discountAmount || 0);
  const discountedOrders = ordersWithDiscounts._count?.id || 0;
  const averageDiscount = discountedOrders > 0 ? totalDiscounts / discountedOrders : 0;

  // Get top promotion
  const topPromotionData = await prisma.order.groupBy({
    by: ["appliedCouponCode"],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.DELIVERED,
      appliedCouponCode: { not: null },
      promotionDiscounts: { gt: 0 },
    },
    _sum: {
      promotionDiscounts: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        promotionDiscounts: "desc",
      },
    },
    take: 1,
  });

  // Get top coupon
  const topCouponData = await prisma.order.groupBy({
    by: ["appliedCouponCode"],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.DELIVERED,
      appliedCouponCode: { not: null },
      couponDiscounts: { gt: 0 },
    },
    _sum: {
      couponDiscounts: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        couponDiscounts: "desc",
      },
    },
    take: 1,
  });

  return {
    totalDiscounts,
    discountedOrders,
    averageDiscount,
    topPromotion: topPromotionData[0]
      ? {
          name: topPromotionData[0].appliedCouponCode || "Unknown",
          usageCount: topPromotionData[0]._count?.id || 0,
          totalDiscount: Number(topPromotionData[0]._sum?.promotionDiscounts || 0),
        }
      : undefined,
    topCoupon: topCouponData[0]
      ? {
          code: topCouponData[0].appliedCouponCode || "Unknown",
          usageCount: topCouponData[0]._count?.id || 0,
          totalDiscount: Number(topCouponData[0]._sum?.couponDiscounts || 0),
        }
      : undefined,
  };
}

/**
 * Daily revenue
 */
export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export async function getDailyRevenueQuery(
  dateRange: string = "7d"
): Promise<DailyRevenue[]> {
  const { startDate, endDate } = getDateRange(dateRange);

  // Get all delivered orders in range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.DELIVERED,
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };
    dailyMap.set(dateKey, {
      revenue: existing.revenue + Number(order.total),
      orders: existing.orders + 1,
    });
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

/**
 * Order status distribution
 */
export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export async function getOrderStatusDistributionQuery(
  dateRange: string = "7d"
): Promise<OrderStatusDistribution[]> {
  const { startDate, endDate } = getDateRange(dateRange);

  const statusData = await prisma.order.groupBy({
    by: ["status"],
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: {
      id: true,
    },
  });

  const totalOrders = statusData.reduce((sum, item) => sum + (item._count?.id || 0), 0);

  return statusData.map((item) => ({
    status: item.status,
    count: item._count?.id || 0,
    percentage: totalOrders > 0 ? ((item._count?.id || 0) / totalOrders) * 100 : 0,
  }));
}
