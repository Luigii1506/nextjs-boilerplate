/**
 * 🔍 CATEGORY FILTERS COMPONENT
 * ==============================
 *
 * Reusable filter component for category search and filtering
 * Extracted from CategoriesTab for maintainability and reusability
 *
 * FEATURES:
 * - Search bar for category name filtering
 * - View mode toggle (grid/list)
 * - Filter toggle with expandable filter options
 * - Show inactive categories toggle
 * - Add new category action button
 * - Responsive design with dark mode support
 *
 * Created: 2025-01-27 - Extracted from CategoriesTab
 */

"use client";

import React from "react";
import { FolderPlus } from "lucide-react";
import {
  TabSearchBar,
  ViewModeToggle,
  FilterToggleButton,
  type ViewMode,
} from "@/shared/ui/components/tabs";

/**
 * CategoryFilters component props
 */
export interface CategoryFiltersProps {
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Whether to show inactive categories */
  showInactive: boolean;
  /** Callback when show inactive toggle changes */
  onShowInactiveChange: (show: boolean) => void;
  /** Whether filter panel is open */
  isFilterOpen: boolean;
  /** Callback when filter toggle is clicked */
  onFilterToggle: () => void;
  /** Current view mode */
  viewMode: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** Callback when add category button is clicked */
  onAddCategory: () => void;
}

/**
 * CategoryFilters Component
 *
 * Displays filter controls for category management including search,
 * view mode, and filter options
 *
 * @param searchTerm - Current search term
 * @param onSearchChange - Handler for search term changes
 * @param showInactive - Whether inactive categories are shown
 * @param onShowInactiveChange - Handler for show inactive toggle
 * @param isFilterOpen - Whether filter panel is expanded
 * @param onFilterToggle - Handler for filter panel toggle
 * @param viewMode - Current view mode (grid/list)
 * @param onViewModeChange - Handler for view mode changes
 * @param onAddCategory - Handler for add category button
 *
 * @example
 * <CategoryFilters
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   showInactive={showInactive}
 *   onShowInactiveChange={setShowInactive}
 *   isFilterOpen={isFilterOpen}
 *   onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 *   onAddCategory={() => setIsCategoryModalOpen(true)}
 * />
 */
export const CategoryFilters: React.FC<CategoryFiltersProps> = React.memo(
  ({
    searchTerm,
    onSearchChange,
    showInactive,
    onShowInactiveChange,
    isFilterOpen,
    onFilterToggle,
    viewMode,
    onViewModeChange,
    onAddCategory,
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {/* Top Row - Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <TabSearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar categorías por nombre..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />

            {/* Filter Toggle */}
            <FilterToggleButton
              isOpen={isFilterOpen}
              onToggle={onFilterToggle}
              activeCount={showInactive ? 1 : 0}
            />

            {/* Add Category */}
            <button
              onClick={onAddCategory}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Categoría</span>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isFilterOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-fadeInDown">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Show Inactive */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => onShowInactiveChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="showInactive"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Mostrar inactivas
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CategoryFilters.displayName = "CategoryFilters";
