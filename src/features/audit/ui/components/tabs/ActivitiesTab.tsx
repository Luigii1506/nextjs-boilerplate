/**
 * 📋 AUDIT ACTIVITIES TAB
 * =======================
 *
 * Lista completa de eventos de auditoría con filtros,
 * búsqueda y paginación
 *
 * Created: 2025-01-18 - Audit Activities Tab
 */

"use client";

import React, { useState } from "react";
import {
  Activity,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditEvent, AuditFilters } from "../../../types";
import { AuditFilters as AuditFiltersComponent } from "../AuditFilters";

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
 * 🎨 Severity Badge Component
 */
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const severityConfig = {
    critical: {
      icon: XCircle,
      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      label: "Crítico",
    },
    high: {
      icon: AlertCircle,
      className:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      label: "Alto",
    },
    medium: {
      icon: AlertTriangle,
      className:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      label: "Medio",
    },
    low: {
      icon: CheckCircle,
      className:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      label: "Bajo",
    },
  };

  const config =
    severityConfig[severity as keyof typeof severityConfig] ||
    severityConfig.low;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * 📝 Event Row Component
 */
const EventRow: React.FC<{
  event: AuditEvent;
  onView: (event: AuditEvent) => void;
}> = ({ event, onView }) => {
  return (
    <div
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
      onClick={() => onView(event)}
    >
      {/* Left: Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <SeverityBadge severity={event.severity} />
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
            {event.action}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
            {event.resource}
          </span>
        </div>

        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
          {event.description || `${event.action} on ${event.resource}`}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{event.userEmail}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(event.createdAt).toLocaleString()}</span>
          </div>
          {event.ipAddress && (
            <span className="text-xs">IP: {event.ipAddress}</span>
          )}
        </div>
      </div>

      {/* Right: View Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(event);
        }}
        className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Eye className="w-5 h-5" />
      </button>
    </div>
  );
};

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Registro de Actividades
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalCount.toLocaleString()} eventos registrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
              Actualizar
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
              showFilters
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {onExport && (
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
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos por descripción, usuario, recurso..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24 animate-pulse"
              />
            ))}
          </div>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando página {currentPage} de {totalPages} ({totalCount}{" "}
            eventos totales)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-colors",
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
