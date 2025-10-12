/**
 * 📦 ORDERS - TANSTACK QUERY HOOKS
 * =================================
 *
 * React hooks for orders with TanStack Query.
 * Provides caching, refetching, and optimistic updates.
 *
 * @version 1.0.0 - Feature-First Architecture v3
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus } from "@prisma/client";
import type {
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderByIdRequest,
  GetOrderByIdResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from "../types";
import {
  getOrdersAction,
  getOrderByIdAction,
  createOrderAction,
  cancelOrderAction,
} from "../server/actions";

// 🔑 Query Keys
export const ORDER_QUERY_KEYS = {
  all: ["orders"] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, "list"] as const,
  list: (userId: string, status?: OrderStatus) =>
    [...ORDER_QUERY_KEYS.lists(), { userId, status }] as const,
  details: () => [...ORDER_QUERY_KEYS.all, "detail"] as const,
  detail: (orderId: string) => [...ORDER_QUERY_KEYS.details(), orderId] as const,
};

/**
 * 📥 Hook to fetch user's orders
 */
export function useOrders(params: {
  userId: string;
  limit?: number;
  offset?: number;
  status?: OrderStatus;
  enabled?: boolean;
}) {
  const { userId, limit, offset, status, enabled = true } = params;

  return useQuery<GetOrdersResponse>({
    queryKey: ORDER_QUERY_KEYS.list(userId, status),
    queryFn: async () => {
      const request: GetOrdersRequest = {
        userId,
        limit,
        offset,
        status,
      };
      return await getOrdersAction(request);
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * 📥 Hook to fetch a single order
 */
export function useOrder(orderId: string, userId: string, enabled = true) {
  return useQuery<GetOrderByIdResponse>({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: async () => {
      const request: GetOrderByIdRequest = {
        orderId,
        userId,
      };
      return await getOrderByIdAction(request);
    },
    enabled: enabled && !!orderId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * 📤 Hook to create an order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, Error, CreateOrderRequest>({
    mutationFn: async (request) => {
      return await createOrderAction(request);
    },
    onSuccess: (data, variables) => {
      if (data.success && variables.userId) {
        // Invalidate orders list to refetch
        queryClient.invalidateQueries({
          queryKey: ORDER_QUERY_KEYS.list(variables.userId),
        });
      }
    },
  });
}

/**
 * 🚫 Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<CancelOrderResponse, Error, CancelOrderRequest>({
    mutationFn: async (request) => {
      return await cancelOrderAction(request);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate both list and detail
        queryClient.invalidateQueries({
          queryKey: ORDER_QUERY_KEYS.list(variables.userId),
        });
        queryClient.invalidateQueries({
          queryKey: ORDER_QUERY_KEYS.detail(variables.orderId),
        });
      }
    },
  });
}

/**
 * 🔄 Hook to manually refresh orders
 */
export function useRefreshOrders(userId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ORDER_QUERY_KEYS.list(userId),
    });
  };
}
