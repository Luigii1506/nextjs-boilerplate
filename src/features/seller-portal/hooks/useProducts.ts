/**
 * 🏷️ PRODUCTS HOOKS - Seller Portal
 * ==================================
 *
 * React Query hooks for products management
 *
 * REFACTORED: Now uses Server Actions instead of API Routes
 * Created: 2025-01-17
 * Updated: 2025-01-17 - Refactor to use Server Actions
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ProductQuickView,
  PaginatedResponse,
  ProductVisibilityUpdate,
} from "../types";
import {
  getProductsAction,
  getCategoriesAction,
  updateProductVisibilityAction,
  toggleProductActiveAction,
  bulkUpdateVisibilityAction,
} from "../server/actions/products.actions";
import { ProductVisibility, SalesChannel } from "@prisma/client";

// ========================================
// 📋 QUERY HOOKS (Read Data)
// ========================================

/**
 * Fetch products for quick view
 * REFACTORED: Uses getProductsAction instead of fetch
 */
export function useProducts(
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string,
  categoryId?: string,
  visibility?: string
) {
  // Convert "ALL" to undefined to avoid Prisma validation errors
  const visibilityFilter = visibility === "ALL" ? undefined : (visibility as ProductVisibility | undefined);

  return useQuery({
    queryKey: ["seller-portal", "products", page, pageSize, searchQuery, categoryId, visibility],
    queryFn: () => getProductsAction(page, pageSize, searchQuery, categoryId, visibilityFilter),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch categories for filter
 * REFACTORED: Uses getCategoriesAction instead of fetch
 */
export function useCategories() {
  return useQuery({
    queryKey: ["seller-portal", "categories"],
    queryFn: () => getCategoriesAction(),
    staleTime: 5 * 60 * 1000, // 5 minutes (categories don't change often)
  });
}

// ========================================
// ✏️ MUTATION HOOKS (Write Data)
// ========================================

/**
 * Update product visibility
 */
export function useUpdateProductVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ProductVisibilityUpdate) => {
      const result = await updateProductVisibilityAction(update);
      if (!result.success) {
        throw new Error(result.error || "Error updating visibility");
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate products query to refetch
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "products"],
      });
    },
  });
}

/**
 * Toggle product active status
 */
export function useToggleProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      isActive,
    }: {
      productId: string;
      isActive: boolean;
    }) => {
      const result = await toggleProductActiveAction(productId, isActive);
      if (!result.success) {
        throw new Error(result.error || "Error toggling active status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "products"],
      });
    },
  });
}

/**
 * Bulk update visibility
 */
export function useBulkUpdateVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productIds,
      visibility,
      availableChannels,
    }: {
      productIds: string[];
      visibility: ProductVisibility;
      availableChannels?: SalesChannel[];
    }) => {
      const result = await bulkUpdateVisibilityAction(
        productIds,
        visibility,
        availableChannels
      );
      if (!result.success) {
        throw new Error(result.error || "Error bulk updating");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seller-portal", "products"],
      });
    },
  });
}
