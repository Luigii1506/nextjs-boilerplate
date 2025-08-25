/**
 * ⚡ AUDIT DASHBOARD SCREEN - TANSTACK OPTIMIZED
 * =============================================
 *
 * Dashboard principal de auditoría súper optimizado con TanStack Query.
 * Performance enterprise, cache inteligente, skeleton loading profesional.
 *
 * Enterprise: 2025-01-17 - TanStack Query audit optimization
 */

"use client";

import React from "react";
import { Card } from "@/shared/ui/components/Card";
import { Button } from "@/shared/ui/components/Button";
import { AuditStats, AuditFilters, AuditEventsList } from "../components";
import { useAuditDashboard } from "../../hooks/useAuditDashboard";
import { SkeletonStatsCard } from "@/shared/ui/components";
import { cn } from "@/shared/utils";
import {
  BarChart3,
  Activity,
  Download,
  Settings,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Database,
} from "lucide-react";

interface AuditDashboardProps {
  onViewChange?: (view: string) => void;
}

/**
 * ⚡ OPTIMIZED AUDIT DASHBOARD COMPONENT
 *
 * Dashboard súper optimizado con TanStack Query que incluye:
 * - Cache inteligente con 2min stale time
 * - Professional skeleton loading states
 * - Error boundaries y retry logic
 * - Performance indicators
 * - Enterprise UX patterns
 */
export default function AuditDashboard({ onViewChange }: AuditDashboardProps) {
  // ⚡ TanStack Query optimized dashboard hook
  const {
    // Tab management
    activeTab,
    handleTabChange,

    // Data
    events,
    stats,
    totalCount,
    currentPage,
    totalPages,
    hasMore,

    // Filters
    filters,
    resetFilters,
    activeFiltersCount,
    hasActiveFilters,

    // Loading states
    isEventsLoading,
    isStatsLoading,
    isExporting,

    // Error states
    eventsError,
    statsError,
    hasErrors,

    // Actions
    handleFiltersChange,
    handlePageChange,
    handleRefresh,
    handleExport,
    handleViewEvent,

    // Utilities
    getPageInfo,
    getActiveFiltersDisplay,
    canExport,
  } = useAuditDashboard({
    initialTab: "overview",
    enableAutoRefresh: true,
    refreshInterval: 30000,
  });

  const pageInfo = getPageInfo();
  const activeFiltersDisplay = getActiveFiltersDisplay();

  return (
    <div className="space-y-6">
      {/* ⚡ Optimized Header with Performance Indicators */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Audit Trail
            </h1>
            {/* 🚀 Performance indicators (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Database className="h-4 w-4" />
                <span>TanStack Cache</span>
                {isEventsLoading || isStatsLoading ? (
                  <span className="text-blue-600">Fetching...</span>
                ) : (
                  <span className="text-green-600">Cached</span>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Seguimiento y auditoría de actividades del sistema - Sistema
            optimizado con TanStack Query
          </p>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span>{activeFiltersCount} filtros activos:</span>
              <span className="font-medium">
                {activeFiltersDisplay.join(" • ")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button with loading state */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isEventsLoading || isStatsLoading}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (isEventsLoading || isStatsLoading) && "animate-spin"
              )}
            />
            {isEventsLoading || isStatsLoading
              ? "Actualizando..."
              : "Actualizar"}
          </Button>

          <Button
            variant="outline"
            onClick={() => onViewChange?.("settings")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* ⚡ Professional Error Display */}
      {hasErrors && (
        <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Error al cargar datos</h3>
              <div className="text-sm text-red-600 dark:text-red-300 mt-1 space-y-1">
                {eventsError && <div>Eventos: {eventsError}</div>}
                {statsError && <div>Estadísticas: {statsError}</div>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              Reintentar
            </Button>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ⚡ Enhanced Tabs with Loading States */}
      <Card className="p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => handleTabChange("overview")}
            disabled={isStatsLoading}
            className={`flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Resumen
            {isStatsLoading && (
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
            )}
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => handleTabChange("events")}
            disabled={isEventsLoading}
            className={`flex items-center gap-2 ${
              activeTab === "events"
                ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            <Activity className="h-4 w-4" />
            Eventos
            {totalCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 rounded-full">
                {totalCount.toLocaleString()}
              </span>
            )}
            {isEventsLoading && (
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
            )}
          </Button>
        </div>
      </Card>

      {/* ⚡ Content with Professional Loading States */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Stats Section */}
          {statsError ? (
            <Card className="p-8 text-center border-red-200 dark:border-red-800">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <div className="text-red-600 dark:text-red-400 mb-4">
                Error al cargar las estadísticas: {statsError}
              </div>
              <Button onClick={handleRefresh}>Reintentar</Button>
            </Card>
          ) : isStatsLoading ? (
            <div className="space-y-6">
              {/* Professional skeleton for stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonStatsCard key={i} />
                ))}
              </div>

              {/* Chart skeletons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <div className="w-32 h-6 bg-slate-300 dark:bg-slate-600 rounded mb-4 animate-pulse" />
                    <div className="w-full h-64 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : stats ? (
            <AuditStats stats={stats} />
          ) : (
            <Card className="p-8 text-center">
              <Database className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No hay datos de estadísticas disponibles
              </p>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ⚡ Enhanced Filters with Active State */}
          <AuditFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={resetFilters}
          />

          {/* Export Actions */}
          {canExport && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Exportar eventos ({totalCount.toLocaleString()} eventos)
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Descarga los eventos filtrados en tu formato preferido
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("csv")}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exportando..." : "CSV"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("json")}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exportando..." : "JSON"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ⚡ Events List with Professional Error/Loading States */}
          {eventsError ? (
            <Card className="p-8 text-center border-red-200 dark:border-red-800">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <div className="text-red-600 dark:text-red-400 mb-4">
                Error al cargar los eventos: {eventsError}
              </div>
              <div className="space-x-2">
                <Button onClick={handleRefresh}>Reintentar</Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </Card>
          ) : events.length > 0 || isEventsLoading ? (
            <AuditEventsList
              data={{
                events,
                totalCount,
                currentPage,
                totalPages,
                hasMore,
              }}
              isLoading={isEventsLoading}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onViewEvent={handleViewEvent}
            />
          ) : (
            <Card className="p-8 text-center">
              <Activity className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                No se encontraron eventos
              </p>
              {hasActiveFilters ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    Prueba ajustando los filtros o el rango de fechas
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Los eventos de auditoría aparecerán aquí cuando ocurran
                  actividades en el sistema
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
