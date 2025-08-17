/**
 * 🎯 ACTIVE ROUTE INDICATOR - ENTERPRISE COMPONENT
 * ================================================
 *
 * Componente optimizado para indicar visualmente la ruta activa.
 * Integrado con el sistema de navegación Enterprise.
 * React 19 compliance con performance optimization.
 *
 * Updated: 2025-01-17 - Enterprise patterns integration
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";

// 🎯 Enterprise Types
interface ActiveRouteIndicatorProps {
  targetRoute: string;
  children: React.ReactNode;
  activeClassName?: string;
  inactiveClassName?: string;
  exactMatch?: boolean;
  caseSensitive?: boolean;
  debug?: boolean;
  onActiveChange?: (isActive: boolean) => void;
}

interface RouteMatchOptions {
  exactMatch: boolean;
  caseSensitive: boolean;
}

// 🎯 Enterprise Configuration
const DEFAULT_CONFIG = {
  activeClassName:
    "text-blue-600 font-medium bg-blue-50 border-l-2 border-blue-600",
  inactiveClassName: "text-slate-600 hover:text-slate-700 transition-colors",
  exactMatch: false,
  caseSensitive: false,
  debug: process.env.NODE_ENV === "development",
} as const;

/**
 * 🏗️ ENTERPRISE ACTIVE ROUTE INDICATOR
 *
 * Features:
 * - ✅ Advanced route matching with options
 * - ✅ Performance optimization with memoization
 * - ✅ Enterprise logging and debugging
 * - ✅ Utility class name merging
 * - ✅ Callback for active state changes
 * - ✅ React 19 compliance
 */
export const ActiveRouteIndicator = React.memo<ActiveRouteIndicatorProps>(
  ({
    targetRoute,
    children,
    activeClassName = DEFAULT_CONFIG.activeClassName,
    inactiveClassName = DEFAULT_CONFIG.inactiveClassName,
    exactMatch = DEFAULT_CONFIG.exactMatch,
    caseSensitive = DEFAULT_CONFIG.caseSensitive,
    debug = DEFAULT_CONFIG.debug,
    onActiveChange,
  }) => {
    const pathname = usePathname();

    // 🎯 Advanced route matching logic
    const isRouteActive = useCallback(
      (
        currentPath: string,
        targetPath: string,
        options: RouteMatchOptions
      ): boolean => {
        // Normalize paths
        const normalizedCurrent = options.caseSensitive
          ? currentPath
          : currentPath.toLowerCase();
        const normalizedTarget = options.caseSensitive
          ? targetPath
          : targetPath.toLowerCase();

        if (options.exactMatch) {
          return normalizedCurrent === normalizedTarget;
        }

        // Handle root path specially
        if (normalizedTarget === "/") {
          return normalizedCurrent === "/";
        }

        // Check if current path starts with target + "/" or equals target
        return (
          normalizedCurrent === normalizedTarget ||
          normalizedCurrent.startsWith(normalizedTarget + "/")
        );
      },
      []
    );

    // 🎯 Memoized active state calculation
    const isActive = useMemo(() => {
      const active = isRouteActive(pathname, targetRoute, {
        exactMatch,
        caseSensitive,
      });

      // 🔍 Debug logging
      if (debug) {
        console.log("🎯 ActiveRouteIndicator:", {
          pathname,
          targetRoute,
          isActive: active,
          exactMatch,
          caseSensitive,
          timestamp: new Date().toISOString(),
        });
      }

      return active;
    }, [
      pathname,
      targetRoute,
      exactMatch,
      caseSensitive,
      debug,
      isRouteActive,
    ]);

    // 🎯 Notify parent component of active state changes
    React.useEffect(() => {
      if (onActiveChange) {
        onActiveChange(isActive);
      }
    }, [isActive, onActiveChange]);

    // 🎯 Memoized className calculation
    const className = useMemo(() => {
      return cn(
        "transition-all duration-200 ease-in-out",
        isActive ? activeClassName : inactiveClassName
      );
    }, [isActive, activeClassName, inactiveClassName]);

    // 🎯 Performance optimized rendering
    return (
      <div
        className={className}
        data-active={isActive}
        data-route={targetRoute}
        {...(debug && {
          "data-debug": JSON.stringify({
            pathname,
            targetRoute,
            isActive,
            exactMatch,
          }),
        })}
      >
        {children}
      </div>
    );
  }
);

// 🏗️ Display name for debugging
ActiveRouteIndicator.displayName = "ActiveRouteIndicator";

// 🎯 Utility hooks for common use cases
export function useRouteActive(
  targetRoute: string,
  options: Partial<RouteMatchOptions> = {}
): boolean {
  const pathname = usePathname();
  const config = { ...DEFAULT_CONFIG, ...options };

  return useMemo(() => {
    if (config.exactMatch) {
      return config.caseSensitive
        ? pathname === targetRoute
        : pathname.toLowerCase() === targetRoute.toLowerCase();
    }

    const currentPath = config.caseSensitive
      ? pathname
      : pathname.toLowerCase();
    const targetPath = config.caseSensitive
      ? targetRoute
      : targetRoute.toLowerCase();

    if (targetPath === "/") return currentPath === "/";

    return (
      currentPath === targetPath || currentPath.startsWith(targetPath + "/")
    );
  }, [pathname, targetRoute, config.exactMatch, config.caseSensitive]);
}

// 🚀 Export utilities
export { DEFAULT_CONFIG as ACTIVE_ROUTE_CONFIG };
export type { ActiveRouteIndicatorProps, RouteMatchOptions };
