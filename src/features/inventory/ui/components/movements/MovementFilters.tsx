/**
 * 🔍 MOVEMENT FILTERS COMPONENT
 * ===============================
 *
 * Filter controls for movements with search and type filtering
 * Extracted from MovementsTab for maintainability
 *
 * FEATURES:
 * - Search bar for product/SKU/reason filtering
 * - Movement type filter pills
 * - Toggle for showing/hiding filters
 * - Active filter count indicator
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from MovementsTab
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { TabSearchBar, FilterToggleButton } from "@/shared/ui/components/tabs";
import { MovementType, MOVEMENT_TYPE_CONFIG } from "./movementConfig";

/**
 * MovementFilters component props
 */
export interface MovementFiltersProps {
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Selected movement type filter */
  selectedType: MovementType;
  /** Callback when type filter changes */
  onTypeChange: (type: MovementType) => void;
  /** Whether filter panel is expanded */
  showFilters: boolean;
  /** Callback to toggle filter panel */
  onToggleFilters: () => void;
}

/**
 * MovementFilters Component
 *
 * Displays search and filter controls for stock movements
 *
 * @param searchTerm - Current search term
 * @param onSearchChange - Handler for search changes
 * @param selectedType - Currently selected movement type
 * @param onTypeChange - Handler for type filter changes
 * @param showFilters - Whether filters are expanded
 * @param onToggleFilters - Handler to toggle filters
 *
 * @example
 * <MovementFilters
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   selectedType={selectedType}
 *   onTypeChange={setSelectedType}
 *   showFilters={showFilters}
 *   onToggleFilters={() => setShowFilters(!showFilters)}
 * />
 */
export const MovementFilters: React.FC<MovementFiltersProps> = React.memo(
  ({
    searchTerm,
    onSearchChange,
    selectedType,
    onTypeChange,
    showFilters,
    onToggleFilters,
  }) => {
    return (
      <div className="space-y-3">
        {/* Search & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <TabSearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por producto, SKU o razón..."
          />

          {/* Type Filter */}
          <div className="flex gap-2">
            <FilterToggleButton
              isOpen={showFilters}
              onToggle={onToggleFilters}
              activeCount={selectedType !== "ALL" ? 1 : 0}
              label="Filtros"
            />
          </div>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-fadeInDown">
            {(["ALL", "IN", "OUT", "ADJUSTMENT"] as MovementType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedType === type
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  )}
                >
                  {type === "ALL" ? "Todos" : MOVEMENT_TYPE_CONFIG[type]?.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);

MovementFilters.displayName = "MovementFilters";
