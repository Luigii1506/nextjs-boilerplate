/**
 * 🧭 DYNAMIC NAVIGATION ENTERPRISE - PURE SERVER ACTIONS
 * =======================================================
 *
 * Navegación enterprise usando el módulo core de navegación.
 * 100% Server Actions + patrones enterprise + React 19 compliance.
 *
 * Updated: 2025-01-17 - Enterprise navigation integration
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";
import {
  useNavigation,
  NAVIGATION_STYLES,
  type FeatureFlagChecker,
  type NavigationItem,
} from "@/core";

interface DynamicNavigationPureProps {
  isAdmin: boolean;
}

/**
 * 🧭 Enterprise Navigation Item Component
 * Uses core navigation infrastructure
 */
function NavigationItem({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`${NAVIGATION_STYLES.base} ${
        isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{item.label}</span>
      {item.badge && (
        <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
      )}
    </Link>
  );
}

/**
 * 💀 Navigation Skeleton - Hydration Safe
 */
function NavigationSkeleton() {
  return (
    <nav className="mt-8 space-y-2">
      <div className={`${NAVIGATION_STYLES.base} opacity-60`}>
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
        <span className="text-slate-400">Cargando menú...</span>
      </div>
      <div className={`${NAVIGATION_STYLES.base} opacity-60`}>
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
        <span className="text-slate-400">Cargando menú...</span>
      </div>
      <div className={`${NAVIGATION_STYLES.base} opacity-60`}>
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
        <span className="text-slate-400">Cargando menú...</span>
      </div>
    </nav>
  );
}

/**
 * 🚀 ENTERPRISE DYNAMIC NAVIGATION
 * Uses core navigation infrastructure + Server Actions
 * React 19 compliant with performance optimization
 */
export default function DynamicNavigationPure({
  isAdmin,
}: DynamicNavigationPureProps) {
  const isEnabled = useIsEnabled(); // ⚡ Feature flags hook
  const [isHydrated, setIsHydrated] = useState(false);

  // 🛡️ Hydration detection
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 🎯 Enhanced feature flag checker that uses the hook
  const enhancedFeatureFlagChecker: FeatureFlagChecker = useMemo(
    () => ({
      isEnabled: (feature) => {
        if (!feature) return true;
        return isEnabled(feature);
      },
    }),
    [isEnabled]
  );

  // 🧭 Use core navigation hook
  const { navigationItems, isLoading, error, isRouteActive } = useNavigation(
    isAdmin ? "admin" : "user", // UserRole
    true, // isAuthenticated (already checked by layout)
    enhancedFeatureFlagChecker,
    {
      maxItems: 20,
      debugMode: process.env.NODE_ENV === "development",
    }
  );

  // 🛡️ Show skeleton during hydration or loading
  if (!isHydrated || isLoading) {
    return <NavigationSkeleton />;
  }

  // ❌ Show error state
  if (error) {
    return (
      <nav className="mt-8 space-y-2">
        <div className={`${NAVIGATION_STYLES.base} text-red-600`}>
          <span>⚠️ Error al cargar navegación</span>
        </div>
      </nav>
    );
  }

  // ✅ Render navigation with enterprise infrastructure
  return (
    <nav className="mt-8 space-y-2">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.id}
          item={item}
          isActive={isRouteActive(item.href)}
        />
      ))}

      {/* 🎯 Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-600">
          <div>📊 Items: {navigationItems.length}</div>
          <div>🎭 Role: {isAdmin ? "admin" : "user"}</div>
        </div>
      )}
    </nav>
  );
}
