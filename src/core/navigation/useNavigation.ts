/**
 * 🧭 SIMPLIFIED NAVIGATION HOOK
 * ==============================
 *
 * Hook simplificado que mantiene toda la funcionalidad:
 * ✅ Feature flags reactivos con broadcast
 * ✅ Filtrado por roles y permisos
 * ✅ Detección de rutas activas
 * ✅ Performance optimizado
 *
 * Refactored: 2025-01-17 - Simplified from complex service architecture
 */

"use client";

import { useMemo, useEffect, useReducer } from "react";
import { usePathname } from "next/navigation";
import { useIsEnabled } from "@/features/feature-flags";
import { useFeatureFlagsBroadcast } from "@/shared/hooks/useBroadcast";
import {
  NAVIGATION_REGISTRY,
  type NavigationItem,
  type UserRole,
} from "./constants";

// 🎯 Hook Props Interface
interface UseNavigationProps {
  userRole: UserRole;
  isAuthenticated: boolean;
  debugMode?: boolean;
}

// 🎯 Hook Return Interface
interface UseNavigationReturn {
  navigationItems: NavigationItem[];
  isRouteActive: (href: string) => boolean;
  currentPath: string;
  categories: {
    core: NavigationItem[];
    feature: NavigationItem[];
    admin: NavigationItem[];
  };
  stats: {
    total: number;
    visible: number;
    hidden: number;
  };
}

/**
 * 🧭 MAIN NAVIGATION HOOK
 *
 * Maneja toda la lógica de navegación de forma simple y eficiente:
 * - Filtra por autenticación, roles y feature flags
 * - Se actualiza automáticamente cuando cambian los feature flags (broadcast)
 * - Detecta rutas activas
 * - Organiza por categorías
 */
export function useNavigation({
  userRole,
  isAuthenticated,
  debugMode = false,
}: UseNavigationProps): UseNavigationReturn {
  const pathname = usePathname();
  const isEnabled = useIsEnabled(); // 🎯 Hook del sistema consolidado
  const { onFlagChange } = useFeatureFlagsBroadcast();

  // 🔄 Force re-render when flags change via broadcast
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    return onFlagChange((flagKey) => {
      if (debugMode)
        console.log(
          `🎛️ Feature flag '${flagKey}' changed - updating navigation`
        );
      forceUpdate(); // Force re-render immediately
    });
  }, [onFlagChange, debugMode]);

  // 🧭 Filtrar elementos de navegación - UNA SOLA FUNCIÓN OPTIMIZADA
  const navigationItems = useMemo(() => {
    const filtered = NAVIGATION_REGISTRY.filter((item) => {
      // 🛡️ Check authentication
      if (item.requiresAuth && !isAuthenticated) {
        if (debugMode) console.log(`❌ ${item.id}: Auth required`);
        return false;
      }

      // 🎭 Check role requirements
      if (item.requiredRole && !hasRequiredRole(userRole, item.requiredRole)) {
        if (debugMode)
          console.log(
            `❌ ${item.id}: Role ${item.requiredRole} required, user has ${userRole}`
          );
        return false;
      }

      // 🎛️ Check feature flag requirements - REACTIVO AL BROADCAST
      if (item.requiredFeature && !isEnabled(item.requiredFeature)) {
        if (debugMode)
          console.log(
            `❌ ${item.id}: Feature ${item.requiredFeature} disabled`
          );
        return false;
      }

      if (debugMode) console.log(`✅ ${item.id}: Visible`);
      return true;
    });

    // 🔄 Sort by order
    return filtered.sort((a, b) => a.order - b.order);
  }, [userRole, isAuthenticated, isEnabled, debugMode]); // 🎯 Se actualiza cuando cambian feature flags

  // 🎯 Detectar ruta activa - OPTIMIZADO
  const isRouteActive = useMemo(
    () => (href: string) => {
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  // 📊 Organizar por categorías - MEMOIZADO
  const categories = useMemo(
    () => ({
      core: navigationItems.filter((item) => item.category === "core"),
      feature: navigationItems.filter((item) => item.category === "feature"),
      admin: navigationItems.filter((item) => item.category === "admin"),
    }),
    [navigationItems]
  );

  // 📈 Estadísticas - MEMOIZADO
  const stats = useMemo(
    () => ({
      total: NAVIGATION_REGISTRY.length,
      visible: navigationItems.length,
      hidden: NAVIGATION_REGISTRY.length - navigationItems.length,
    }),
    [navigationItems.length]
  );

  // 🐛 Debug logging
  if (debugMode) {
    console.log("🧭 Navigation Debug:", {
      userRole,
      isAuthenticated,
      totalItems: NAVIGATION_REGISTRY.length,
      visibleItems: navigationItems.length,
      categories: {
        core: categories.core.length,
        feature: categories.feature.length,
        admin: categories.admin.length,
      },
    });
  }

  return {
    navigationItems,
    isRouteActive,
    currentPath: pathname,
    categories,
    stats,
  };
}

/**
 * 🎭 ROLE HIERARCHY CHECKER
 *
 * Verifica si el usuario tiene el rol requerido basado en jerarquía:
 * user < admin < super_admin
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
 * 🔧 NAVIGATION UTILITIES
 *
 * Utilidades adicionales para trabajar con navegación
 */
export const navigationUtils = {
  // Helper para crear feature flag checker (para casos especiales)
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
  getNavigationStats: () => ({
    total: NAVIGATION_REGISTRY.length,
    core: NAVIGATION_REGISTRY.filter((item) => item.isCore).length,
    modules: NAVIGATION_REGISTRY.filter((item) => !item.isCore).length,
    withFeatureFlags: NAVIGATION_REGISTRY.filter(
      (item) => !!item.requiredFeature
    ).length,
    categories: {
      core: NAVIGATION_REGISTRY.filter((item) => item.category === "core")
        .length,
      feature: NAVIGATION_REGISTRY.filter((item) => item.category === "feature")
        .length,
      admin: NAVIGATION_REGISTRY.filter((item) => item.category === "admin")
        .length,
    },
  }),
};
