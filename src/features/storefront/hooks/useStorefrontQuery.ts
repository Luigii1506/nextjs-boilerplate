/**
 * 🛒 STOREFRONT DATA QUERY HOOK
 * =============================
 *
 * Hook principal para datos del storefront con TanStack Query
 * Optimized caching, mutations y invalidation siguiendo patrón inventory
 *
 * Updated: 2025-01-17 - TanStack Query Integration
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { STOREFRONT_DEFAULTS } from "../constants";
import {
  getStorefrontDataAction,
  getPublicProductsAction,
  getFeaturedProductsAction,
  getPublicCategoriesAction,
  getFeaturedCategoriesAction,
  getStorefrontStatsAction,
  addToWishlistAction,
  removeFromWishlistAction,
  getWishlistAction,
} from "../server/actions";
import type {
  ProductForCustomer,
  CategoryForCustomer,
  StorefrontStats,
  CustomerStats,
  ProductFiltersCustomer,
  CategoryFiltersCustomer,
  UseStorefrontQueryResult,
  WishlistItem,
  ProductQueryOptions,
  CategoryQueryOptions,
  PaginatedResponse,
  ActionResult,
} from "../types";
import { useMemo, useCallback } from "react";

// 🗂️ STOREFRONT QUERY KEYS
export const STOREFRONT_QUERY_KEYS = {
  // Base keys
  all: ["storefront"] as const,

  // Products
  products: (filters?: ProductQueryOptions) =>
    [...STOREFRONT_QUERY_KEYS.all, "products", filters] as const,
  featuredProducts: (limit?: number) =>
    [...STOREFRONT_QUERY_KEYS.all, "products", "featured", limit] as const,

  // Categories
  categories: (filters?: CategoryQueryOptions) =>
    [...STOREFRONT_QUERY_KEYS.all, "categories", filters] as const,
  featuredCategories: (limit?: number) =>
    [...STOREFRONT_QUERY_KEYS.all, "categories", "featured", limit] as const,

  // Stats
  stats: () => [...STOREFRONT_QUERY_KEYS.all, "stats"] as const,

  // Wishlist (por customer)
  wishlist: (userId?: string) =>
    [...STOREFRONT_QUERY_KEYS.all, "wishlist", userId] as const,

  // Combined data
  storefrontData: (options?: any) =>
    [...STOREFRONT_QUERY_KEYS.all, "data", options] as const,
} as const;

// 🎯 Hook Options (deprecated - use UseStorefrontQueryProps)
interface UseStorefrontQueryOptions {
  productFilters?: ProductFiltersCustomer;
  categoryFilters?: CategoryFiltersCustomer;
  userId?: string;
  sessionId?: string;
  featuredProductsLimit?: number;
  featuredCategoriesLimit?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

// 🔄 MUTATION FUNCTIONS
async function addToWishlist({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}): Promise<ActionResult<WishlistItem>> {
  return await addToWishlistAction(userId, productId);
}

async function removeFromWishlist({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}): Promise<ActionResult> {
  return await removeFromWishlistAction(userId, productId);
}

// 📊 MAIN HOOK - TanStack Query Implementation
interface UseStorefrontQueryProps {
  productFilters?: ProductFiltersCustomer;
  categoryFilters?: CategoryFiltersCustomer;
  userId?: string;
  sessionId?: string;
  featuredProductsLimit?: number;
  featuredCategoriesLimit?: number;
  enabled?: boolean;
}

export const useStorefrontQuery = (
  options: UseStorefrontQueryProps = {}
): UseStorefrontQueryResult => {
  const {
    productFilters = {},
    categoryFilters = {},
    userId,
    sessionId,
    featuredProductsLimit = 8,
    featuredCategoriesLimit = 6,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // 📊 Combined Storefront Data Query
  const storefrontData = useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.storefrontData({
      productFilters,
      categoryFilters,
      userId,
      sessionId,
      featuredProductsLimit,
      featuredCategoriesLimit,
    }),
    queryFn: async () => {
      const result = await getStorefrontDataAction({
        productFilters,
        categoryFilters,
        userId,
        sessionId,
        featuredProductsLimit,
        featuredCategoriesLimit,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch storefront data");
      }

      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.QUERY_STALE_TIME,
    gcTime: STOREFRONT_DEFAULTS.QUERY_GC_TIME,
    enabled,
    refetchOnWindowFocus: false,
  });

  // 📊 Individual Queries (for granular access)
  const stats = useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const result = await getStorefrontStatsAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.STATS_STALE_TIME,
    enabled,
  });

  const products = useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.products(productFilters),
    queryFn: async () => {
      const result = await getPublicProductsAction(productFilters);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.QUERY_STALE_TIME,
    enabled,
  });

  const categories = useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.categories(categoryFilters),
    queryFn: async () => {
      const result = await getPublicCategoriesAction(categoryFilters);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.QUERY_STALE_TIME,
    enabled,
  });

  const wishlist = useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.wishlist(userId),
    queryFn: async () => {
      if (!userId) return [];
      const result = await getWishlistAction(userId);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    staleTime: STOREFRONT_DEFAULTS.CART_STALE_TIME,
    enabled: !!userId,
  });

  // 💖 Wishlist Mutations
  const addToWishlistMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: (data, variables) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({
        queryKey: STOREFRONT_QUERY_KEYS.wishlist(variables.userId),
      });

      // Invalidate storefront data to update product wishlist status
      queryClient.invalidateQueries({
        queryKey: STOREFRONT_QUERY_KEYS.storefrontData(),
      });

      // Success notification
      showNotification({
        message: data.message || "Added to wishlist successfully",
        type: "success",
        duration: 3000,
      });
    },
    onError: (error: Error, variables) => {
      showNotification({
        message: error.message || "Failed to add to wishlist",
        type: "error",
        duration: 4000,
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (data, variables) => {
      // Invalidate wishlist queries
      queryClient.invalidateQueries({
        queryKey: STOREFRONT_QUERY_KEYS.wishlist(variables.userId),
      });

      // Invalidate storefront data
      queryClient.invalidateQueries({
        queryKey: STOREFRONT_QUERY_KEYS.storefrontData(),
      });

      // Success notification
      showNotification({
        message: data.message || "Removed from wishlist successfully",
        type: "success",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      showNotification({
        message: error.message || "Failed to remove from wishlist",
        type: "error",
        duration: 4000,
      });
    },
  });

  // 🧮 Computed values using TanStack Query data
  const derivedData = useMemo(() => {
    const data = storefrontData.data;
    if (!data) return {};

    return {
      // Safe arrays with fallbacks
      products: Array.isArray(data.products) ? data.products : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      featuredProducts: Array.isArray(data.featuredProducts)
        ? data.featuredProducts
        : [],
      featuredCategories: Array.isArray(data.featuredCategories)
        ? data.featuredCategories
        : [],
      wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],

      // Customer stats computation
      customerStats: {
        wishlistCount: Array.isArray(data.wishlist) ? data.wishlist.length : 0,
        cartItemsCount: data.cart?.items?.length || 0,
        ordersCount: 0,
        favoriteCategories: [],
        recentlyViewed: [],
        recommendations: Array.isArray(data.featuredProducts)
          ? data.featuredProducts.slice(0, 8)
          : [],
      } as CustomerStats,
    };
  }, [storefrontData.data]);

  // 🎯 Action Functions with TanStack Query mutations
  const actions = useMemo(
    () => ({
      // Wishlist Actions
      addToWishlist: async (productId: string) => {
        if (!userId) {
          showNotification({
            message: "Please log in to add items to wishlist",
            type: "warning",
            duration: 4000,
          });
          return { success: false, message: "Authentication required" };
        }

        try {
          const result = await addToWishlistMutation.mutateAsync({
            userId,
            productId,
          });
          return result;
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to add to wishlist",
          };
        }
      },

      removeFromWishlist: async (productId: string) => {
        if (!userId) {
          return { success: false, message: "Authentication required" };
        }

        try {
          const result = await removeFromWishlistMutation.mutateAsync({
            userId,
            productId,
          });
          return result;
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to remove from wishlist",
          };
        }
      },

      toggleWishlist: async (product: ProductForCustomer) => {
        if (!userId) {
          return { success: false, message: "Authentication required" };
        }

        // ✅ Direct calls to mutations to avoid circular reference
        if (product.isWishlisted) {
          try {
            const result = await removeFromWishlistMutation.mutateAsync({
              userId,
              productId: product.id,
            });
            return result;
          } catch (error) {
            return {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to remove from wishlist",
            };
          }
        } else {
          try {
            const result = await addToWishlistMutation.mutateAsync({
              userId,
              productId: product.id,
            });
            return result;
          } catch (error) {
            return {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to add to wishlist",
            };
          }
        }
      },

      // TODO: Implement cart actions
      addToCart: async () => ({ success: false, message: "Not implemented" }),
      removeFromCart: async () => ({
        success: false,
        message: "Not implemented",
      }),
      updateCartItem: async () => ({
        success: false,
        message: "Not implemented",
      }),
      clearCart: async () => ({ success: false, message: "Not implemented" }),

      // TODO: Implement auth actions
      login: async () => ({ success: false, message: "Not implemented" }),
      register: async () => ({ success: false, message: "Not implemented" }),
      logout: async () => ({ success: false, message: "Not implemented" }),
    }),
    [
      userId,
      addToWishlistMutation,
      removeFromWishlistMutation,
      showNotification,
    ]
  );

  // 🔄 Utility Functions
  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: STOREFRONT_QUERY_KEYS.all,
    });
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  // 📊 Return combined state following UseStorefrontQueryResult interface
  return {
    // Core Data
    stats: derivedData.stats || stats.data || null,
    products: derivedData.products || [],
    categories: derivedData.categories || [],
    featuredProducts: derivedData.featuredProducts || [],
    featuredCategories: derivedData.featuredCategories || [],

    // Customer Data
    customer: null, // TODO: Implement with auth
    cart: storefrontData.data?.cart || null,
    wishlist: derivedData.wishlist || [],
    customerStats: derivedData.customerStats || null,

    // Loading States
    isLoading: storefrontData.isLoading,
    isRefetching: storefrontData.isRefetching,
    isError: storefrontData.isError,
    error: storefrontData.error?.message || null,

    // Wishlist Loading States
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,

    // Actions
    ...actions,

    // Utilities
    refetch: refetchAll,
    invalidateCache,
  };
};

// 🎯 Granular Hooks (for specific use cases)
export const useStorefrontStats = () => {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.stats(),
    queryFn: async () => {
      const result = await getStorefrontStatsAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.STATS_STALE_TIME,
  });
};

export const usePublicProducts = (filters: ProductQueryOptions = {}) => {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.products(filters),
    queryFn: async () => {
      const result = await getPublicProductsAction(filters);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: STOREFRONT_DEFAULTS.QUERY_STALE_TIME,
  });
};

export const useWishlistQuery = (userId?: string) => {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.wishlist(userId),
    queryFn: async () => {
      if (!userId) return [];
      const result = await getWishlistAction(userId);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    staleTime: STOREFRONT_DEFAULTS.CART_STALE_TIME,
    enabled: !!userId,
  });
};

export default useStorefrontQuery;
