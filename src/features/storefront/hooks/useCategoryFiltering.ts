"use client";
/**
 * 🎛️ useCategoryFiltering Hook
 * ============================
 *
 * Custom hook for managing category filtering logic.
 * Encapsulates filter state and filtered categories computation.
 *
 * @module storefront/hooks/useCategoryFiltering
 */

import { useState, useMemo, useCallback } from "react";
import type { CategoryForCustomer } from "../types";
import { applyCategoryFilters, type CategoryFilterOptions } from "../utils";

export interface CategoryFilters {
  searchTerm: string;
  productCountRange: [number, number];
  showFeatured: boolean;
  showPopular: boolean;
}

export const DEFAULT_CATEGORY_FILTERS: CategoryFilters = {
  searchTerm: "",
  productCountRange: [0, 1000],
  showFeatured: false,
  showPopular: false,
};

export interface UseCategoryFilteringOptions {
  categories: CategoryForCustomer[];
  initialFilters?: Partial<CategoryFilters>;
}

export interface UseCategoryFilteringReturn {
  filters: CategoryFilters;
  filteredCategories: CategoryForCustomer[];
  setFilters: (filters: CategoryFilters) => void;
  updateFilter: (
    key: keyof CategoryFilters,
    value: string | [number, number] | boolean
  ) => void;
  setProductCountRange: (range: [number, number]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing category filtering
 */
export function useCategoryFiltering({
  categories,
  initialFilters = {},
}: UseCategoryFilteringOptions): UseCategoryFilteringReturn {
  const [filters, setFilters] = useState<CategoryFilters>({
    ...DEFAULT_CATEGORY_FILTERS,
    ...initialFilters,
  });

  // Apply all filters
  const filteredCategories = useMemo(() => {
    const filterOptions: CategoryFilterOptions = {
      searchTerm: filters.searchTerm,
      productCountRange: filters.productCountRange,
      showFeatured: filters.showFeatured,
      showPopular: filters.showPopular,
    };

    return applyCategoryFilters(categories, filterOptions);
  }, [categories, filters]);

  // Update a single filter
  const updateFilter = useCallback(
    (
      key: keyof CategoryFilters,
      value: string | [number, number] | boolean
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Set product count range
  const setProductCountRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, productCountRange: range }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_CATEGORY_FILTERS);
  }, []);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (
      filters.productCountRange[0] >
        DEFAULT_CATEGORY_FILTERS.productCountRange[0] ||
      filters.productCountRange[1] <
        DEFAULT_CATEGORY_FILTERS.productCountRange[1]
    )
      count++;
    if (filters.showFeatured) count++;
    if (filters.showPopular) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    filteredCategories,
    setFilters,
    updateFilter,
    setProductCountRange,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
