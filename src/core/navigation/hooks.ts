/**
 * 🧭 CORE NAVIGATION HOOKS - INFRASTRUCTURE
 * ==========================================
 *
 * Hooks de navegación para infraestructura del sistema.
 * React 19 compliance con performance optimization.
 *
 * Created: 2025-01-17 - Core navigation hooks
 */

"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { NavigationItem, UserRole } from "./constants";
import type { NavigationContext } from "./config";
import {
  coreNavigationService,
  type FeatureFlagChecker,
  type NavigationFilterOptions,
  type NavigationServiceResult,
} from "./service";

// 🎯 Hook Configuration Interface
export interface NavigationHookConfig {
  maxItems?: number;
  enableAnimations?: boolean;
  enableCaching?: boolean;
  debugMode?: boolean;
}

// 🎯 Hook Return Interface
export interface UseNavigationReturn {
  // 📊 Navigation Data
  navigationItems: NavigationItem[];
  categories: Record<string, NavigationItem[]>;

  // 🔄 Loading States
  isLoading: boolean;
  isRefreshing: boolean;

  // 📊 Analytics
  totalItems: number;
  filteredItems: number;
  hasMoreItems: boolean;

  // 🎯 Current Route Info
  currentPath: string;
  activeItemId: string | null;

  // 🛠️ Actions
  refreshNavigation: () => Promise<void>;
  getItemById: (id: string) => NavigationItem | null;
  isRouteActive: (href: string) => boolean;

  // ❌ Error States
  error: string | null;
  hasError: boolean;
}

// 🧭 CORE NAVIGATION HOOK (Infrastructure)
export function useNavigation(
  userRole: UserRole,
  isAuthenticated: boolean,
  featureFlagChecker: FeatureFlagChecker,
  config?: NavigationHookConfig
): UseNavigationReturn {
  // 🏗️ Hook state
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navigationData, setNavigationData] =
    useState<NavigationServiceResult | null>(null);

  // 🏗️ Configuration
  const hookConfig = useMemo(
    () => ({
      maxItems: config?.maxItems || 20,
      enableAnimations: config?.enableAnimations ?? true,
      enableCaching: config?.enableCaching ?? true,
      debugMode: config?.debugMode ?? process.env.NODE_ENV === "development",
    }),
    [config]
  );

  // 🚀 Navigation context
  const navigationContext = useMemo(
    (): NavigationContext => ({
      userId: `user-${userRole}`,
      userRole,
      isAuthenticated,
      availableFeatures: new Set(),
    }),
    [userRole, isAuthenticated]
  );

  // 🔄 Load navigation data
  const loadNavigationData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const filterOptions: NavigationFilterOptions = {
          userRole,
          isAuthenticated,
          featureFlagChecker,
          maxItems: hookConfig.maxItems,
        };

        const result = await coreNavigationService.getNavigationForUser(
          navigationContext,
          filterOptions
        );

        setNavigationData(result);

        if (hookConfig.debugMode) {
          console.log("🧭 Navigation data loaded:", {
            totalItems: result.totalItems,
            filteredItems: result.filteredItems,
            categories: Object.keys(result.categories),
            isRefresh,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load navigation";
        setError(errorMessage);

        if (hookConfig.debugMode) {
          console.error("❌ Navigation load failed:", err);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      userRole,
      isAuthenticated,
      featureFlagChecker,
      navigationContext,
      hookConfig,
    ]
  );

  // 🚀 AUTO-INITIALIZATION
  useEffect(() => {
    if (isAuthenticated) {
      loadNavigationData(false);
    }
  }, [isAuthenticated, loadNavigationData]);

  // 🎯 Current route detection
  const { currentPath, activeItemId } = useMemo(() => {
    const activeItem = navigationData?.items.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    );

    return {
      currentPath: pathname,
      activeItemId: activeItem?.id || null,
    };
  }, [pathname, navigationData?.items]);

  // 🛠️ Actions
  const refreshNavigation = useCallback(async () => {
    if (hookConfig.debugMode) {
      console.log("🔄 Manual navigation refresh requested");
    }
    await loadNavigationData(true);
  }, [loadNavigationData, hookConfig.debugMode]);

  const getItemById = useCallback((id: string) => {
    return coreNavigationService.getNavigationItemById(id);
  }, []);

  const isRouteActive = useCallback(
    (href: string) => {
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  // 🏗️ RETURN INTERFACE
  return useMemo(
    () => ({
      // 📊 Navigation Data
      navigationItems: navigationData?.items || [],
      categories: navigationData?.categories || {},

      // 🔄 Loading States
      isLoading,
      isRefreshing,

      // 📊 Analytics
      totalItems: navigationData?.totalItems || 0,
      filteredItems: navigationData?.filteredItems || 0,
      hasMoreItems: navigationData?.hasMoreItems || false,

      // 🎯 Current Route Info
      currentPath,
      activeItemId,

      // 🛠️ Actions
      refreshNavigation,
      getItemById,
      isRouteActive,

      // ❌ Error States
      error,
      hasError: !!error,
    }),
    [
      navigationData,
      isLoading,
      isRefreshing,
      currentPath,
      activeItemId,
      refreshNavigation,
      getItemById,
      isRouteActive,
      error,
    ]
  );
}

// 🎯 Hook selector utilities
export const navigationSelectors = {
  // Get items by category
  getCoreItems: (items: NavigationItem[]) =>
    items.filter((item) => item.category === "core"),

  getFeatureItems: (items: NavigationItem[]) =>
    items.filter((item) => item.category === "feature"),

  getAdminItems: (items: NavigationItem[]) =>
    items.filter((item) => item.category === "admin"),

  // Get items with badges
  getBadgedItems: (items: NavigationItem[]) =>
    items.filter((item) => !!item.badge),

  // Get items accessible to specific role
  getItemsForRole: (items: NavigationItem[], role: UserRole) => {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    };

    return items.filter((item) => {
      if (!item.requiredRole) return true;
      return roleHierarchy[role] >= roleHierarchy[item.requiredRole];
    });
  },
};

// 🔧 Navigation utilities
export const navigationUtils = {
  // Helper to create FeatureFlagChecker
  createFeatureFlagChecker: (
    enabledFeatures: Set<string>
  ): FeatureFlagChecker => ({
    isEnabled: (feature) => (feature ? enabledFeatures.has(feature) : true),
  }),

  // Helper to check if route is active
  isRouteActive: (currentPath: string, targetPath: string): boolean => {
    return (
      currentPath === targetPath || currentPath.startsWith(targetPath + "/")
    );
  },

  // Helper for role hierarchy checking
  hasRequiredRole: (userRole: UserRole, requiredRole: UserRole): boolean => {
    const hierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    };
    return hierarchy[userRole] >= hierarchy[requiredRole];
  },
};
