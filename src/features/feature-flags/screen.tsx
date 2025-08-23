/**
 * ⚡ FEATURE FLAGS ADMIN PAGE - TANSTACK OPTIMIZED
 * ===============================================
 *
 * Vista súper optimizada usando TanStack Query.
 * Performance enterprise, battle-tested, cero parpadeos.
 *
 * Enterprise: 2025-01-17 - TanStack Query integration
 */

"use client";

import React, { useState } from "react";
import { RefreshCw, Flag, Search, BarChart3, Zap, Package } from "lucide-react";

// ⚡ TANSTACK QUERY HOOK - Enterprise optimized
import { useFeatureFlagsQuery } from "./hooks/useFeatureFlagsQuery";

// 🧠 Shared hooks
import { useI18n } from "@/shared/hooks/useI18n";
import { useHydrationSafe } from "@/shared/hooks/useHydrationSafe";

// 🎨 Components
import FeatureFlagCard from "./components/FeatureFlagCard";
import {
  SkeletonFeatureFlagCard,
  SkeletonStatsCard,
} from "@/shared/ui/components";

// 🎯 Types
import type {
  FeatureFlagData,
  FeatureCategory,
  FeatureFlagFilters,
} from "./types";
import { FEATURE_CATEGORIES } from "./config";

/**
 * ⚡ OPTIMIZED FEATURE FLAGS VIEW - TANSTACK QUERY
 * ==============================================
 *
 * Vista súper optimizada usando TanStack Query.
 * Performance enterprise, cero parpadeos, optimistic updates.
 */
export default function FeatureFlagsAdminPage() {
  // 🌍 Internationalization
  const { t } = useI18n();

  // 🔍 Local state for filters
  const [filters, setFilters] = useState<FeatureFlagFilters>({
    search: "",
    category: "all",
    status: "all",
  });

  // ⚡ TANSTACK QUERY HOOK - Enterprise optimized
  const {
    stats,
    isLoading,
    isFetching,
    isValidating,
    error,
    hasError,
    filterFlags,
    toggleFlag,
    refresh,
    isToggling,
    getIsToggling,
  } = useFeatureFlagsQuery();

  // 🔒 SSR-safe state to prevent hydration mismatch
  const { safeValue: safeFetching } = useHydrationSafe(isFetching, false);
  const { safeValue: safeToggling } = useHydrationSafe(isToggling, false);
  const { safeValue: safeValidating } = useHydrationSafe(isValidating, false);

  // 🔍 Smart filtering with optimized data
  const filteredFlags = React.useMemo(() => {
    return filterFlags(filters);
  }, [filterFlags, filters]);

  // 🧠 Flag operations - Optimistic by default
  const handleToggle = async (flagKey: string) => {
    await toggleFlag(flagKey);
  };

  const handleRefresh = async () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* 🏠 Header - SIEMPRE VISIBLE */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.featureFlags.title}
            </h1>
            {/* ⚡ Performance indicators */}
            {safeValidating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando</span>
              </div>
            )}
            {safeToggling && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando</span>
              </div>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestiona módulos y funcionalidades - Sistema súper optimizado con
            TanStack Query
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔄 Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={safeFetching}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600 ${
              safeFetching ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw
              size={16}
              className={safeFetching ? "animate-spin" : ""}
            />
            {safeFetching ? "Actualizando..." : t.featureFlags.refresh}
          </button>
        </div>
      </div>

      {/* 📊 STATS - OPTIMIZED CON CACHE */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.featureFlags.total}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.featureFlags.active}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.enabled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.featureFlags.inactive}
                </p>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {stats.disabled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.featureFlags.modules}
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.byCategory.module || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Error handling */}
      {hasError && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-red-600 dark:text-red-400">⚠️</div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                {t.featureFlags.errorLoading}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm underline"
            >
              Reintentar
            </button>
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 🔍 Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={t.featureFlags.search}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value as FeatureCategory | "all",
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">{t.featureFlags.allCategories}</option>
              {Object.entries(FEATURE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as "enabled" | "disabled" | "all",
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">{t.featureFlags.all}</option>
              <option value="enabled">{t.featureFlags.enabled}</option>
              <option value="disabled">{t.featureFlags.disabled}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🎛️ Feature Flags Grid - TANSTACK QUERY OPTIMIZED */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonFeatureFlagCard key={i} />
          ))}
        </div>
      ) : filteredFlags.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            {t.featureFlags.noFlagsFound}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t.featureFlags.adjustFilters}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlags.map((flag: FeatureFlagData) => (
            <FeatureFlagCard
              key={flag.key}
              flag={flag}
              onToggle={handleToggle}
              isLoading={getIsToggling(flag.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
