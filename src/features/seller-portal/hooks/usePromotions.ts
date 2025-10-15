/**
 * 🎁 PROMOTIONS HOOKS - Seller Portal
 * ====================================
 *
 * React Query hooks for promotions management
 * Complete CRUD operations with optimistic updates
 *
 * Created: 2025-01-17
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPromotionsAction,
  getPromotionDetailsAction,
  getActivePromotionsCountAction,
  getPromotionsStatsAction,
  createPromotionAction,
  updatePromotionAction,
  deletePromotionAction,
  togglePromotionActiveAction,
  duplicatePromotionAction,
} from "../server/actions/promotions.actions";
import type { PromotionFilters } from "../server/queries/promotions.queries";
import type { PromotionFormData } from "../types";

// ========================================
// 📊 QUERY HOOKS
// ========================================

/**
 * Get paginated promotions with filters
 */
export function usePromotions(
  filters: PromotionFilters = {},
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["seller-portal", "promotions", filters, page, pageSize],
    queryFn: () => getPromotionsAction(filters, page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get single promotion details
 */
export function usePromotionDetails(promotionId: string | null) {
  return useQuery({
    queryKey: ["seller-portal", "promotion", promotionId],
    queryFn: () => getPromotionDetailsAction(promotionId!),
    enabled: !!promotionId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get active promotions count
 */
export function useActivePromotionsCount() {
  return useQuery({
    queryKey: ["seller-portal", "promotions", "active-count"],
    queryFn: () => getActivePromotionsCountAction(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });
}

/**
 * Get promotions statistics
 */
export function usePromotionsStats() {
  return useQuery({
    queryKey: ["seller-portal", "promotions", "stats"],
    queryFn: () => getPromotionsStatsAction(),
    staleTime: 60 * 1000,
  });
}

// ========================================
// 🔄 MUTATION HOOKS
// ========================================

/**
 * Create new promotion
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromotionFormData) => createPromotionAction(data),
    onSuccess: () => {
      // Invalidate all promotion queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "promotions"] });
    },
  });
}

/**
 * Update existing promotion
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromotionFormData> }) =>
      updatePromotionAction(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific promotion
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "promotion", variables.id],
      });
      // Invalidate promotions list
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "promotions"] });
    },
  });
}

/**
 * Delete promotion (soft delete)
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotionId: string) => deletePromotionAction(promotionId),
    onSuccess: () => {
      // Invalidate all promotion queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "promotions"] });
    },
  });
}

/**
 * Toggle promotion active status
 */
export function useTogglePromotionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePromotionActiveAction(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: ["seller-portal", "promotion", id],
      });

      // Snapshot previous value
      const previousPromotion = queryClient.getQueryData([
        "seller-portal",
        "promotion",
        id,
      ]);

      // Optimistically update
      queryClient.setQueryData(["seller-portal", "promotion", id], (old: any) => {
        if (!old) return old;
        return { ...old, isActive };
      });

      return { previousPromotion };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPromotion) {
        queryClient.setQueryData(
          ["seller-portal", "promotion", variables.id],
          context.previousPromotion
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "promotion", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "promotions"] });
    },
  });
}

/**
 * Duplicate promotion
 */
export function useDuplicatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotionId: string) => duplicatePromotionAction(promotionId),
    onSuccess: () => {
      // Invalidate all promotion queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "promotions"] });
    },
  });
}
