/**
 * 💳 USE PAYMENT METHODS HOOK
 * ============================
 *
 * React Query hook for managing payment methods.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentMethodsQuery } from "../server/queries";
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
  deletePaymentMethodAction,
  setDefaultPaymentMethodAction,
} from "../server/actions";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "../types";

// Query key factory
export const paymentMethodsKeys = {
  all: ["paymentMethods"] as const,
  lists: () => [...paymentMethodsKeys.all, "list"] as const,
  list: (userId?: string) =>
    [...paymentMethodsKeys.lists(), { userId }] as const,
  details: () => [...paymentMethodsKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentMethodsKeys.details(), id] as const,
};

/**
 * Hook to fetch all payment methods for current user
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentMethodsKeys.lists(),
    queryFn: () => getPaymentMethodsQuery(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentMethodInput) =>
      createPaymentMethodAction(input),
    onSuccess: () => {
      // Invalidate payment methods query
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
    },
  });
}

/**
 * Hook to update a payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentMethodInput) =>
      updatePaymentMethodAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
    },
  });
}

/**
 * Hook to delete a payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaymentMethodAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
    },
  });
}

/**
 * Hook to set a payment method as default
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultPaymentMethodAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
    },
  });
}
