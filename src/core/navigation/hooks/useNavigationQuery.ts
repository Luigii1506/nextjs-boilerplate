/**
 * ⚡ NAVIGATION QUERY HOOK - TANSTACK OPTIMIZED
 * ============================================
 *
 * Hook súper optimizado para navegación usando TanStack Query.
 * Performance enterprise, cache inteligente, reactivity automática.
 *
 * Enterprise: 2025-01-17 - TanStack Query navigation
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useIsEnabled } from "@/features/feature-flags";
import {
  NAVIGATION_REGISTRY,
  type NavigationItem,
  type UserRole,
} from "../constants";

// 🎯 Query keys for navigation
export const NAVIGATION_QUERY_KEYS = {
  all: ["navigation"] as const,
  items: () => [...NAVIGATION_QUERY_KEYS.all, "items"] as const,
  filtered: (params: NavigationFilterParams) =>
    [...NAVIGATION_QUERY_KEYS.items(), params] as const,
} as const;

// 🎯 Query Client interface for typing
interface QueryClient {
  invalidateQueries: (options: {
    queryKey: readonly unknown[];
  }) => Promise<void>;
  prefetchQuery: (options: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<NavigationItem[]>;
    staleTime: number;
  }) => Promise<void>;
  getQueryData: (queryKey: readonly unknown[]) => NavigationItem[] | undefined;
}

// 🎯 Navigation filter parameters
interface NavigationFilterParams {
  userRole: UserRole;
  isAuthenticated: boolean;
  enabledFlags: Record<string, boolean>;
}

// 🎯 Navigation stats
interface NavigationStats {
  total: number;
  visible: number;
  hidden: number;
  byCategory: {
    core: number;
    feature: number;
    admin: number;
  };
}

// 🎯 Navigation categories structure
interface NavigationCategories {
  core: NavigationItem[];
  feature: NavigationItem[];
  admin: NavigationItem[];
}

// 🎯 Hook return type
interface UseNavigationQueryReturn {
  navigationItems: NavigationItem[];
  categories: NavigationCategories;
  stats: NavigationStats;
  isRouteActive: (href: string) => boolean;
  currentPath: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 🚀 Navigation items fetcher - Simulates async data fetching
 * In the future, this could fetch from an API or database
 */
async function fetchNavigationItems(
  params: NavigationFilterParams
): Promise<NavigationItem[]> {
  // Simulate async operation (could be API call in the future)
  await new Promise((resolve) => setTimeout(resolve, 10));

  const { userRole, isAuthenticated, enabledFlags } = params;

  return NAVIGATION_REGISTRY.filter((item) => {
    // 🛡️ Check authentication
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    // 🎭 Check role requirements
    if (item.requiredRole && !hasRequiredRole(userRole, item.requiredRole)) {
      return false;
    }

    // ⚡ Check feature flag requirements
    if (item.requiredFeature && !enabledFlags[item.requiredFeature]) {
      return false;
    }

    return true;
  }).sort((a, b) => a.order - b.order);
}

/**
 * 🎭 Role hierarchy checker
 */
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    super_admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * ⚡ USE NAVIGATION QUERY - TANSTACK OPTIMIZED
 *
 * Hook principal para navegación optimizada con TanStack Query.
 * Incluye cache inteligente, reactivity automática, performance enterprise.
 */
