/**
 * ⚡ NAVIGATION COMPONENT - TANSTACK OPTIMIZED
 * ===========================================
 *
 * Componente de navegación súper optimizado:
 * ✅ TanStack Query cache inteligente
 * ✅ Feature flags reactivos automáticos
 * ✅ Performance enterprise
 * ✅ Skeleton loading optimizado
 *
 * Enterprise: 2025-01-17 - TanStack Query optimization
 */

"use client";

import React from "react";
import Link from "next/link";
import { useNavigationQuery } from "@/core/navigation/hooks/useNavigationQuery";
import { NAVIGATION_STYLES } from "@/core";
import { cn } from "@/shared/utils";

interface NavigationProps {
  userRole: "user" | "admin" | "super_admin";
}

/**
 * ⚡ OPTIMIZED NAVIGATION COMPONENT
 *
 * Componente súper optimizado con TanStack Query
 */
export default function Navigation({ userRole }: NavigationProps) {
  // ⚡ TanStack Query optimized navigation hook
  const { navigationItems, isRouteActive, isLoading, error, categories } =
    useNavigationQuery({
      userRole,
      isAuthenticated: true,
      debugMode: process.env.NODE_ENV === "development",
    });

  // ❌ Error state
  if (error) {
    return (
      <nav className="mt-8 space-y-2">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error cargando navegación
          </p>
          <p className="text-xs text-red-500 dark:text-red-300 mt-1">{error}</p>
        </div>
      </nav>
    );
  }

  // ⚡ Skeleton loading - TanStack Query optimized
  if (isLoading || navigationItems.length === 0) {
    return (
      <nav className="mt-8 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              NAVIGATION_STYLES.base,
              "animate-pulse bg-slate-100 dark:bg-slate-700"
            )}
          >
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded" />
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded flex-1" />
          </div>
        ))}
      </nav>
    );
  }

  // ✅ Render optimizado - Grouped by categories for better UX
  return (
    <nav className="mt-8 space-y-6">
      {/* 🏗️ Core Navigation */}
      {categories.core.length > 0 && (
        <div className="space-y-1">
          <div className="px-3 py-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Core
            </p>
          </div>
          {categories.core.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  NAVIGATION_STYLES.base,
                  NAVIGATION_STYLES.category.core,
                  isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* 🚀 Feature Modules */}
      {categories.feature.length > 0 && (
        <div className="space-y-1">
          <div className="px-3 py-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Features
            </p>
          </div>
          {categories.feature.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  NAVIGATION_STYLES.base,
                  NAVIGATION_STYLES.category.feature,
                  isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* 🛡️ Admin Tools */}
      {categories.admin.length > 0 && (
        <div className="space-y-1">
          <div className="px-3 py-1 border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Administración
            </p>
          </div>
          {categories.admin.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  NAVIGATION_STYLES.base,
                  NAVIGATION_STYLES.category.admin,
                  isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* 📊 Debug info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="px-3 py-2 mt-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ⚡ TanStack Query | {navigationItems.length} items cached
          </p>
        </div>
      )}
    </nav>
  );
}
