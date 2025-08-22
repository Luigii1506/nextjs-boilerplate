/**
 * 🎛️ FEATURE FLAGS ADMIN PAGE
 * ===========================
 *
 * Simplified admin interface for managing feature flags.
 * Uses the new simplified architecture.
 *
 * Simple: 2025-01-17 - Admin UI
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  Flag,
  Search,
  Filter,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Package,
  Beaker,
} from "lucide-react";

// 🧠 Simplified hooks
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  useFeatureFlags,
  FEATURE_CATEGORIES,
  type FeatureFlagData,
  type FeatureCategory,
} from "@/features/feature-flags";

// 🎨 Components
import FeatureFlagCard from "./components/FeatureFlagCard";

// 🎯 Category icons mapping
const CATEGORY_ICONS = {
  core: Shield,
  module: Package,
  experimental: Beaker,
  admin: Settings,
} as const;

// 🎯 Main component
export default function FeatureFlagsAdminPage() {
  // 🧠 Notifications
  const { notify } = useNotifications();

  // 🌍 Internationalization
  const { t } = useI18n();

  // 🎛️ Feature flags data - Hook nuevo
  const { flags, isLoading, error, toggleFlag } = useFeatureFlags();

  // 🔍 Local state for filters
  const [filters, setFilters] = useState({
    search: "",
    category: "all" as FeatureCategory | "all",
    status: "all" as "enabled" | "disabled" | "all",
  });

  // 🔄 Handle toggle with notifications
  const handleToggle = async (flagKey: string) => {
    await notify(
      async () => {
        await toggleFlag(flagKey);
      },
      `Cambiando estado de '${flagKey}'...`,
      `Feature flag '${flagKey}' actualizado correctamente`
    );
  };

  // 🔄 Handle refresh - Ya no necesario, el contexto se actualiza automáticamente
  const handleRefresh = async () => {
    await notify(
      async () => {
        // El contexto se actualiza automáticamente via broadcast
        console.log("Feature flags se actualizan automáticamente");
      },
      "Actualizando feature flags...",
      "Feature flags actualizados"
    );
  };

  // 🔍 Filtered flags - Solo mostrar categorías "module" y "ui"
  const filteredFlags = useMemo(() => {
    return flags.filter((flag: FeatureFlagData) => {
      // 🎯 FILTRO PRINCIPAL: Solo mostrar flags de categorías "module" y "ui"
      if (flag.category !== "module" && flag.category !== "ui") {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !flag.name.toLowerCase().includes(searchLower) &&
          !flag.key.toLowerCase().includes(searchLower) &&
          !flag.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== "all" && flag.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== "all") {
        const isEnabled = flag.enabled;
        if (
          (filters.status === "enabled" && !isEnabled) ||
          (filters.status === "disabled" && isEnabled)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [flags, filters]);

  // 🎨 Flags organizados por categoría (para uso futuro)
  // const flagsByCategory = useMemo(() => {
  //   const categorized: Record<string, typeof filteredFlags> = {};
  //
  //   // Inicializar todas las categorías
  //   Object.keys(FEATURE_CATEGORIES).forEach(category => {
  //     categorized[category] = [];
  //   });
  //
  //   // Agrupar flags por categoría
  //   filteredFlags.forEach(flag => {
  //     if (categorized[flag.category]) {
  //       categorized[flag.category].push(flag);
  //     }
  //   });
  //
  //   // Solo devolver categorías que tienen flags
  //   return Object.entries(categorized).filter(([, flags]) => flags.length > 0);
  // }, [filteredFlags]);

  // 📊 Statistics - Para categorías "module" y "ui"
  const stats = useMemo(() => {
    const total = filteredFlags.length;
    const enabled = filteredFlags.filter(
      (f: FeatureFlagData) => f.enabled
    ).length;
    const disabled = total - enabled;
    const byCategory = {
      module: flags.filter((f: FeatureFlagData) => f.category === "module")
        .length,
      ui: flags.filter((f: FeatureFlagData) => f.category === "ui").length,
    };

    return { total, enabled, disabled, byCategory };
  }, [flags, filteredFlags]);

  // 🎨 Render
  return (
    <div className="space-y-6">
      {/* 📊 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t.featureFlags.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona módulos y funcionalidades de interfaz que se pueden
            activar/desactivar
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {t.featureFlags.refresh}
        </button>
      </div>

      {/* 📊 Statistics Cards */}
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

      {/* 🚨 Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-red-600 dark:text-red-400">⚠️</div>
            <p className="text-red-800 dark:text-red-200 font-medium">
              {t.featureFlags.errorLoading}
            </p>
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 🎛️ Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlags.map((flag: FeatureFlagData) => (
          <FeatureFlagCard
            key={flag.key}
            flag={flag}
            onToggle={handleToggle}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* 📭 Empty State */}
      {filteredFlags.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            {t.featureFlags.noFlagsFound}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t.featureFlags.adjustFilters}
          </p>
        </div>
      )}

      {/* 🔄 Loading State */}
      {isLoading && flags.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t.featureFlags.loading}
          </p>
        </div>
      )}
    </div>
  );
}
