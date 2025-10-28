"use client";
/**
 * 🎛️ useProductFiltering Hook
 * ===========================
 *
 * Custom hook for managing product filtering logic.
 * Encapsulates filter state and filtered products computation.
 *
 * @module storefront/hooks/useProductFiltering
 */

import { useState, useMemo, useCallback } from "react";
import type { ProductForCustomer } from "../types";
import { applyProductFilters, type ProductFilterOptions } from "../utils";

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  brands: string[];
  inStock: boolean;
  onSale: boolean;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  categories: [],
  priceRange: [0, 100000],
  ratings: [],
  brands: [],
  inStock: false,
  onSale: false,
};

export interface UseProductFilteringOptions {
  products: ProductForCustomer[];
  searchTerm?: string;
  initialFilters?: Partial<ProductFilters>;
}

export interface UseProductFilteringReturn {
  filters: ProductFilters;
  filteredProducts: ProductForCustomer[];
  setFilters: (filters: ProductFilters) => void;
  updateFilter: (
    key: keyof ProductFilters,
    value: string[] | [number, number] | boolean
  ) => void;
  toggleCategory: (categoryId: string) => void;
  toggleRating: (rating: number) => void;
  toggleBrand: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing product filtering
 */
export function useProductFiltering({
  products,
  searchTerm = "",
  initialFilters = {},
}: UseProductFilteringOptions): UseProductFilteringReturn {
  const [filters, setFilters] = useState<ProductFilters>({
    ...DEFAULT_PRODUCT_FILTERS,
    ...initialFilters,
  });

  // Apply all filters
  const filteredProducts = useMemo(() => {
    const filterOptions: ProductFilterOptions = {
      searchTerm,
      categories: filters.categories,
      priceRange: filters.priceRange,
      ratings: filters.ratings,
      brands: filters.brands,
      inStock: filters.inStock,
      onSale: filters.onSale,
    };

    return applyProductFilters(products, filterOptions);
  }, [products, searchTerm, filters]);

  // Update a single filter
  const updateFilter = useCallback(
    (
      key: keyof ProductFilters,
      value: string[] | [number, number] | boolean
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Toggle category filter
  const toggleCategory = useCallback((categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  }, []);

  // Toggle rating filter
  const toggleRating = useCallback((rating: number) => {
    setFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter((r) => r !== rating)
        : [...prev.ratings, rating],
    }));
  }, []);

  // Toggle brand filter
  const toggleBrand = useCallback((brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  // Set price range
  const setPriceRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_PRODUCT_FILTERS);
  }, []);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (
      filters.priceRange[0] > DEFAULT_PRODUCT_FILTERS.priceRange[0] ||
      filters.priceRange[1] < DEFAULT_PRODUCT_FILTERS.priceRange[1]
    )
      count++;
    if (filters.ratings.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    filteredProducts,
    setFilters,
    updateFilter,
    toggleCategory,
    toggleRating,
    toggleBrand,
    setPriceRange,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
