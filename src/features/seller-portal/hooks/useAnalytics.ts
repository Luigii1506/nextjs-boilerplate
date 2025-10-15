/**
 * 📊 ANALYTICS HOOKS - Seller Portal
 * ===================================
 *
 * React Query hooks for analytics data
 * All read-only queries with auto-refresh
 *
 * Created: 2025-01-17
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsMetricsAction,
  getRevenueByChannelAction,
  getTopProductsAction,
  getDiscountAnalyticsAction,
  getDailyRevenueAction,
  getOrderStatusDistributionAction,
} from "../server/actions/analytics.actions";

// ========================================
// 📊 QUERY HOOKS
// ========================================

/**
 * Get main analytics metrics
 * Auto-refreshes every 5 minutes
 */
export function useAnalyticsMetrics(dateRange: string = "7d") {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "metrics", dateRange],
    queryFn: () => getAnalyticsMetricsAction(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

/**
 * Get revenue by channel
 */
export function useRevenueByChannel(dateRange: string = "7d") {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "revenue-by-channel", dateRange],
    queryFn: () => getRevenueByChannelAction(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get top selling products
 */
export function useTopProducts(dateRange: string = "7d", limit: number = 10) {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "top-products", dateRange, limit],
    queryFn: () => getTopProductsAction(dateRange, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get discount analytics
 */
export function useDiscountAnalytics(dateRange: string = "7d") {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "discounts", dateRange],
    queryFn: () => getDiscountAnalyticsAction(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get daily revenue for charts
 */
export function useDailyRevenue(dateRange: string = "7d") {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "daily-revenue", dateRange],
    queryFn: () => getDailyRevenueAction(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get order status distribution
 */
export function useOrderStatusDistribution(dateRange: string = "7d") {
  return useQuery({
    queryKey: ["seller-portal", "analytics", "order-status", dateRange],
    queryFn: () => getOrderStatusDistributionAction(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}
