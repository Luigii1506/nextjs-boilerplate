/**
 * 🔍 USER FILTERS COMPONENT
 * ==========================
 *
 * Advanced filtering panel for users list
 * Extracted from AllUsersTab for maintainability
 *
 * FEATURES:
 * - Filter by role (super_admin, admin, moderator, user)
 * - Filter by status (active, banned)
 * - Filter by date range
 * - Clear all filters
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AllUsersTab
 */

"use client";

import React, { useState } from "react";
import { Filter } from "lucide-react";

/**
 * User Filters State Interface
 */
export interface UserFiltersState {
  role: string;
  status: string;
  dateRange: string;
}

/**
 * UserFilters Props Interface
 */
export interface UserFiltersProps {
  onFilterChange: (filters: UserFiltersState) => void;
}

/**
 * UserFilters Component
 *
 * Displays a dropdown panel with advanced filtering options
 *
 * @example
 * <UserFilters onFilterChange={handleFilterChange} />
 */
export const UserFilters: React.FC<UserFiltersProps> = React.memo(
  ({ onFilterChange }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<UserFiltersState>({
      role: "all",
      status: "all",
      dateRange: "all",
    });

    const applyFilters = (newFilters: UserFiltersState) => {
      setFilters(newFilters);
      onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
      const resetFilters: UserFiltersState = {
        role: "all",
        status: "all",
        dateRange: "all",
      };
      applyFilters(resetFilters);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>

        {showFilters && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Filtros Avanzados
            </h4>

            <div className="space-y-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={filters.role}
                  onChange={(e) =>
                    applyFilters({ ...filters, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    applyFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="banned">Baneados</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período de registro
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    applyFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los períodos</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="year">Este año</option>
                </select>
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

UserFilters.displayName = "UserFilters";
