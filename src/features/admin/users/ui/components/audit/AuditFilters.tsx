/**
 * 🔍 AUDIT FILTERS COMPONENT
 * ===========================
 *
 * Advanced filtering panel for audit log entries
 * Extracted from AuditTab for maintainability
 *
 * FEATURES:
 * - Filter by action type
 * - Filter by severity level
 * - Filter by date range
 * - Filter by user name
 * - Active filters count badge
 * - Clear all filters
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AuditTab
 */

"use client";

import React, { useState } from "react";
import { FilterToggleButton } from "@/shared/ui/components/tabs";

/**
 * Audit Filters State Interface
 */
export interface AuditFiltersState {
  actionType: string;
  severity: string;
  dateRange: string;
  user: string;
}

/**
 * AuditFilters Props Interface
 */
export interface AuditFiltersProps {
  onFilterChange: (filters: AuditFiltersState) => void;
}

/**
 * AuditFilters Component
 *
 * Displays a dropdown panel with advanced filtering options for audit logs
 *
 * @example
 * <AuditFilters onFilterChange={handleFilterChange} />
 */
export const AuditFilters: React.FC<AuditFiltersProps> = React.memo(
  ({ onFilterChange }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<AuditFiltersState>({
      actionType: "all",
      severity: "all",
      dateRange: "7d",
      user: "",
    });

    const applyFilters = (newFilters: AuditFiltersState) => {
      setFilters(newFilters);
      onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
      const resetFilters: AuditFiltersState = {
        actionType: "all",
        severity: "all",
        dateRange: "7d",
        user: "",
      };
      applyFilters(resetFilters);
    };

    const activeFiltersCount = Object.entries(filters).filter(
      ([key, value]) => {
        if (key === "dateRange" && value === "all") return false;
        if (key === "actionType" && value === "all") return false;
        if (key === "severity" && value === "all") return false;
        if (key === "user" && !value) return false;
        return true;
      }
    ).length;

    return (
      <div className="relative">
        <FilterToggleButton
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          activeCount={activeFiltersCount}
          label="Filtros Avanzados"
        />

        {showFilters && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Filtros de Auditoría
            </h4>

            <div className="space-y-4">
              {/* Action Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Acción
                </label>
                <select
                  value={filters.actionType}
                  onChange={(e) =>
                    applyFilters({ ...filters, actionType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas las acciones</option>
                  <option value="create">Creación</option>
                  <option value="update">Actualización</option>
                  <option value="delete">Eliminación</option>
                  <option value="login">Inicio de sesión</option>
                  <option value="logout">Cierre de sesión</option>
                  <option value="ban">Baneo</option>
                  <option value="unban">Desbaneo</option>
                  <option value="role_change">Cambio de rol</option>
                  <option value="security">Seguridad</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severidad
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) =>
                    applyFilters({ ...filters, severity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas las severidades</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    applyFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1d">Último día</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                  <option value="all">Todo el período</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por usuario..."
                  value={filters.user}
                  onChange={(e) =>
                    applyFilters({ ...filters, user: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AuditFilters.displayName = "AuditFilters";
