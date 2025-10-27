"use client";

/**
 * 🏷️ USE CATEGORY FILTERS HOOK
 * =============================
 *
 * Custom hook for managing category filtering logic
 * Encapsulates filter state and filtered category calculations
 *
 * USAGE:
 * const { filteredCategories, searchTerm, showInactive } = useCategoryFilters()
 *
 * Created: 2025-01-27 - Inventory Hooks Refactor
 */

import { useState, useMemo } from "react";
import type { CategoryWithRelations } from "../types";

/**
 * Category filter options
 */
export interface CategoryFilterOptions {
  showInactive?: boolean;
  parentId?: string | null;
  sortBy?: "name" | "productCount" | "sortOrder";
  sortOrder?: "asc" | "desc";
}

/**
 * Hook return type
 */
export interface UseCategoryFiltersReturn {
  filteredCategories: CategoryWithRelations[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  filterOptions: CategoryFilterOptions;
  setFilterOptions: (options: CategoryFilterOptions) => void;
  activeFiltersCount: number;
  clearFilters: () => void;
}

/**
 * Custom hook for category filtering and search
 *
 * @param categories - Array of categories to filter
 * @returns Filtering state and utilities
 *
 * @example
 * const CategoryList = () => {
 *   const {
 *     filteredCategories,
 *     searchTerm,
 *     setSearchTerm,
 *     showInactive,
 *     setShowInactive
 *   } = useCategoryFilters(categories)
 *
 *   return (
 *     <>
 *       <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 *       <checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
 *       {filteredCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
 *     </>
 *   )
 * }
 */
export const useCategoryFilters = (
  categories: CategoryWithRelations[]
): UseCategoryFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [filterOptions, setFilterOptions] = useState<CategoryFilterOptions>({
    sortBy: "sortOrder",
    sortOrder: "asc",
  });

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (showInactive) count++;
    if (filterOptions.parentId !== undefined) count++;
    return count;
  }, [searchTerm, showInactive, filterOptions.parentId]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setShowInactive(false);
    setFilterOptions({
      sortBy: "sortOrder",
      sortOrder: "asc",
    });
  };

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(term) ||
          category.description?.toLowerCase().includes(term)
      );
    }

    // Apply active filter
    if (!showInactive) {
      result = result.filter((category) => category.isActive);
    }

    // Apply parent filter
    if (filterOptions.parentId !== undefined) {
      result = result.filter(
        (category) => category.parentId === filterOptions.parentId
      );
    }

    // Apply sorting
    const sortBy = filterOptions.sortBy || "sortOrder";
    const sortOrder = filterOptions.sortOrder || "asc";

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "productCount":
          comparison = (a._count?.products || 0) - (b._count?.products || 0);
          break;
        case "sortOrder":
        default:
          comparison = a.sortOrder - b.sortOrder;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [categories, searchTerm, showInactive, filterOptions]);

  return {
    filteredCategories,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    filterOptions,
    setFilterOptions,
    activeFiltersCount,
    clearFilters,
  };
};
