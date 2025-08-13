// 🎛️ FEATURE FLAGS ADMIN COMPONENT
// =================================
// Interfaz de administración central para controlar feature flags del sistema

"use client";

import React from "react";
import { RefreshCw, Flag, Search, Filter, BarChart3 } from "lucide-react";

// 🪝 Hooks personalizados
import { useFeatureFlagAdmin } from "../../hooks";

// 🎨 Componentes y utilidades
import FeatureFlagCard from "../components/FeatureFlagCard";
import {
  getCategoryColors,
  getCategoryIcon,
  getNotificationStyles,
  cn,
} from "../../utils";
import { CATEGORY_CONFIG } from "../../config/categories";

// 🎯 Componente principal
export default function FeatureFlagsAdmin() {
  const {
    flags,
    filteredFlags,
    stats,
    groupedFlags,
    isLoading,
    error,
    filters,
    notification,
    actions: { updateFilters, handleToggle, handleRefresh, clearFilters },
  } = useFeatureFlagAdmin();

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
    <div className="space-y-8 max-w-7xl mx-auto p-6">
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
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg",
              "transition-colors disabled:opacity-50 flex items-center gap-2"
            )}
          >
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Actualizar
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

      {/* Notificación */}
      {notification && (
        <div
          className={cn(
            "p-4 rounded-lg flex items-center space-x-3",
            getNotificationStyles(notification.type).container
          )}
        >
          {React.createElement(
            getNotificationStyles(notification.type).IconComponent,
            {
              className: cn(
                "w-5 h-5",
                getNotificationStyles(notification.type).icon
              ),
            }
          )}
          <span
            className={cn(
              "text-sm font-medium",
              getNotificationStyles(notification.type).text
            )}
          >
            {notification.message}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          icon="Flag"
          label="Total"
          value={stats.totalFlags}
          color="slate"
        />
        <StatsCard
          icon="CheckCircle"
          label="Activas"
          value={stats.enabledFlags}
          color="emerald"
        />
        <StatsCard
          icon="Shield"
          label="Core"
          value={stats.coreFlags}
          color="blue"
        />
        <StatsCard
          icon="Package"
          label="Módulos"
          value={stats.moduleFlags}
          color="green"
        />
        <StatsCard
          icon="Palette"
          label="Interfaz"
          value={stats.uiFlags}
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
                    onToggle={handleToggle}
                    dependencies={flags.filter((f) =>
                      flag.dependencies?.includes(f.id)
                    )}
                    hasChanges={false} // Ya no manejamos cambios locales
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFlags.length === 0 && !isLoading && (
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
                {stats.enabledFlags} de {stats.totalFlags} funcionalidades
                activas
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
