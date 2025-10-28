"use client";
/**
 * 📊 useCategorySorting Hook
 * ==========================
 *
 * Custom hook for managing category sorting logic.
 * Encapsulates sort state and sorted categories computation.
 *
 * @module storefront/hooks/useCategorySorting
 */

import { useState, useMemo, useCallback } from "react";
import type { CategoryForCustomer } from "../types";
import { sortCategories, type CategorySortOption } from "../utils";

export interface UseCategorySortingOptions {
  categories: CategoryForCustomer[];
  initialSortBy?: CategorySortOption;
}

export interface UseCategorySortingReturn {
  sortBy: CategorySortOption;
  sortedCategories: CategoryForCustomer[];
  setSortBy: (sortBy: CategorySortOption) => void;
}

/**
 * Hook for managing category sorting
 */
export function useCategorySorting({
  categories,
  initialSortBy = "popularity",
}: UseCategorySortingOptions): UseCategorySortingReturn {
  const [sortBy, setSortBy] = useState<CategorySortOption>(initialSortBy);

  // Apply sorting
  const sortedCategories = useMemo(() => {
    return sortCategories(categories, sortBy);
  }, [categories, sortBy]);

  const handleSetSortBy = useCallback((newSortBy: CategorySortOption) => {
    setSortBy(newSortBy);
  }, []);

  return {
    sortBy,
    sortedCategories,
    setSortBy: handleSetSortBy,
  };
}
