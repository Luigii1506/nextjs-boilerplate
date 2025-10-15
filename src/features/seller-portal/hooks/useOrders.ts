/**
 * 🪝 USE ORDERS HOOK
 * ==================
 *
 * React hook for fetching and managing orders in Seller Portal
 * Uses React Query for caching and auto-refresh
 *
 * REFACTORED: Now uses Server Actions instead of API Routes
 * Created: 2025-01-17 - Seller Portal Implementation
 * Updated: 2025-01-17 - Refactor to use Server Actions
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderFilters, OrderSummary, OrderDetails, PaginatedResponse, TrackingUpdate } from "../types";
import {
  getOrdersAction,
  getOrderDetailsAction,
  getOrdersStatsAction,
  getPendingOrdersCountAction,
  updateOrderStatusAction,
  addTrackingInfoAction,
  cancelOrderAction,
} from "../server/actions/orders.actions";

// ========================================
// 📋 QUERY HOOKS (Read Data)
// ========================================

/**
 * Fetch paginated orders with filters
 * REFACTORED: Uses getOrdersAction instead of fetch
 */
export function useOrders(
  filters: OrderFilters = {},
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["seller-portal", "orders", filters, page, pageSize],
    queryFn: () => getOrdersAction(filters, page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

/**
 * Fetch single order details
 * REFACTORED: Uses getOrderDetailsAction instead of fetch
 */
export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ["seller-portal", "order", orderId],
    queryFn: () => getOrderDetailsAction(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch orders statistics
 * REFACTORED: Uses getOrdersStatsAction instead of fetch
 */
export function useOrdersStats(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ["seller-portal", "orders-stats", filters],
    queryFn: () => getOrdersStatsAction(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch pending orders count
 * REFACTORED: Uses getPendingOrdersCountAction instead of fetch
 */
export function usePendingOrdersCount() {
  return useQuery({
    queryKey: ["seller-portal", "orders-pending-count"],
    queryFn: () => getPendingOrdersCountAction(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ========================================
// ✏️ MUTATION HOOKS (Write Data)
// ========================================

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: any;
      notes?: string;
    }) => updateOrderStatusAction(orderId, status, notes),
    onSuccess: () => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders-stats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders-pending-count"],
      });
    },
  });
}

/**
 * Add tracking information
 */
export function useAddTrackingInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackingUpdate) => addTrackingInfoAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders-stats"],
      });
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      cancelOrderAction(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "orders-stats"],
      });
    },
  });
}
