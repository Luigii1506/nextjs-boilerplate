/**
 * 🔄 NAVIGATION COMPATIBILITY HOOK - TANSTACK TRANSITION
 * ======================================================
 *
 * Hook de compatibilidad que mantiene la API original
 * pero usa TanStack Query internamente para máxima performance.
 *
 * Enterprise: 2025-01-17 - Backward compatibility with TanStack Query
 */

"use client";

import { useNavigationQuery } from "./useNavigationQuery";
import type { UserRole } from "../constants";

// 🎯 Props interface (maintains original API)
interface UseNavigationProps {
  userRole: UserRole;
  isAuthenticated: boolean;
  debugMode?: boolean;
}

// 🎯 Return interface (maintains original API)
interface UseNavigationReturn {
  navigationItems: ReturnType<typeof useNavigationQuery>["navigationItems"];
  isRouteActive: ReturnType<typeof useNavigationQuery>["isRouteActive"];
  currentPath: ReturnType<typeof useNavigationQuery>["currentPath"];
  categories: ReturnType<typeof useNavigationQuery>["categories"];
  stats: ReturnType<typeof useNavigationQuery>["stats"];
}

/**
 * ⚡ USE NAVIGATION - TANSTACK OPTIMIZED (COMPATIBILITY)
 *
 * Hook de compatibilidad que mantiene la API original
 * pero usa TanStack Query internamente para performance enterprise.
 */
export function useNavigation(props: UseNavigationProps): UseNavigationReturn {
  // ⚡ Use TanStack Query optimized hook internally
  const {
    navigationItems,
    categories,
    stats,
    isRouteActive,
    currentPath,
    // isLoading, error, refetch - not exposed in original API
  } = useNavigationQuery(props);

  // 🔄 Return same interface as original hook
  return {
    navigationItems,
    isRouteActive,
    currentPath,
    categories,
    stats,
  };
}

/**
 * 🔧 Navigation utilities (maintains original API)
 */
export const navigationUtils = {
  // Helper para crear feature flag checker
  createFeatureFlagChecker: (enabledFeatures: Set<string>) => ({
    isEnabled: (feature: string | null) =>
      feature ? enabledFeatures.has(feature) : true,
  }),

  // Helper para verificar si una ruta está activa
  isRouteActive: (currentPath: string, targetPath: string): boolean => {
    return (
      currentPath === targetPath || currentPath.startsWith(targetPath + "/")
    );
  },

  // Helper para obtener estadísticas de navegación
  getNavigationStats: () => {
    // Use dynamic import to avoid circular dependencies
    import("../constants").then(({ NavigationRegistryUtils }) => {
      return NavigationRegistryUtils.getStats();
    });
    // Return static data for now to avoid async complexity
    return {
      total: 0,
      core: 0,
      modules: 0,
      withFeatureFlags: 0,
      categories: { core: 0, feature: 0, admin: 0 },
    };
  },
};
