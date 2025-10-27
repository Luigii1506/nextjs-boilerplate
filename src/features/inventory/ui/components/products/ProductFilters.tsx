/**
 * 🔍 PRODUCT FILTERS COMPONENT
 * =============================
 *
 * Reusable filter component for product search and filtering
 * Extracted from ProductsTab for maintainability and reusability
 *
 * FEATURES:
 * - Search bar for product name, SKU, and barcode
 * - Filter toggle with advanced filter panel
 * - Active filters count badge
 * - View mode toggle (grid/list)
 * - Add new product action button
 * - Active filters bar with remove capabilities
 * - Advanced filter panel with all filter options
 *
 * Created: 2025-01-27 - Extracted from ProductsTab
 */

"use client";

import React, { useState, useMemo } from "react";
import { Plus, Filter, Grid3X3, List } from "lucide-react";
import { cn } from "@/shared/utils";
import { TabSearchBar, type ViewMode } from "@/shared/ui/components/tabs";
import { AdvancedFilterPanel } from "../filters/AdvancedFilterPanel";
import { ActiveFiltersBar } from "../filters/ActiveFiltersBar";
import type {
  ProductFilters as ProductFiltersType,
  CategoryWithRelations,
  SupplierWithRelations,
} from "../../../types";

/**
 * ProductFilters component props
 */
export interface ProductFiltersProps {
  /** Global search term for product name, SKU, barcode */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Current product filters */
  filters: ProductFiltersType;
  /** Callback when filters change */
  onFiltersChange: (filters: ProductFiltersType) => void;
  /** Callback to clear all filters */
  onClearAllFilters: () => void;
  /** Current view mode */
  viewMode: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** Callback when add product button is clicked */
  onAddProduct: () => void;
  /** Available categories for filtering */
  categories: CategoryWithRelations[];
  /** Available suppliers for filtering */
  suppliers: SupplierWithRelations[];
}

/**
 * ProductFilters Component
 *
 * Displays filter controls for product management including search,
 * advanced filters, view mode, and actions
 *
 * @param searchTerm - Current search term
 * @param onSearchChange - Handler for search term changes
 * @param filters - Current product filters
 * @param onFiltersChange - Handler for filter changes
 * @param onClearAllFilters - Handler to clear all filters
 * @param viewMode - Current view mode (grid/list)
 * @param onViewModeChange - Handler for view mode changes
 * @param onAddProduct - Handler for add product button
 * @param categories - Available categories
 * @param suppliers - Available suppliers
 *
 * @example
 * <ProductFilters
 *   searchTerm={globalSearchTerm}
 *   onSearchChange={setGlobalSearchTerm}
 *   filters={productFilters}
 *   onFiltersChange={setProductFilters}
 *   onClearAllFilters={clearAllFilters}
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 *   onAddProduct={() => setIsProductModalOpen(true)}
 *   categories={categories}
 *   suppliers={suppliers}
 * />
 */
export const ProductFilters: React.FC<ProductFiltersProps> = React.memo(
  ({
    searchTerm,
    onSearchChange,
    filters,
    onFiltersChange,
    onClearAllFilters,
    viewMode,
    onViewModeChange,
    onAddProduct,
    categories,
    suppliers,
  }) => {
    const [showFilters, setShowFilters] = useState(false);

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
      return Object.entries(filters).filter(([key, value]) => {
        if (key === "search") return false; // Don't count search
        if (value === undefined || value === null) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      }).length;
    }, [filters]);

    // Handle filter removal
    const handleFilterRemove = (key: keyof ProductFiltersType) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    };

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Primary Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <TabSearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar productos por nombre, SKU o código de barras..."
              />
            </div>

            <div className="flex items-center space-x-2">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-4 py-3 border rounded-lg flex items-center space-x-2 transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  showFilters || activeFiltersCount > 0
                    ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                )}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "px-3 py-3 flex items-center transition-colors",
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "px-3 py-3 flex items-center border-l border-gray-300 dark:border-gray-600 transition-colors",
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={onAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <ActiveFiltersBar
            filters={filters}
            onFilterRemove={handleFilterRemove}
            onClearAll={onClearAllFilters}
            categories={categories}
            suppliers={suppliers}
          />
        )}

        {/* Advanced Filter Panel */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            showFilters ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {showFilters && (
            <AdvancedFilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              categories={categories}
              suppliers={suppliers}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>
      </div>
    );
  }
);

ProductFilters.displayName = "ProductFilters";