export function useNavigationQuery({
  userRole,
  isAuthenticated,
  debugMode = false,
}: {
  userRole: UserRole;
  isAuthenticated: boolean;
  debugMode?: boolean;
}): UseNavigationQueryReturn {
  const pathname = usePathname();

  // ⚡ Get feature flags state from TanStack Query optimized hook
  const isEnabled = useIsEnabled();

  // 🗺️ Create enabled flags map
  const enabledFlags = useMemo(() => {
    const flagsMap: Record<string, boolean> = {};

    // Check all possible feature flags in navigation registry
    NAVIGATION_REGISTRY.forEach((item) => {
      if (item.requiredFeature) {
        flagsMap[item.requiredFeature] = isEnabled(item.requiredFeature);
      }
    });

    return flagsMap;
  }, [isEnabled]);

  // 📊 Navigation filter parameters
  const filterParams = useMemo<NavigationFilterParams>(
    () => ({
      userRole,
      isAuthenticated,
      enabledFlags,
    }),
    [userRole, isAuthenticated, enabledFlags]
  );

  // ⚡ TanStack Query for navigation items
  const {
    data: navigationItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: NAVIGATION_QUERY_KEYS.filtered(filterParams),
    queryFn: () => fetchNavigationItems(filterParams),
    staleTime: 5 * 60 * 1000, // 5 minutes - navigation doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1, // Navigation is not critical for retries
    refetchOnWindowFocus: false, // Don't refetch navigation on focus
    refetchOnMount: false, // Don't refetch on component mount
    throwOnError: false,
  });

  // 🎯 Route active checker
  const isRouteActive = useCallback(
    (href: string) => {
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  // 📊 Navigation categories
  const categories = useMemo<NavigationCategories>(
    () => ({
      core: navigationItems.filter((item) => item.category === "core"),
      feature: navigationItems.filter((item) => item.category === "feature"),
      admin: navigationItems.filter((item) => item.category === "admin"),
    }),
    [navigationItems]
  );

  // 📈 Navigation stats
  const stats = useMemo<NavigationStats>(
    () => ({
      total: NAVIGATION_REGISTRY.length,
      visible: navigationItems.length,
      hidden: NAVIGATION_REGISTRY.length - navigationItems.length,
      byCategory: {
        core: categories.core.length,
        feature: categories.feature.length,
        admin: categories.admin.length,
      },
    }),
    [navigationItems.length, categories]
  );

  // 🐛 Debug logging
  if (debugMode && !isLoading) {
    console.log("⚡ Navigation TanStack Debug:", {
      userRole,
      isAuthenticated,
      enabledFlags,
      totalItems: NAVIGATION_REGISTRY.length,
      visibleItems: navigationItems.length,
      categories: {
        core: categories.core.length,
        feature: categories.feature.length,
        admin: categories.admin.length,
      },
      cached: true,
    });
  }

  return {
    navigationItems,
    categories,
    stats,
    isRouteActive,
    currentPath: pathname,
    isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * 🚀 USE NAVIGATION PREFETCH
 *
 * Hook para prefetch de rutas de navegación
 */
export function useNavigationPrefetch() {
  // Future enhancement: prefetch routes based on navigation items
  const prefetchRoute = useCallback((href: string) => {
    // Implementation for route prefetching
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      // Use intersection observer to prefetch when route becomes visible
      console.log(`🚀 Prefetching route: ${href}`);
    }
  }, []);

  return { prefetchRoute };
}

/**
 * 🔧 Navigation Query Utilities
 */
export const navigationQueryUtils = {
  // Invalidate navigation cache
  invalidateNavigation: async (queryClient: QueryClient) => {
    await queryClient.invalidateQueries({
      queryKey: NAVIGATION_QUERY_KEYS.all,
    });
  },

  // Prefetch navigation for specific user
  prefetchNavigation: async (
    queryClient: QueryClient,
    params: NavigationFilterParams
  ) => {
    await queryClient.prefetchQuery({
      queryKey: NAVIGATION_QUERY_KEYS.filtered(params),
      queryFn: () => fetchNavigationItems(params),
      staleTime: 5 * 60 * 1000,
    });
  },

  // Get cached navigation data
  getCachedNavigation: (
    queryClient: QueryClient,
    params: NavigationFilterParams
  ): NavigationItem[] | undefined => {
    return queryClient.getQueryData(NAVIGATION_QUERY_KEYS.filtered(params));
  },
};
