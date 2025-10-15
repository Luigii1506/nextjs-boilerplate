/**
 * 🎟️ COUPONS HOOKS - Seller Portal
 * ==================================
 *
 * React Query hooks for coupons management
 * Complete CRUD operations with optimistic updates
 *
 * Created: 2025-01-17
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCouponsAction,
  getCouponDetailsAction,
  getActiveCouponsCountAction,
  getCouponsStatsAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
  duplicateCouponAction,
  validateCouponCodeAction,
} from "../server/actions/coupons.actions";
import type { CouponFilters } from "../server/queries/coupons.queries";
import type { CouponFormData } from "../types";

// ========================================
// 📊 QUERY HOOKS
// ========================================

/**
 * Get paginated coupons with filters
 */
export function useCoupons(
  filters: CouponFilters = {},
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["seller-portal", "coupons", filters, page, pageSize],
    queryFn: () => getCouponsAction(filters, page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get single coupon details
 */
export function useCouponDetails(couponId: string | null) {
  return useQuery({
    queryKey: ["seller-portal", "coupon", couponId],
    queryFn: () => getCouponDetailsAction(couponId!),
    enabled: !!couponId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get active coupons count
 */
export function useActiveCouponsCount() {
  return useQuery({
    queryKey: ["seller-portal", "coupons", "active-count"],
    queryFn: () => getActiveCouponsCountAction(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });
}

/**
 * Get coupons statistics
 */
export function useCouponsStats() {
  return useQuery({
    queryKey: ["seller-portal", "coupons", "stats"],
    queryFn: () => getCouponsStatsAction(),
    staleTime: 60 * 1000,
  });
}

/**
 * Validate coupon code availability
 */
export function useValidateCouponCode(code: string, excludeCouponId?: string) {
  return useQuery({
    queryKey: ["seller-portal", "coupon-code-validation", code, excludeCouponId],
    queryFn: () => validateCouponCodeAction(code, excludeCouponId),
    enabled: code.length >= 3,
    staleTime: 0, // Always fresh
  });
}

// ========================================
// 🔄 MUTATION HOOKS
// ========================================

/**
 * Create new coupon
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponFormData) => createCouponAction(data),
    onSuccess: () => {
      // Invalidate all coupon queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "coupons"] });
    },
  });
}

/**
 * Update existing coupon
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponFormData> }) =>
      updateCouponAction(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific coupon
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "coupon", variables.id],
      });
      // Invalidate coupons list
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "coupons"] });
    },
  });
}

/**
 * Delete coupon (soft delete)
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => deleteCouponAction(couponId),
    onSuccess: () => {
      // Invalidate all coupon queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "coupons"] });
    },
  });
}

/**
 * Toggle coupon active status
 */
export function useToggleCouponActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCouponActiveAction(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: ["seller-portal", "coupon", id],
      });

      // Snapshot previous value
      const previousCoupon = queryClient.getQueryData([
        "seller-portal",
        "coupon",
        id,
      ]);

      // Optimistically update
      queryClient.setQueryData(["seller-portal", "coupon", id], (old: any) => {
        if (!old) return old;
        return { ...old, isActive };
      });

      return { previousCoupon };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCoupon) {
        queryClient.setQueryData(
          ["seller-portal", "coupon", variables.id],
          context.previousCoupon
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "coupon", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "coupons"] });
    },
  });
}

/**
 * Duplicate coupon
 */
export function useDuplicateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => duplicateCouponAction(couponId),
    onSuccess: () => {
      // Invalidate all coupon queries
      queryClient.invalidateQueries({ queryKey: ["seller-portal", "coupons"] });
    },
  });
}
