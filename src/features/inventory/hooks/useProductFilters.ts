"use client";
/**
 * 🔍 USE PRODUCT FILTERS HOOK
 * ===========================
 *
 * Custom hook for managing product filtering logic
 * Encapsulates filter state and filtered product calculations
 *
 * USAGE:
 * const { filteredProducts, filters, setFilters, activeCount } = useProductFilters()
 *
 * Created: 2025-01-27 - Inventory Hooks Refactor
 */

import { useState, useMemo, useCallback } from "react";
import { useInventoryContext } from "../context";
import type { ProductWithRelations } from "../types";

/**
 * Product filter criteria
 */
export interface ProductFilters {
  categoryId?: string;
  supplierId?: string;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "CRITICAL_STOCK" | "OUT_OF_STOCK";
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  tags?: string[];
}

/**
 * Hook return type
 */
export interface UseProductFiltersReturn {
  filteredProducts: ProductWithRelations[];
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  updateFilter: (key: keyof ProductFilters, value: unknown) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFiltering: boolean;
}

/**
 * Custom hook for product filtering with search
 *
 * @returns Filtering state and utilities
 *
 * @example
 * const ProductList = () => {
 *   const {
 *     filteredProducts,
 *     filters,
 *     updateFilter,
 *     searchTerm,
 *     setSearchTerm
 *   } = useProductFilters()
 *
 *   return (
 *     <>
 *       <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 *       <select onChange={(e) => updateFilter('categoryId', e.target.value)}>...</select>
 *       {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
 *     </>
 *   )
 * }
 */
export const useProductFilters = (): UseProductFiltersReturn => {
  const { inventory } = useInventoryContext();
  const { products } = inventory;

  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key as keyof ProductFilters];
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  // Update single filter
  const updateFilter = useCallback(
    (key: keyof ProductFilters, value: unknown) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          product.barcode?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      result = result.filter(
        (product) => product.categoryId === filters.categoryId
      );
    }

    // Apply supplier filter
    if (filters.supplierId) {
      result = result.filter(
        (product) => product.supplierId === filters.supplierId
      );
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      result = result.filter((product) => {
        const status =
          product.stock === 0
            ? "OUT_OF_STOCK"
            : product.stock <= 2
            ? "CRITICAL_STOCK"
            : product.stock <= product.minStock
            ? "LOW_STOCK"
            : "IN_STOCK";
        return status === filters.stockStatus;
      });
    }

    // Apply price range filter
    if (filters.priceMin !== undefined) {
      result = result.filter((product) => product.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      result = result.filter((product) => product.price <= filters.priceMax!);
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      result = result.filter(
        (product) => product.isActive === filters.isActive
      );
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((product) =>
        filters.tags!.some((tag) => product.tags.includes(tag))
      );
    }

    return result;
  }, [products, searchTerm, filters]);

  return {
    filteredProducts,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    activeFiltersCount,
    searchTerm,
    setSearchTerm,
    isFiltering: activeFiltersCount > 0 || searchTerm.length > 0,
  };
};
