// 🎛️ FEATURE FLAGS ADMIN COMPONENT
// =================================
// Interfaz de administración central para controlar feature flags del sistema

"use client";

import React, { useMemo } from "react";
import { RefreshCw, Flag, Search, Filter, BarChart3 } from "lucide-react";

// 🧠 Notificaciones Inteligentes (como Users)
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🔄 Provider para sincronización instantánea con navegación
import {
  useFeatureFlagsServer,
  useToggleFlag,
} from "@/shared/hooks/useFeatureFlagsServerActions";

// 📡 Broadcasting centralizado
import { useFeatureFlagsBroadcast } from "@/shared/hooks/useBroadcast";

// 🎨 Componentes y utilidades
import FeatureFlagCard from "../components/FeatureFlagCard";
import { getCategoryColors, getCategoryIcon, cn } from "../../utils";
import { CATEGORY_CONFIG } from "../../config/categories";
import type { FeatureFlagCardData, FeatureFlagDomain } from "../../types";

// 🎯 Componente principal (Híbrido: Provider + Direct)
export default function FeatureFlagsAdmin() {
  // 🧠 SISTEMA SIMPLE E INTELIGENTE - UNA SOLA LÍNEA
  const { notify } = useNotifications();

  // 🔄 Provider compartido para sincronización con navegación
  const {
    flags: providerFlags,
    isPending,
    isLoading,
    error,
  } = useFeatureFlagsServer();
  const toggleFlag = useToggleFlag();

  // 📡 Broadcasting centralizado
  const { notifyFlagChange } = useFeatureFlagsBroadcast();

  // 🔍 Estado local para filtros
  const [filters, setFilters] = React.useState({
    search: "",
    category: "all",
    status: "all",
  });

  // 🔄 Convertir flags del provider a formato FeatureFlagDomain
  const flags: FeatureFlagDomain[] = useMemo(() => {
    return providerFlags.map((flag) => ({
      key: flag.key,
      name: flag.name,
      description: flag.description || "",
      enabled: flag.enabled,
      category: flag.category,
      version: flag.version,
      hasPrismaModels: flag.hasPrismaModels,
      dependencies: flag.dependencies,
      conflicts: flag.conflicts,
      rolloutPercentage: flag.rolloutPercentage,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    }));
  }, [providerFlags]);

  // 📊 Computed values from provider (sincronizado automáticamente)
  const loading = isLoading && flags.length === 0;

  // 🔄 Refresh handler (usa el provider)
  const handleRefresh = () => {
    // El provider maneja el refresh automáticamente
    window.location.reload();
  };

  // 🧠 SÚPER SIMPLE: Toggle flag - SINCRONIZACIÓN AUTOMÁTICA
  const handleToggle = async (flagKey: string) => {
    // ✨ UNA SOLA LÍNEA - usa el provider compartido para sincronización instantánea
    await notify(async () => {
      toggleFlag(flagKey);

      // 📡 Notificar otras pestañas - HOOK CENTRALIZADO
      notifyFlagChange(flagKey);
    }, `Cambiando estado de '${flagKey}'...`);
  };

  // 🔄 Mapear FeatureFlagDomain a FeatureFlagCardData (como Users)
  const mappedFlags = useMemo((): FeatureFlagCardData[] => {
    return flags.map((flag) => ({
      id: flag.key as FeatureFlagCardData["id"],
      name: flag.name,
      description: flag.description || "",
      category: flag.category as FeatureFlagCardData["category"],
      enabled: flag.enabled,
      icon: "Package", // Default icon
      isPremium: false,
      dependencies: flag.dependencies as FeatureFlagCardData["dependencies"],
      lastModified: flag.updatedAt
        ? flag.updatedAt.toISOString()
        : new Date().toISOString(),
      modifiedBy: "System", // FeatureFlagDomain no tiene modifiedBy
    }));
  }, [flags]);

  // Filter flags based on current filters (como Users)
  const filteredFlags = useMemo(() => {
    let filtered = mappedFlags;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (flag) =>
          flag.name.toLowerCase().includes(search) ||
          flag.id.toLowerCase().includes(search) ||
          flag.description.toLowerCase().includes(search)
      );
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((flag) => flag.category === filters.category);
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((flag) =>
        filters.status === "enabled" ? flag.enabled : !flag.enabled
      );
    }

    return filtered;
  }, [mappedFlags, filters]);

  const groupedFlags = useMemo(() => {
    return filteredFlags.reduce((groups, flag) => {
      const category = flag.category || "core";
      if (!groups[category]) groups[category] = [];
      groups[category].push(flag);
      return groups;
    }, {} as Record<string, typeof filteredFlags>);
  }, [filteredFlags]);

  // Calculate stats from optimistic state (como Users)
  const stats = useMemo(
    () => ({
      total: flags.length,
      enabled: flags.filter((f) => f.enabled).length,
      disabled: flags.filter((f) => !f.enabled).length,
      active: flags.filter((f) => f.enabled).length,
      byCategory: {
        core: flags.filter((f) => f.category === "core").length,
        module: flags.filter((f) => f.category === "module").length,
        ui: flags.filter((f) => f.category === "ui").length,
        experimental: flags.filter((f) => f.category === "experimental").length,
        admin: flags.filter((f) => f.category === "admin").length,
      },
    }),
    [flags]
  );

  // 🎯 Handlers optimizados (como Users)
  const updateFilters = React.useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const clearFilters = React.useCallback(() => {
    setFilters({ search: "", category: "all", status: "all" });
  }, []);

  // 🏷️ Crear categorías para renderizado
  const categories = Object.entries(CATEGORY_CONFIG)
    .map(([categoryKey, config]) => {
      const categoryFlags = groupedFlags[categoryKey] || [];
      if (categoryFlags.length === 0) return null;

      return {
        id: categoryKey,
        name: config.title,
        description: config.description,
        icon: config.icon,
        color: config.color,
        flags: categoryFlags,
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            🎛️ Feature Flags Administration
          </h1>
          <p className="text-slate-600 mt-1">
            Controla las funcionalidades y módulos de tu aplicación
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 🔄 Refresh button with provider state */}
          <button
            onClick={handleRefresh}
            disabled={isPending || isLoading}
            className={cn(
              "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg",
              "transition-colors disabled:opacity-50 flex items-center gap-2",
              isPending || isLoading ? "animate-pulse" : ""
            )}
          >
            <RefreshCw
              size={16}
              className={isPending || isLoading ? "animate-spin" : ""}
            />
            {isPending || isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Error del hook */}
      {error && (
        <div className="p-4 rounded-lg flex items-center space-x-3 bg-red-50 border border-red-200">
          {getCategoryIcon("AlertCircle", 20)}
          <span className="text-sm font-medium text-red-800">
            Error: {error}
          </span>
          <button
            onClick={handleRefresh}
            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ✅ Notificaciones automáticas - manejadas por useNotifications */}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          icon="Flag"
          label="Total"
          value={stats.total}
          color="slate"
        />
        <StatsCard
          icon="CheckCircle"
          label="Activas"
          value={stats.enabled}
          color="emerald"
        />
        <StatsCard
          icon="Shield"
          label="Core"
          value={stats.byCategory?.core || 0}
          color="blue"
        />
        <StatsCard
          icon="Package"
          label="Módulos"
          value={stats.byCategory?.module || 0}
          color="green"
        />
        <StatsCard
          icon="Palette"
          label="Interfaz"
          value={stats.byCategory?.ui || 0}
          color="purple"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar feature flags..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className={cn(
                "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200 text-gray-900"
              )}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className={cn(
                  "pl-10 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "transition-all duration-200 appearance-none cursor-pointer text-gray-900"
                )}
              >
                <option value="all">Todas las categorías</option>
                <option value="core">Core</option>
                <option value="modules">Módulos</option>
                <option value="experimental">Experimental</option>
                <option value="ui">Interfaz</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className={cn(
                "px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200 appearance-none cursor-pointer text-gray-900"
              )}
            >
              <option value="all">Todos los estados</option>
              <option value="enabled">Activas</option>
              <option value="disabled">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category) => {
          if (!category) return null;

          const colors = getCategoryColors(category.color);

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    colors.bg,
                    colors.border,
                    "border"
                  )}
                >
                  <div className={colors.icon}>
                    {getCategoryIcon(category.icon)}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {category.name}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {category.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      colors.bg,
                      colors.text,
                      colors.border,
                      "border"
                    )}
                  >
                    {category.flags.length} flag
                    {category.flags.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Category Flags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {category.flags.map((flag) => (
                  <FeatureFlagCard
                    key={flag.id}
                    flag={flag}
                    dependencies={mappedFlags.filter((f) =>
                      flag.dependencies?.includes(f.id)
                    )}
                    hasChanges={false} // Ya no manejamos cambios locales
                    isLoading={isPending}
                    onToggle={(flagKey) => handleToggle(flagKey)} // ✅ Sincronización automática con navegación
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFlags.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No se encontraron feature flags
          </h3>
          <p className="text-slate-500 mb-6">
            Intenta ajustar los filtros de búsqueda.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Estado del Sistema
              </h3>
              <p className="text-sm text-slate-600">
                {stats.enabled} de {stats.total} funcionalidades activas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-700">
              Sistema operativo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📊 Componente de estadística
interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  const colors = getCategoryColors(color);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            colors.bg
          )}
        >
          <div className={colors.icon}>{getCategoryIcon(icon, 20)}</div>
        </div>
        <div>
          <div className={cn("text-2xl font-bold", colors.text)}>{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
};
