/**
 * 📊 ANALYTICS ACTIONS - Seller Portal
 * =====================================
 *
 * Server actions for analytics and reporting
 * All read-only, no mutations
 *
 * Created: 2025-01-17
 */

"use server";

import {
  getAnalyticsMetricsQuery,
  getRevenueByChannelQuery,
  getTopProductsQuery,
  getDiscountAnalyticsQuery,
  getDailyRevenueQuery,
  getOrderStatusDistributionQuery,
  type AnalyticsMetrics,
  type ChannelRevenue,
  type TopProduct,
  type DiscountAnalytics,
  type DailyRevenue,
  type OrderStatusDistribution,
} from "../queries/analytics.queries";

// ========================================
// 📊 QUERY ACTIONS
// ========================================

/**
 * Get main analytics metrics
 */
export async function getAnalyticsMetricsAction(
  dateRange: string = "7d"
): Promise<AnalyticsMetrics> {
  return await getAnalyticsMetricsQuery(dateRange);
}

/**
 * Get revenue breakdown by channel
 */
export async function getRevenueByChannelAction(
  dateRange: string = "7d"
): Promise<ChannelRevenue[]> {
  return await getRevenueByChannelQuery(dateRange);
}

/**
 * Get top selling products
 */
export async function getTopProductsAction(
  dateRange: string = "7d",
  limit: number = 10
): Promise<TopProduct[]> {
  return await getTopProductsQuery(dateRange, limit);
}

/**
 * Get discount analytics
 */
export async function getDiscountAnalyticsAction(
  dateRange: string = "7d"
): Promise<DiscountAnalytics> {
  return await getDiscountAnalyticsQuery(dateRange);
}

/**
 * Get daily revenue for charts
 */
export async function getDailyRevenueAction(
  dateRange: string = "7d"
): Promise<DailyRevenue[]> {
  return await getDailyRevenueQuery(dateRange);
}

/**
 * Get order status distribution
 */
export async function getOrderStatusDistributionAction(
  dateRange: string = "7d"
): Promise<OrderStatusDistribution[]> {
  return await getOrderStatusDistributionQuery(dateRange);
}
