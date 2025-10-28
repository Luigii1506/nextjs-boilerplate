/**
 * 📋 AUDIT ACTIVITIES TAB
 * =======================
 *
 * Lista completa de eventos de auditoría con filtros,
 * búsqueda y paginación
 *
 * REFACTORED: 2025-01-27 - Using shared components and extracted components
 * - TabHeader, TabWrapper for consistent layout
 * - Extracted EventRow, SeverityBadge, EventsPagination
 * - Reduced from ~360 to ~150 lines
 *
 * Created: 2025-01-18 - Audit Activities Tab
 */

"use client";

import React, { useState } from "react";
import { Activity, Filter, Download, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditEvent, AuditFilters } from "../../../types";
import { AuditFilters as AuditFiltersComponent } from "../AuditFilters";
import { TabHeader, TabWrapper, TabLoadingSkeleton } from "@/shared/ui/components";
import { EventRow, EventsPagination } from "../activities";

interface ActivitiesTabProps {
  events: AuditEvent[];
  filters: AuditFilters;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onFiltersChange: (filters: AuditFilters) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onViewEvent: (event: AuditEvent) => void;
  onExport?: (format: "csv" | "json") => void;
  onRefresh?: () => void;
}


/**
 * 🎯 Main Activities Tab Component
 */
export default function ActivitiesTab({
  events,
  filters,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  onFiltersChange,
  onResetFilters,
  onPageChange,
  onViewEvent,
  onExport,
  onRefresh,
}: ActivitiesTabProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchQuery, page: 1 });
  };

  // Build header actions
  const headerActions = [
    ...(onRefresh
      ? [
          {
            label: "Actualizar",
            icon: (
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
            ),
            onClick: onRefresh,
            variant: "secondary" as const,
            disabled: isLoading,
          },
        ]
      : []),
    {
      label: "Filtros",
      icon: <Filter className="w-4 h-4" />,
      onClick: () => setShowFilters(!showFilters),
      variant: "secondary" as const,
      className: showFilters
        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
        : "",
    },
  ];

  // Build export actions
  const exportActions = onExport ? (
    <div className="flex gap-2">
      <button
        onClick={() => onExport("csv")}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        CSV
      </button>
      <button
        onClick={() => onExport("json")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        JSON
      </button>
    </div>
  ) : undefined;

  return (
    <TabWrapper>
      <TabHeader
        icon={<Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Registro de Actividades"
        description={`${totalCount.toLocaleString()} eventos registrados`}
        actions={headerActions}
        customActions={exportActions}
      />

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos por descripción, usuario, recurso..."
            className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Buscar
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <AuditFiltersComponent
            filters={filters}
            onFiltersChange={onFiltersChange}
            onReset={onResetFilters}
          />
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {isLoading ? (
          <TabLoadingSkeleton type="list" rows={5} />
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventRow key={event.id} event={event} onView={onViewEvent} />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay eventos que coincidan con los filtros actuales
            </p>
            {(filters.search ||
              filters.action ||
              filters.resource ||
              filters.severity) && (
              <button
                onClick={onResetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <EventsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </TabWrapper>
  );
}
