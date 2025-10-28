"use client";
/**
 * 📊 useProductSorting Hook
 * =========================
 *
 * Custom hook for managing product sorting logic.
 * Encapsulates sort state and sorted products computation.
 *
 * @module storefront/hooks/useProductSorting
 */

import { useState, useMemo, useCallback } from "react";
import type { ProductForCustomer } from "../types";
import { sortProducts, type ProductSortOption } from "../utils";

export interface UseProductSortingOptions {
  products: ProductForCustomer[];
  initialSortBy?: ProductSortOption;
}

export interface UseProductSortingReturn {
  sortBy: ProductSortOption;
  sortedProducts: ProductForCustomer[];
  setSortBy: (sortBy: ProductSortOption) => void;
}

/**
 * Hook for managing product sorting
 */
export function useProductSorting({
  products,
  initialSortBy = "relevance",
}: UseProductSortingOptions): UseProductSortingReturn {
  const [sortBy, setSortBy] = useState<ProductSortOption>(initialSortBy);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortBy);
  }, [products, sortBy]);

  const handleSetSortBy = useCallback((newSortBy: ProductSortOption) => {
    setSortBy(newSortBy);
  }, []);

  return {
    sortBy,
    sortedProducts,
    setSortBy: handleSetSortBy,
  };
}
